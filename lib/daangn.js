// 당근 내부 Rate Limit(단일 IP당 순간 최대 ~20회 요청 제한)을 넘지 않으면서
// 광역 반경으로 전국 17개 시도를 빠짐없이 커버하는 12개 광역 핵심 거점
const DEFAULT_HUBS = [
  // 서울 (강남/동남권 + 강북/서남권 2개 광역 거점으로 서울 전역 커버)
  { id: '6035', name: '역삼동', label: '서울 강남/서초/송파', group: '서울', fullName: '서울특별시 강남구 역삼동' },
  { id: '230',  name: '서교동', label: '서울 마포/강서/강북/관악', group: '서울', fullName: '서울특별시 마포구 서교동' },

  // 경기 / 인천 (경기남부 + 경기북부/동부 + 인천 3개 광역 거점)
  { id: '1291', name: '인계동', label: '경기 수원/분당/화성/용인', group: '경기·인천', fullName: '경기도 수원시 팔달구 인계동' },
  { id: '1568', name: '대화동', label: '경기 일산/부천/안양/남양주', group: '경기·인천', fullName: '경기도 고양시 일산서구 대화동' },
  { id: '6543', name: '송도동', label: '인천 연수/부평/서구', group: '경기·인천', fullName: '인천광역시 연수구 송도동' },

  // 충청 / 대전 / 세종
  { id: '2292', name: '불당동', label: '충남 천안/아산/평택', group: '충청·대전·세종', fullName: '충청남도 천안시 서북구 불당동' },
  { id: '5793', name: '둔산동', label: '대전/세종/충북(청주)', group: '충청·대전·세종', fullName: '대전광역시 서구 둔산동' },

  // 부산 / 울산 / 경남
  { id: '5918', name: '부전동', label: '부산/울산/경남(창원·김해·양산)', group: '부산·울산·경남', fullName: '부산광역시 부산진구 부전동' },

  // 대구 / 경북
  { id: '5663', name: '범어동', label: '대구/경북(구미·포항·경산)', group: '대구·경북', fullName: '대구광역시 수성구 범어동' },

  // 광주 / 전라
  { id: '1015', name: '치평동', label: '광주/전북(전주)/전남(순천·목포)', group: '광주·전라', fullName: '광주광역시 서구 치평동' },

  // 강원 / 제주
  { id: '1925', name: '무실동', label: '강원(원주·춘천·강릉)', group: '강원·제주', fullName: '강원특별자치도 원주시 무실동' },
  { id: '3835', name: '노형동', label: '제주 제주시/서귀포', group: '강원·제주', fullName: '제주특별자치도 제주시 노형동' }
];

// 연속 재검색 시 당근 Rate Limit으로 인해 일부 지역 섹션이 누락되는 현상을 방지하기 위한 캐시 (3분 유지)
const searchCache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function utf8ToBase64(str) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf8').toString('base64');
  }
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function makeSearchRegionCookie(id, name) {
  const payload = JSON.stringify({
    regionId: String(id),
    regionName: String(name),
    countryCode: 'kr'
  });
  return 'search_region=' + encodeURIComponent(utf8ToBase64(payload));
}

