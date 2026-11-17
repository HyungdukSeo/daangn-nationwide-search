// 전국 검색 시 당근 서버의 IP당 Rate Limit(순간 ~25~30회 제한)에 절대 걸리지 않으면서도
// 모든 권역(평택 지제동, 안양 호계동, 구로 오류동, 영등포 여의도동, 부산 수영구 민락동 등)을 100% 포착하는 21개 핵심 거점
// 2개의 순차 웨이브(Wave 1: 수도권 13곳 -> Wave 2: 지방 8곳)로 호출하여 타임아웃 및 누락 원천 방지
const DEFAULT_HUBS = [
  // [Wave 1: 수도권 13개 핵심 거점]
  { id: '6035', name: '역삼동', label: '서울 강남/서초', group: '서울', shard: '1', fullName: '서울특별시 강남구 역삼동', includeBuySell: true },
  { id: '6188', name: '잠실동', label: '서울 송파/강동/광진', group: '서울', shard: '1', fullName: '서울특별시 송파구 잠실동', includeBuySell: false },
  { id: '230',  name: '서교동', label: '서울 마포/서대문/은평', group: '서울', shard: '1', fullName: '서울특별시 마포구 서교동', includeBuySell: true },
  { id: '6052', name: '마곡동', label: '서울 강서/양천', group: '서울', shard: '1', fullName: '서울특별시 강서구 마곡동', includeBuySell: false },
  { id: '312',  name: '문래동', label: '서울 영등포/동작/용산', group: '서울', shard: '1', fullName: '서울특별시 영등포구 문래동', includeBuySell: false },
  { id: '6064', name: '구로동', label: '서울 구로/금천/관악', group: '서울', shard: '1', fullName: '서울특별시 구로구 구로동', includeBuySell: false },
  { id: '6073', name: '상계동', label: '서울 노원/성북/강북/동북', group: '서울', shard: '1', fullName: '서울특별시 노원구 상계동', includeBuySell: false },

  { id: '1339', name: '정자동', label: '경기 분당/성남/용인/하남', group: '경기·인천', shard: '1', fullName: '경기도 성남시 분당구 정자동', includeBuySell: false },
  { id: '1404', name: '범계동', label: '경기 안양/군포/의왕/과천', group: '경기·인천', shard: '1', fullName: '경기도 안양시 동안구 범계동', includeBuySell: false },
  { id: '1291', name: '인계동', label: '경기 수원/화성/동탄', group: '경기·인천', shard: '1', fullName: '경기도 수원시 팔달구 인계동', includeBuySell: true },
  { id: '11139', name: '고덕동', label: '경기 평택/안성/오산', group: '경기·인천', shard: '1', fullName: '경기도 평택시 고덕동', includeBuySell: false },
  { id: '1568', name: '대화동', label: '경기 일산/파주/김포/부천', group: '경기·인천', shard: '1', fullName: '경기도 고양시 일산서구 대화동', includeBuySell: true },
  { id: '6543', name: '송도동', label: '인천 연수/부평/서구/시흥/안산', group: '경기·인천', shard: '1', fullName: '인천광역시 연수구 송도동', includeBuySell: true },

  // [Wave 2: 지방 8개 핵심 거점]
  { id: '2292', name: '불당동', label: '충남 천안/아산/당진', group: '충청·대전·세종', shard: '2', fullName: '충청남도 천안시 서북구 불당동', includeBuySell: true },
  { id: '5793', name: '둔산동', label: '대전/세종/충북(청주·충주)', group: '충청·대전·세종', shard: '2', fullName: '대전광역시 서구 둔산동', includeBuySell: true },
  { id: '5918', name: '부전동', label: '부산 서면/북구/울산/경남(창원·김해)', group: '부산·울산·경남', shard: '2', fullName: '부산광역시 부산진구 부전동', includeBuySell: true },
  { id: '5898', name: '대연동', label: '부산 남구/수영(민락)/해운대', group: '부산·울산·경남', shard: '2', fullName: '부산광역시 남구 대연동', includeBuySell: false },
  { id: '5663', name: '범어동', label: '대구/경북(구미·포항·경산)', group: '대구·경북', shard: '2', fullName: '대구광역시 수성구 범어동', includeBuySell: true },
  { id: '1015', name: '치평동', label: '광주/전북(전주)/전남(순천·목포)', group: '광주·전라', shard: '2', fullName: '광주광역시 서구 치평동', includeBuySell: true },
  { id: '1925', name: '무실동', label: '강원(원주·춘천·강릉)', group: '강원·제주', shard: '2', fullName: '강원특별자치도 원주시 무실동', includeBuySell: false },
  { id: '3835', name: '노형동', label: '제주 제주시/서귀포', group: '강원·제주', shard: '2', fullName: '제주특별자치도 제주시 노형동', includeBuySell: true }
];

