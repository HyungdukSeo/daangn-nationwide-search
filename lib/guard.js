// API 보호 계층: CORS 제한 · 동일 출처 확인 · IP별 rate limit · 동시 검색 수 제한 · (선택) 토큰
//
// 환경변수 (모두 선택)
//   API_TOKEN            설정하면 `x-api-token` 헤더로 이 값을 보낸 외부 호출은 출처 확인을 건너뜀
//   ALLOWED_ORIGINS      CORS를 허용할 출처 목록 (쉼표 구분, 예: https://a.example,https://b.example)
//   ALLOW_ANY_ORIGIN=1   동일 출처 확인을 끔 (권장하지 않음)
//   TRUST_PROXY=1        리버스 프록시 뒤에서 x-forwarded-for / x-real-ip 를 클라이언트 IP로 신뢰
//   RATE_LIMIT_SEARCH    IP당 분당 /api/search 허용 횟수 (기본 30)
//   RATE_LIMIT_REGIONS   IP당 분당 /api/regions 허용 횟수 (기본 60)
//   RATE_LIMIT_HUBS      IP당 분당 /api/hubs 허용 횟수 (기본 120)
//   MAX_CONCURRENT_SEARCH 인스턴스당 동시 진행 검색 수 (기본 4)
//
// 한계: 동일 출처 확인(Sec-Fetch-Site/Origin/Referer)은 curl 등 비브라우저 클라이언트가 위조할 수 있으므로
// 속도 제한을 늦추는 장치일 뿐입니다. 서버리스에서는 rate limit 상태가 인스턴스별로 따로 유지됩니다.
// 확실한 차단이 필요하면 API_TOKEN 과 플랫폼 차원의 방화벽/레이트리밋을 함께 사용하세요.

const crypto = require('crypto');

const WINDOW_MS = 60 * 1000;
const MAX_BUCKETS = 10000;

