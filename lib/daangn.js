// 전국 17개 시도 주요 거점 지역 (광역 반경 커버용 42개 핵심 허브)
const DEFAULT_HUBS = [
  // 서울
  { id: '6035', name: '역삼동', label: '서울 강남/서초', group: '서울', fullName: '서울특별시 강남구 역삼동' },
  { id: '6188', name: '잠실동', label: '서울 송파/강동', group: '서울', fullName: '서울특별시 송파구 잠실동' },
  { id: '230',  name: '서교동', label: '서울 마포/서대문', group: '서울', fullName: '서울특별시 마포구 서교동' },
  { id: '6052', name: '마곡동', label: '서울 강서/양천', group: '서울', fullName: '서울특별시 강서구 마곡동' },
  { id: '355',  name: '신림동', label: '서울 관악/동작/구로', group: '서울', fullName: '서울특별시 관악구 신림동' },
  { id: '6140', name: '성수동1가', label: '서울 성동/광진/종로', group: '서울', fullName: '서울특별시 성동구 성수동1가' },
  { id: '6073', name: '상계동', label: '서울 노원/성북/강북', group: '서울', fullName: '서울특별시 노원구 상계동' },

  // 경기 / 인천
  { id: '1339', name: '정자동', label: '경기 분당/성남/용인', group: '경기·인천', fullName: '경기도 성남시 분당구 정자동' },
  { id: '1291', name: '인계동', label: '경기 수원/광교', group: '경기·인천', fullName: '경기도 수원시 팔달구 인계동' },
  { id: '1766', name: '봉담읍', label: '경기 화성/서수원/오산', group: '경기·인천', fullName: '경기도 화성시 효행구 봉담읍' },
  { id: '4843', name: '영천동', label: '경기 동탄/용인남부', group: '경기·인천', fullName: '경기도 화성시 동탄구 영천동' },
  { id: '1404', name: '범계동', label: '경기 안양/군포/과천', group: '경기·인천', fullName: '경기도 안양시 동안구 범계동' },
  { id: '1420', name: '중동', label: '경기 부천/광명/시흥', group: '경기·인천', fullName: '경기도 부천시 원미구 중동' },
  { id: '1568', name: '대화동', label: '경기 일산/고양/파주', group: '경기·인천', fullName: '경기도 고양시 일산서구 대화동' },
  { id: '4470', name: '다산동', label: '경기 남양주/구리/하남', group: '경기·인천', fullName: '경기도 남양주시 다산동' },
  { id: '11139', name: '고덕동', label: '경기 평택/안성', group: '경기·인천', fullName: '경기도 평택시 고덕동' },
  { id: '6543', name: '송도동', label: '인천 연수/남동', group: '경기·인천', fullName: '인천광역시 연수구 송도동' },
  { id: '6519', name: '부평동', label: '인천 부평/계양/서구', group: '경기·인천', fullName: '인천광역시 부평구 부평동' },

  // 충청 / 대전 / 세종
  { id: '5793', name: '둔산동', label: '대전 서구/중구', group: '충청·대전·세종', fullName: '대전광역시 서구 둔산동' },
  { id: '4238', name: '봉명동', label: '대전 유성/대덕', group: '충청·대전·세종', fullName: '대전광역시 유성구 봉명동' },
  { id: '6414', name: '다정동', label: '세종특별자치시', group: '충청·대전·세종', fullName: '세종특별자치시 다정동' },
  { id: '2292', name: '불당동', label: '충남 천안/아산', group: '충청·대전·세종', fullName: '충청남도 천안시 서북구 불당동' },
  { id: '7201', name: '복대동', label: '충북 청주/오창', group: '충청·대전·세종', fullName: '충청북도 청주시 흥덕구 복대동' },

  // 부산 / 울산 / 경남
  { id: '5918', name: '부전동', label: '부산 서면/중부', group: '부산·울산·경남', fullName: '부산광역시 부산진구 부전동' },
  { id: '6026', name: '우동', label: '부산 해운대/동부', group: '부산·울산·경남', fullName: '부산광역시 해운대구 우동' },
  { id: '5873', name: '명지동', label: '부산 강서/사하', group: '부산·울산·경남', fullName: '부산광역시 강서구 명지동' },
  { id: '1201', name: '삼산동', label: '울산 남구/중구', group: '부산·울산·경남', fullName: '울산광역시 남구 삼산동' },
  { id: '3478', name: '상남동', label: '경남 창원/마산/진해', group: '부산·울산·경남', fullName: '경상남도 창원시 성산구 상남동' },
  { id: '3610', name: '내외동', label: '경남 김해/양산', group: '부산·울산·경남', fullName: '경상남도 김해시 내외동' },

  // 대구 / 경북
  { id: '5663', name: '범어동', label: '대구 수성/동구/중구', group: '대구·경북', fullName: '대구광역시 수성구 범어동' },
  { id: '5569', name: '상인동', label: '대구 달서/서구/달성', group: '대구·경북', fullName: '대구광역시 달서구 상인동' },
  { id: '3104', name: '해도동', label: '경북 포항/경주', group: '대구·경북', fullName: '경상북도 포항시 남구 해도동' },
  { id: '3224', name: '인동동', label: '경북 구미/김천', group: '대구·경북', fullName: '경상북도 구미시 인동동' },

  // 광주 / 전라
  { id: '1015', name: '치평동', label: '광주 서구/남구/동구', group: '광주·전라', fullName: '광주광역시 서구 치평동' },
  { id: '5446', name: '월계동', label: '광주 광산/북구', group: '광주·전라', fullName: '광주광역시 광산구 월계동' },
  { id: '6941', name: '효자동3가', label: '전북 전주/익산/군산', group: '광주·전라', fullName: '전북특별자치도 전주시 완산구 효자동3가' },
  { id: '6698', name: '연향동', label: '전남 순천/여수/광양', group: '광주·전라', fullName: '전라남도 순천시 연향동' },
  { id: '2770', name: '옥암동', label: '전남 목포/무안', group: '광주·전라', fullName: '전라남도 목포시 옥암동' },

  // 강원 / 제주
  { id: '1925', name: '무실동', label: '강원 원주', group: '강원·제주', fullName: '강원특별자치도 원주시 무실동' },
  { id: '1898', name: '퇴계동', label: '강원 춘천', group: '강원·제주', fullName: '강원특별자치도 춘천시 퇴계동' },
  { id: '1973', name: '교동', label: '강원 강릉/속초', group: '강원·제주', fullName: '강원특별자치도 속초시 교동' },
  { id: '3835', name: '노형동', label: '제주 제주시/서귀포', group: '강원·제주', fullName: '제주특별자치도 제주시 노형동' }
];

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