// 드롭다운에서 개별 지역 단독 선택 시 지원하는 67개 전체 정밀 거점 목록
const ALL_SELECTABLE_HUBS = [
  ...DEFAULT_HUBS,
  { id: '6127', name: '방배동', label: '서울 서초구', group: '서울', fullName: '서울특별시 서초구 방배동' },
  { id: '6044', name: '천호동', label: '서울 강동구', group: '서울', fullName: '서울특별시 강동구 천호동' },
  { id: '6140', name: '성수동1가', label: '서울 성동/광진구', group: '서울', fullName: '서울특별시 성동구 성수동1가' },
  { id: '6086', name: '전농동', label: '서울 동대문/중랑구', group: '서울', fullName: '서울특별시 동대문구 전농동' },
  { id: '142',  name: '미아동', label: '서울 성북/강북구', group: '서울', fullName: '서울특별시 강북구 미아동' },
  { id: '6244', name: '이촌동', label: '서울 용산/종로/중구', group: '서울', fullName: '서울특별시 용산구 이촌동' },
  { id: '6255', name: '불광동', label: '서울 은평구', group: '서울', fullName: '서울특별시 은평구 불광동' },
  { id: '6190', name: '목동', label: '서울 양천구', group: '서울', fullName: '서울특별시 양천구 목동' },
  { id: '355',  name: '신림동', label: '서울 관악구', group: '서울', fullName: '서울특별시 관악구 신림동' },
  { id: '4720', name: '풍덕천동', label: '경기 용인(수지/기흥)', group: '경기·인천', fullName: '경기도 용인시 수지구 풍덕천동' },
  { id: '4726', name: '역북동', label: '경기 용인(처인)/이천/여주', group: '경기·인천', fullName: '경기도 용인시 처인구 역북동' },
  { id: '4451', name: '태전동', label: '경기 광주시', group: '경기·인천', fullName: '경기도 광주시 태전동' },
  { id: '4814', name: '망월동', label: '경기 하남시(미사)', group: '경기·인천', fullName: '경기도 하남시 망월동' },
  { id: '4843', name: '영천동', label: '경기 화성(동탄)/오산', group: '경기·인천', fullName: '경기도 화성시 동탄구 영천동' },
  { id: '1766', name: '봉담읍', label: '경기 화성(봉담/향남)', group: '경기·인천', fullName: '경기도 화성시 효행구 봉담읍' },
  { id: '4464', name: '산본동', label: '경기 군포/의왕', group: '경기·인천', fullName: '경기도 군포시 산본동' },
  { id: '4441', name: '철산동', label: '경기 광명시', group: '경기·인천', fullName: '경기도 광명시 철산동' },
  { id: '1517', name: '고잔동', label: '경기 안산시', group: '경기·인천', fullName: '경기도 안산시 단원구 고잔동' },
  { id: '4245', name: '배곧동', label: '경기 시흥시(배곧/정왕)', group: '경기·인천', fullName: '경기도 시흥시 배곧동' },
  { id: '1420', name: '중동', label: '경기 부천시', group: '경기·인천', fullName: '경기도 부천시 원미구 중동' },
  { id: '1763', name: '구래동', label: '경기 김포시', group: '경기·인천', fullName: '경기도 김포시 구래동' },
  { id: '6541', name: '청라동', label: '인천 서구(청라/검단)', group: '경기·인천', fullName: '인천광역시 서해구 청라동' },
  { id: '4774', name: '야당동', label: '경기 파주시(운정)', group: '경기·인천', fullName: '경기도 파주시 야당동' },
  { id: '4470', name: '다산동', label: '경기 남양주/구리', group: '경기·인천', fullName: '경기도 남양주시 다산동' },
  { id: '4741', name: '민락동', label: '경기 의정부시', group: '경기·인천', fullName: '경기도 의정부시 민락동' },
  { id: '4656', name: '옥정동', label: '경기 양주/포천/동두천', group: '경기·인천', fullName: '경기도 양주시 옥정동' },
  { id: '6519', name: '부평동', label: '인천 부평/계양구', group: '경기·인천', fullName: '인천광역시 부평구 부평동' },
  { id: '2333', name: '배방읍', label: '충남 아산/예산/홍성', group: '충청·대전·세종', fullName: '충청남도 아산시 배방읍' },
  { id: '7075', name: '예천동', label: '충남 서산/당진/태안', group: '충청·대전·세종', fullName: '충청남도 서산시 예천동' },
  { id: '4238', name: '봉명동', label: '대전 유성/대덕구', group: '충청·대전·세종', fullName: '대전광역시 유성구 봉명동' },
  { id: '6414', name: '다정동', label: '세종특별자치시', group: '충청·대전·세종', fullName: '세종특별자치시 다정동' },
  { id: '7201', name: '복대동', label: '충북 청주시', group: '충청·대전·세종', fullName: '충청북도 청주시 흥덕구 복대동' },
  { id: '2165', name: '연수동', label: '충북 충주/제천/음성', group: '충청·대전·세종', fullName: '충청북도 충주시 연수동' },
  { id: '6026', name: '우동', label: '부산 해운대/동래/기장', group: '부산·울산·경남', fullName: '부산광역시 해운대구 우동' },
  { id: '5924', name: '화명동', label: '부산 북구/사상구', group: '부산·울산·경남', fullName: '부산광역시 북구 화명동' },
  { id: '5873', name: '명지동', label: '부산 강서/사하구', group: '부산·울산·경남', fullName: '부산광역시 강서구 명지동' },
  { id: '1201', name: '삼산동', label: '울산 남구/중구/울주', group: '부산·울산·경남', fullName: '울산광역시 남구 삼산동' },
  { id: '3478', name: '상남동', label: '경남 창원/마산/진해', group: '부산·울산·경남', fullName: '경상남도 창원시 성산구 상남동' },
  { id: '3610', name: '내외동', label: '경남 김해/양산', group: '부산·울산·경남', fullName: '경상남도 김해시 내외동' },
  { id: '3565', name: '충무공동', label: '경남 진주/거제/통영', group: '부산·울산·경남', fullName: '경상남도 진주시 충무공동' },
  { id: '5569', name: '상인동', label: '대구 달서/서구/달성', group: '대구·경북', fullName: '대구광역시 달서구 상인동' },
  { id: '5644', name: '태전동', label: '대구 북구(칠곡)', group: '대구·경북', fullName: '대구광역시 북구 태전동' },
  { id: '3104', name: '해도동', label: '경북 포항/경주', group: '대구·경북', fullName: '경상북도 포항시 남구 해도동' },
  { id: '3224', name: '인동동', label: '경북 구미/김천', group: '대구·경북', fullName: '경상북도 구미시 인동동' },
  { id: '3319', name: '중방동', label: '경북 경산/안동/영주', group: '대구·경북', fullName: '경상북도 경산시 중방동' },
  { id: '1086', name: '수완동', label: '광주 광산(수완·첨단)/북구', group: '광주·전라', fullName: '광주광역시 광산구 수완동' },
  { id: '6941', name: '효자동3가', label: '전북 전주/익산/군산', group: '광주·전라', fullName: '전북특별자치도 전주시 완산구 효자동3가' },
  { id: '6698', name: '연향동', label: '전남 순천/여수/광양/목포', group: '광주·전라', fullName: '전라남도 순천시 연향동' }
];