function parseRemixContext(html) {
  const marker = 'window.__remixContext = ';
  const idx = html.indexOf(marker);
  if (idx === -1) return null;
  const start = idx + marker.length;
  const endIdx1 = html.indexOf('};__remixContext.p', start);
  const endIdx2 = html.indexOf(';</script>', start);
  const raw = (endIdx1 !== -1 && (endIdx2 === -1 || endIdx1 < endIdx2))
    ? html.slice(start, endIdx1 + 1)
    : html.slice(start, endIdx2);
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function fetchRegionSearchOnce(keyword, hub) {
  const url = `https://www.daangn.com/kr/search/?q=${encodeURIComponent(keyword)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cookie': makeSearchRegionCookie(hub.id, hub.name)
    },
    signal: AbortSignal.timeout(8000)
  });
  if (!res.ok) return { ok: false, items: [] };
  const html = await res.text();
  const ctx = parseRemixContext(html);
  if (!ctx?.state?.loaderData) return { ok: false, items: [] };

  const routeData = Object.values(ctx.state.loaderData).find(v => v && Array.isArray(v.sections));
  if (!routeData) return { ok: false, items: [] };

  const buySellSection = routeData.sections.find(s => s.type === 'buy-sell');
  if (!buySellSection) {
    // 당근 Rate Limit 또는 해당 권역 매물 0건
    return { ok: false, items: [] };
  }

  const results = buySellSection.results || [];
  const actualRegionName = routeData.searchRegion?.fullName || hub.fullName || hub.label;

  return {
    ok: true,
    items: results.map(item => ({
      ...item,
      hubId: hub.id,
      hubLabel: hub.label || hub.name,
      hubGroup: hub.group || '기타',
      hubFullName: actualRegionName,
      sourceType: 'regional'
    }))
  };
}

async function fetchRegionSearch(keyword, hub) {
  const cacheKey = `hub:${keyword.toLowerCase()}:${hub.id}`;
  const cached = searchCache.get(cacheKey);

  // 1차 시도
  let result = await fetchRegionSearchOnce(keyword, hub);

  // 만약 buy-sell 섹션이 누락되었고 캐시가 없다면 짧은 대기 후 1회 재시도
  if (!result.ok && (!cached || Date.now() - cached.time > CACHE_TTL_MS)) {
    await sleep(450 + Math.floor(Math.random() * 250));
    result = await fetchRegionSearchOnce(keyword, hub);
  }

  if (result.ok && result.items.length > 0) {
    searchCache.set(cacheKey, { time: Date.now(), items: result.items });
    return result.items;
  }

  // 당근 서버의 일시적 Rate Limit으로 빈 값이 왔을 때 최근 3분 내 캐시가 있으면 캐시 반환
  if (cached && Date.now() - cached.time <= CACHE_TTL_MS) {
    return cached.items;
  }

  return result.items;
}

async function fetchNationwideInstantBuy(keyword) {
  const cacheKey = `instant:${keyword.toLowerCase()}`;
  const cached = searchCache.get(cacheKey);

  const url = `https://www.daangn.com/kr/search/buy-sell/?q=${encodeURIComponent(keyword)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) {
      const html = await res.text();
      const ctx = parseRemixContext(html);
      const shell = ctx?.state?.loaderData?.['routes/_buy-sell-shell'];
      const list = shell?.buySellArticles || [];
      const mapped = list.map(item => ({
        ...item,
        hubId: 'instant-buy',
        hubLabel: '전국 안심결제/택배',
        hubGroup: '전국택배',
        hubFullName: '전국 안심결제 매물',
        sourceType: 'instant-buy'
      }));
      if (mapped.length > 0) {
        searchCache.set(cacheKey, { time: Date.now(), items: mapped });
        return mapped;
      }
    }
  } catch {}

  if (cached && Date.now() - cached.time <= CACHE_TTL_MS) {
    return cached.items;
  }
  return [];
}

// 순간 폭주(Burst)로 인한 당근 내부 Rate Limit을 피하기 위해 4개씩 배치를 나누어 호출
async function runPacedTasks(tasks, batchSize = 4, delayMs = 200) {
  const results = [];
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(fn => fn().catch(() => []))
    );
    results.push(...batchResults);
    if (i + batchSize < tasks.length) {
      await sleep(delayMs);
    }
  }
  return results;
}

