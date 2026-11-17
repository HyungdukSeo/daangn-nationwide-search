// 전국 14개 핵심 광역거점 (평택·오산·안성 및 분당·용인 포함 — 총 28회 요청으로 당근 Hard Rate Limit을 피하면서 과거 거래완료 내역까지 유도하는 최적치)
const DEFAULT_HUBS = [
  // 서울
  { id: '6035', name: '역삼동', label: '서울 강남/서초/송파', group: '서울', fullName: '서울특별시 강남구 역삼동' },
  { id: '230',  name: '서교동', label: '서울 마포/강서/강북/관악', group: '서울', fullName: '서울특별시 마포구 서교동' },

  // 경기 / 인천
  { id: '1339', name: '정자동', label: '경기 분당/성남/용인', group: '경기·인천', fullName: '경기도 성남시 분당구 정자동' },
  { id: '1291', name: '인계동', label: '경기 수원/화성/동탄/안양', group: '경기·인천', fullName: '경기도 수원시 팔달구 인계동' },
  { id: '11139', name: '고덕동', label: '경기 평택/오산/안성', group: '경기·인천', fullName: '경기도 평택시 고덕동' },
  { id: '1568', name: '대화동', label: '경기 일산/부천/김포/남양주', group: '경기·인천', fullName: '경기도 고양시 일산서구 대화동' },
  { id: '6543', name: '송도동', label: '인천 연수/부평/서구/시흥', group: '경기·인천', fullName: '인천광역시 연수구 송도동' },

  // 충청 / 대전 / 세종
  { id: '2292', name: '불당동', label: '충남 천안/아산/당진', group: '충청·대전·세종', fullName: '충청남도 천안시 서북구 불당동' },
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

// 드롭다운에서 개별 지역 단독 선택 시 지원하는 세부 거점 포함 전체 목록
const ALL_SELECTABLE_HUBS = [
  ...DEFAULT_HUBS,
  { id: '6188', name: '잠실동', label: '서울 송파/강동/광진', group: '서울', fullName: '서울특별시 송파구 잠실동' },
  { id: '355',  name: '신림동', label: '서울 관악/영등포/구로', group: '서울', fullName: '서울특별시 관악구 신림동' },
  { id: '6073', name: '상계동', label: '서울 노원/성북/동북', group: '서울', fullName: '서울특별시 노원구 상계동' },
  { id: '4470', name: '다산동', label: '경기 남양주/구리/하남/의정부', group: '경기·인천', fullName: '경기도 남양주시 다산동' },
  { id: '7201', name: '복대동', label: '충북 청주/오창/충주', group: '충청·대전·세종', fullName: '충청북도 청주시 흥덕구 복대동' },
  { id: '3478', name: '상남동', label: '경남 창원/마산/진주', group: '부산·울산·경남', fullName: '경상남도 창원시 성산구 상남동' }
];

// 서버 인스턴스 내 거점별 & 키워드별 누적 캐시 (30분 유지)
const searchCache = new Map();
const keywordMergedCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000;

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

// 1) 통합검색 경로 (/kr/search/?q=...) — 광역 반경의 판매중(Ongoing) 매물 반환
async function fetchRegionIntegratedOnce(keyword, hub) {
  const url = `https://www.daangn.com/kr/search/?q=${encodeURIComponent(keyword)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cookie': makeSearchRegionCookie(hub.id, hub.name)
    },
    signal: AbortSignal.timeout(7000)
  });
  if (!res.ok) return { ok: false, items: [] };
  const html = await res.text();
  const ctx = parseRemixContext(html);
  if (!ctx?.state?.loaderData) return { ok: false, items: [] };

  const routeData = Object.values(ctx.state.loaderData).find(v => v && Array.isArray(v.sections));
  if (!routeData) return { ok: false, items: [] };

  const buySellSection = routeData.sections.find(s => s.type === 'buy-sell');
  if (!buySellSection) {
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

// 2) 중고거래 전용 경로 (/kr/search/buy-sell/?q=...) — 해당 지역의 거래완료(Closed)·예약중(Reserved) 및 안심결제 매물 반환
async function fetchRegionBuySellOnce(keyword, hub) {
  const url = `https://www.daangn.com/kr/search/buy-sell/?q=${encodeURIComponent(keyword)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cookie': makeSearchRegionCookie(hub.id, hub.name)
    },
    signal: AbortSignal.timeout(7000)
  });
  if (!res.ok) return { ok: false, items: [] };
  const html = await res.text();
  const ctx = parseRemixContext(html);
  const shell = ctx?.state?.loaderData?.['routes/_buy-sell-shell'];
  if (!shell || !Array.isArray(shell.buySellArticles)) return { ok: false, items: [] };

  const list = shell.buySellArticles;
  const actualRegionName = shell.searchRegion?.fullName || hub.fullName || hub.label;

  return {
    ok: true,
    items: list.map(item => {
      const isLocalItem = !item.isInstantBuyAvailable || item.status !== 'Ongoing';
      return {
        ...item,
        hubId: isLocalItem ? hub.id : 'instant-buy',
        hubLabel: isLocalItem ? (hub.label || hub.name) : '전국 안심결제/택배',
        hubGroup: isLocalItem ? (hub.group || '기타') : '전국택배',
        hubFullName: isLocalItem ? actualRegionName : '전국 안심결제 매물',
        sourceType: isLocalItem ? 'regional' : 'instant-buy'
      };
    })
  };
}