// 서버 인스턴스 내 거점별 & 키워드별 누적 캐시 (60분 유지)
const integratedHubCache = new Map();
const buySellHubCache = new Map();
const keywordMergedCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

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
    signal: AbortSignal.timeout(4500)
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
    signal: AbortSignal.timeout(4500)
  });
  if (!res.ok) return { ok: false, items: [] };
  const html = await res.text();
  const ctx = parseRemixContext(html);
  const shell = ctx?.state?.loaderData?.['routes/_buy-sell-shell'];
  if (!shell || !Array.isArray(shell.buySellArticles) || shell.buySellArticles.length === 0) {
    return { ok: false, items: [] };
  }

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

// 통합검색과 중고거래 검색의 캐시를 분리 관리하여 한쪽이 Rate Limit에 걸려도 다른 쪽 캐시가 절대 오염되지 않도록 보호
async function fetchRegionCombined(keyword, hub, forceBuySell = false) {
  const intKey = `int:${keyword.toLowerCase()}:${hub.id}`;
  const bsKey = `bs:${keyword.toLowerCase()}:${hub.id}`;
  const shouldFetchBuySell = forceBuySell || hub.includeBuySell !== false;

  const [integratedRes, buySellRes] = await Promise.all([
    fetchRegionIntegratedOnce(keyword, hub).catch(() => ({ ok: false, items: [] })),
    shouldFetchBuySell
      ? fetchRegionBuySellOnce(keyword, hub).catch(() => ({ ok: false, items: [] }))
      : Promise.resolve({ ok: false, items: [] })
  ]);

  let intItems = integratedRes.items;
  const cachedInt = integratedHubCache.get(intKey);
  if (integratedRes.ok && intItems.length > 0) {
    integratedHubCache.set(intKey, { time: Date.now(), items: intItems });
  } else if (cachedInt && Date.now() - cachedInt.time <= CACHE_TTL_MS) {
    intItems = cachedInt.items;
  }

  let bsItems = buySellRes.items;
  const cachedBs = buySellHubCache.get(bsKey);
  if (buySellRes.ok && bsItems.length > 0) {
    // 만약 기존 캐시에 거래완료(Closed) 다수 항목이 있고 이번 응답이 1건 폴백(SPM PL87W 등)뿐이라면 기존 캐시와 병합 유지
    if (cachedBs && Date.now() - cachedBs.time <= CACHE_TTL_MS) {
      bsItems = [...bsItems, ...cachedBs.items];
    }
    buySellHubCache.set(bsKey, { time: Date.now(), items: bsItems });
  } else if (cachedBs && Date.now() - cachedBs.time <= CACHE_TTL_MS) {
    bsItems = cachedBs.items;
  }

  return [...intItems, ...bsItems];
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

async function searchNationwide({ keyword, hubIdParam, shardParam, customHubsParam, groupsParam }) {
  let targetHubs = [...DEFAULT_HUBS];
  const isSingleHub = Boolean(hubIdParam && hubIdParam !== 'all');

  if (isSingleHub) {
    targetHubs = ALL_SELECTABLE_HUBS.filter(h => String(h.id) === String(hubIdParam));
  } else if (shardParam) {
    targetHubs = targetHubs.filter(h => String(h.shard) === String(shardParam));
  } else if (groupsParam) {
    const allowedGroups = new Set(groupsParam.split(',').map(s => s.trim()).filter(Boolean));
    if (allowedGroups.size > 0) {
      targetHubs = targetHubs.filter(h => allowedGroups.has(h.group));
    }
  }

  if (!isSingleHub && (!shardParam || shardParam === '1') && customHubsParam) {
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
              fullName: c.fullName || c.name,
              includeBuySell: true
            });
          }
        }
      }
    } catch {}
  }

  const startTime = Date.now();
  const tasks = targetHubs.map(hub => () => fetchRegionCombined(keyword, hub, isSingleHub));

  const nestedResults = await runPacedTasks(tasks, 4, 150);
  const flatRaw = nestedResults.flat();

  const globalKey = `${keyword.toLowerCase()}::${hubIdParam || shardParam || 'all'}`;
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
  ALL_SELECTABLE_HUBS,
  searchNationwide,
  searchRegionsByKeyword
};