function normalizeArticle(raw, keyword) {
  const title = raw.title || '';
  const content = raw.content || '';
  const combined = `${title} ${content}`.toLowerCase();
  const tokens = keyword.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const isExactMatch = tokens.length > 0 && tokens.every(t => combined.includes(t));
  const isTitleMatch = tokens.length > 0 && tokens.every(t => title.toLowerCase().includes(t));
  const isBuyingPost = /삽니다|구합니다|구매합니다|교환구함/.test(title) || raw.category === 32;

  const href = raw.href?.startsWith('http')
    ? raw.href
    : `https://www.daangn.com${raw.href || raw.id || ''}`;

  const numericPrice = raw.price != null ? Number(raw.price) : null;

  return {
    id: raw.id || raw.href,
    href,
    title,
    content,
    price: numericPrice,
    thumbnail: raw.thumbnail || null,
    status: raw.status || 'Ongoing',
    isInstantBuyAvailable: Boolean(raw.isInstantBuyAvailable),
    createdAt: raw.createdAt || null,
    boostedAt: raw.boostedAt || raw.createdAt || null,
    dongName: raw.region?.name || '',
    hubId: raw.hubId,
    hubLabel: raw.hubLabel,
    hubGroup: raw.hubGroup,
    hubFullName: raw.hubFullName,
    sourceType: raw.sourceType,
    isExactMatch,
    isTitleMatch,
    isBuyingPost
  };
}

async function searchNationwide({ keyword, hubIdParam, customHubsParam, groupsParam }) {
  let targetHubs = [...DEFAULT_HUBS];
  const isSingleHub = Boolean(hubIdParam && hubIdParam !== 'all');

  if (isSingleHub) {
    targetHubs = targetHubs.filter(h => String(h.id) === String(hubIdParam));
  } else if (groupsParam) {
    const allowedGroups = new Set(groupsParam.split(',').map(s => s.trim()).filter(Boolean));
    if (allowedGroups.size > 0) {
      targetHubs = targetHubs.filter(h => allowedGroups.has(h.group));
    }
  }

  if (!isSingleHub && customHubsParam) {
    try {
      const customList = typeof customHubsParam === 'string' ? JSON.parse(customHubsParam) : customHubsParam;
      if (Array.isArray(customList)) {
        for (const c of customList) {
          if (c.id && c.name && !targetHubs.some(h => String(h.id) === String(c.id))) {
            targetHubs.unshift({
              id: String(c.id),
              name: c.name,
              label: c.label || c.fullName || c.name,
              group: '추가 지역',
              fullName: c.fullName || c.name
            });
          }
        }
      }
    } catch {}
  }

  const startTime = Date.now();
  const tasks = [
    ...targetHubs.map(hub => () => fetchRegionSearch(keyword, hub)),
    ...(isSingleHub ? [] : [() => fetchNationwideInstantBuy(keyword)])
  ];

  const nestedResults = await runPacedTasks(tasks, 4, 180);
  const flatRaw = nestedResults.flat();

  const map = new Map();
  for (const raw of flatRaw) {
    const key = raw.id || raw.href;
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, normalizeArticle(raw, keyword));
    } else {
      const existing = map.get(key);
      if (existing.sourceType === 'instant-buy' && raw.sourceType === 'regional') {
        map.set(key, normalizeArticle(raw, keyword));
      }
    }
  }

  const articles = Array.from(map.values());
  articles.sort((a, b) => {
    if (a.isExactMatch !== b.isExactMatch) return a.isExactMatch ? -1 : 1;
    if (a.isTitleMatch !== b.isTitleMatch) return a.isTitleMatch ? -1 : 1;
    const tA = new Date(a.boostedAt || a.createdAt || 0).getTime();
    const tB = new Date(b.boostedAt || b.createdAt || 0).getTime();
    return tB - tA;
  });

  const elapsedMs = Date.now() - startTime;
  return {
    keyword,
    searchedHubCount: targetHubs.length,
    elapsedMs,
    totalCount: articles.length,
    exactMatchCount: articles.filter(a => a.isExactMatch).length,
    articles
  };
}

async function searchRegionsByKeyword(keyword) {
  if (!keyword) return { locations: [] };
  const apiRes = await fetch(
    `https://www.daangn.com/kr/api/v1/regions/keyword?keyword=${encodeURIComponent(keyword)}`,
    { headers: { 'User-Agent': 'Mozilla/5.0' } }
  );
  return await apiRes.json();
}

module.exports = {
  DEFAULT_HUBS,
  searchNationwide,
  searchRegionsByKeyword
};