async function fetchRegionCombined(keyword, hub) {
  const cacheKey = `combined:${keyword.toLowerCase()}:${hub.id}`;
  const cached = searchCache.get(cacheKey);

  const [integratedRes, buySellRes] = await Promise.all([
    fetchRegionIntegratedOnce(keyword, hub).catch(() => ({ ok: false, items: [] })),
    fetchRegionBuySellOnce(keyword, hub).catch(() => ({ ok: false, items: [] }))
  ]);

  let items = [...integratedRes.items, ...buySellRes.items];

  if (items.length > 0) {
    if (cached && Date.now() - cached.time <= CACHE_TTL_MS) {
      const merged = [...items, ...cached.items];
      searchCache.set(cacheKey, { time: Date.now(), items: merged });
      return merged;
    }
    searchCache.set(cacheKey, { time: Date.now(), items });
    return items;
  }

  if (cached && Date.now() - cached.time <= CACHE_TTL_MS) {
    return cached.items;
  }

  return [];
}

async function runPacedTasks(tasks, batchSize = 4, delayMs = 150) {
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
    targetHubs = ALL_SELECTABLE_HUBS.filter(h => String(h.id) === String(hubIdParam));
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
  const tasks = targetHubs.map(hub => () => fetchRegionCombined(keyword, hub));

  const nestedResults = await runPacedTasks(tasks, 4, 150);
  const flatRaw = nestedResults.flat();

  const globalKey = `${keyword.toLowerCase()}::${hubIdParam || 'all'}`;
  const prevGlobalEntry = keywordMergedCache.get(globalKey);
  const map = (prevGlobalEntry && Date.now() - prevGlobalEntry.time <= CACHE_TTL_MS)
    ? new Map(prevGlobalEntry.map)
    : new Map();

  for (const raw of flatRaw) {
    const key = raw.id || raw.href;
    if (!key) continue;

    if (isSingleHub && raw.sourceType === 'instant-buy') {
      continue;
    }

    const normalized = normalizeArticle(raw, keyword);
    if (!map.has(key)) {
      map.set(key, normalized);
    } else {
      const existing = map.get(key);
      if (normalized.dongName && existing.dongName && !existing.dongName.includes(normalized.dongName)) {
        existing.dongName = `${existing.dongName} · ${normalized.dongName}`;
      }
      if (existing.sourceType === 'instant-buy' && raw.sourceType === 'regional') {
        normalized.dongName = existing.dongName || normalized.dongName;
        map.set(key, normalized);
      }
    }
  }

  if (map.size > 0) {
    keywordMergedCache.set(globalKey, { time: Date.now(), map });
  }

  const articles = Array.from(map.values());
  articles.sort((a, b) => {
    if (a.isExactMatch !== b.isExactMatch) return a.isExactMatch ? -1 : 1;
    if (a.isTitleMatch !== b.isTitleMatch) return a.isTitleMatch ? -1 : 1;
    const aOngoing = a.status === 'Ongoing' ? 1 : 0;
    const bOngoing = b.status === 'Ongoing' ? 1 : 0;
    if (aOngoing !== bOngoing) return bOngoing - aOngoing;
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