async function fetchRegionSearch(keyword, hub) {
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
  if (!res.ok) return [];
  const html = await res.text();
  const ctx = parseRemixContext(html);
  if (!ctx?.state?.loaderData) return [];

  const routeData = Object.values(ctx.state.loaderData).find(v => v && Array.isArray(v.sections));
  if (!routeData) return [];
  const buySellSection = routeData.sections.find(s => s.type === 'buy-sell');
  const results = buySellSection?.results || [];
  const actualRegionName = routeData.searchRegion?.fullName || hub.fullName || hub.label;

  return results.map(item => ({
    ...item,
    hubId: hub.id,
    hubLabel: hub.label || hub.name,
    hubGroup: hub.group || '기타',
    hubFullName: actualRegionName,
    sourceType: 'regional'
  }));
}

async function fetchNationwideInstantBuy(keyword) {
  const url = `https://www.daangn.com/kr/search/buy-sell/?q=${encodeURIComponent(keyword)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
    },
    signal: AbortSignal.timeout(8000)
  });
  if (!res.ok) return [];
  const html = await res.text();
  const ctx = parseRemixContext(html);
  const shell = ctx?.state?.loaderData?.['routes/_buy-sell-shell'];
  const list = shell?.buySellArticles || [];
  return list.map(item => ({
    ...item,
    hubId: 'instant-buy',
    hubLabel: '전국 안심결제/택배',
    hubGroup: '전국택배',
    hubFullName: '전국 안심결제 매물',
    sourceType: 'instant-buy'
  }));
}

async function runWithConcurrency(tasks, concurrency = 14) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index < tasks.length) {
      const current = index++;
      try {
        results[current] = await tasks[current]();
      } catch {
        results[current] = [];
      }
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
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

async function searchNationwide({ keyword, customHubsParam, groupsParam }) {
  let targetHubs = [...DEFAULT_HUBS];
  if (groupsParam) {
    const allowedGroups = new Set(groupsParam.split(',').map(s => s.trim()).filter(Boolean));
    if (allowedGroups.size > 0) {
      targetHubs = targetHubs.filter(h => allowedGroups.has(h.group));
    }
  }

  if (customHubsParam) {
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
    () => fetchNationwideInstantBuy(keyword)
  ];

  const nestedResults = await runWithConcurrency(tasks, 14);
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