function intEnv(name, fallback) {
  const n = parseInt(process.env[name], 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const LIMITS = {
  search: () => intEnv('RATE_LIMIT_SEARCH', 90),
  regions: () => intEnv('RATE_LIMIT_REGIONS', 120),
  hubs: () => intEnv('RATE_LIMIT_HUBS', 180)
};

const buckets = new Map(); // `${route}:${ip}` -> timestamp[]
let lastSweep = 0;
let activeSearches = 0;

function header(headers, name) {
  const v = headers[name];
  return Array.isArray(v) ? v[0] : v;
}

function hostOf(url) {
  try { return new URL(url).host; } catch { return null; }
}

function allowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
}

function clientIp(headers, socketAddr) {
  // 플랫폼이 직접 덮어쓰는 헤더만 기본 신뢰. 그 외 XFF 류는 TRUST_PROXY=1 일 때만 사용 (위조 방지)
  const platform = header(headers, 'x-vercel-forwarded-for') || header(headers, 'x-nf-client-connection-ip');
  if (platform) return platform.split(',')[0].trim();
  if (process.env.TRUST_PROXY === '1') {
    const fwd = header(headers, 'x-real-ip') || (header(headers, 'x-forwarded-for') || '').split(',')[0].trim();
    if (fwd) return fwd;
  }
  return socketAddr || 'unknown';
}

function sweep(now) {
  if (now - lastSweep < WINDOW_MS && buckets.size <= MAX_BUCKETS) return;
  lastSweep = now;
  for (const [key, stamps] of buckets) {
    if (!stamps.length || now - stamps[stamps.length - 1] > WINDOW_MS) buckets.delete(key);
  }
  // 그래도 많으면 오래된 것부터 제거 (Map은 삽입 순서 유지)
  while (buckets.size > MAX_BUCKETS) {
    buckets.delete(buckets.keys().next().value);
  }
}

function takeRateToken(route, ip, now = Date.now()) {
  sweep(now);
  const key = `${route}:${ip}`;
  const limit = LIMITS[route] ? LIMITS[route]() : 60;
  const stamps = (buckets.get(key) || []).filter(t => now - t < WINDOW_MS);
  if (stamps.length >= limit) {
    buckets.set(key, stamps);
    return { ok: false, retryAfter: Math.max(1, Math.ceil((WINDOW_MS - (now - stamps[0])) / 1000)) };
  }
  stamps.push(now);
  buckets.set(key, stamps);
  return { ok: true };
}

function tokenValid(headers) {
  const expected = process.env.API_TOKEN;
  if (!expected) return false;
  const given = header(headers, 'x-api-token');
  if (!given) return false;
  const a = Buffer.from(String(given));
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function isSameOrigin(headers) {
  if (process.env.ALLOW_ANY_ORIGIN === '1') return true;
  const host = header(headers, 'host');
  const origin = header(headers, 'origin');
  const referer = header(headers, 'referer');
  const fetchSite = header(headers, 'sec-fetch-site');

  if (origin) {
    if (allowedOrigins().includes(origin)) return true;
    return hostOf(origin) === host;
  }
  if (fetchSite === 'cross-site') return false;
  if (referer && hostOf(referer) !== host) return false;
  return true;
}

// CORS 헤더: 허용 목록에 있는 출처만 반사. 동일 출처 요청에는 CORS 헤더가 필요 없음.
function corsHeaders(headers) {
  const origin = header(headers, 'origin');
  const out = { Vary: 'Origin' };
  if (origin && allowedOrigins().includes(origin)) {
    out['Access-Control-Allow-Origin'] = origin;
    out['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
    out['Access-Control-Allow-Headers'] = 'Content-Type, X-API-Token';
  }
  return out;
}

/**
 * @param {{headers: object, socketAddr?: string, route: 'search'|'regions'|'hubs'}} input
 * @returns {{ok:true, release:()=>void, headers:object} | {ok:false, status:number, error:string, headers:object}}
 */
function guard({ headers, socketAddr, route }) {
  const cors = corsHeaders(headers);

  if (!tokenValid(headers) && !isSameOrigin(headers)) {
    return { ok: false, status: 403, error: '허용되지 않은 출처의 요청입니다.', headers: cors };
  }

  const ip = clientIp(headers, socketAddr);
  const rate = takeRateToken(route, ip);
  if (!rate.ok) {
    return {
      ok: false,
      status: 429,
      error: `요청이 너무 많습니다. ${rate.retryAfter}초 후 다시 시도해 주세요.`,
      headers: { ...cors, 'Retry-After': String(rate.retryAfter) }
    };
  }

  if (route === 'search') {
    const maxConcurrent = intEnv('MAX_CONCURRENT_SEARCH', 8);
    if (activeSearches >= maxConcurrent) {
      return {
        ok: false,
        status: 503,
        error: '현재 검색 요청이 몰려 있습니다. 잠시 후 다시 시도해 주세요.',
        headers: { ...cors, 'Retry-After': '3' }
      };
    }
    activeSearches++;
    let released = false;
    return {
      ok: true,
      headers: cors,
      release: () => {
        if (!released) { released = true; activeSearches--; }
      }
    };
  }

  return { ok: true, headers: cors, release: () => {} };
}

// Node http / Vercel 스타일 (req, res) 용 헬퍼. 거부하면 응답까지 보내고 null 반환.
function guardNode(req, res, route) {
  const result = guard({ headers: req.headers, socketAddr: req.socket && req.socket.remoteAddress, route });
  for (const [k, v] of Object.entries(result.headers)) res.setHeader(k, v);
  if (!result.ok) {
    res.statusCode = result.status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: result.error }));
    return null;
  }
  // 클라이언트가 중간에 끊으면 동시 실행 슬롯을 즉시 반환
  res.on('close', result.release);
  return result.release;
}

module.exports = { guard, guardNode, clientIp };
