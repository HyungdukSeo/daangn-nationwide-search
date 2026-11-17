// 전국 주요 지역 대표 거점 69곳 목록
// 전국의 주요 시·군·구를 권역별(서울 1·2, 경기 1·2, 인천, 충청·대전·세종, 부산·울산·경남, 대구·경북,
// 광주·전라·강원·제주)로 9개 샤드(Wave 1~9)로 나누어 둡니다.
// 샤드 사이의 3초 간격은 프론트엔드(public/index.html)가 두며, 서버는 샤드 내부 거점 조회만
// 소량씩(기본 3개 동시) 나누어 처리합니다.
// 주의: 거점당 최대 약 20개 매물만 가져오는 근사 검색이며 전국 전수 검색이 아닙니다.
const DEFAULT_HUBS = [
  // [Wave 1 (shard: '1'): 서울 강남·동남·동북권 (8곳)]
  { id: '6035', name: '역삼동', label: '서울 강남구', group: '서울', shard: '1', fullName: '서울특별시 강남구 역삼동', includeBuySell: true },
  { id: '6127', name: '방배동', label: '서울 서초구', group: '서울', shard: '1', fullName: '서울특별시 서초구 방배동', includeBuySell: false },
  { id: '6188', name: '잠실동', label: '서울 송파구', group: '서울', shard: '1', fullName: '서울특별시 송파구 잠실동', includeBuySell: true },
  { id: '6044', name: '천호동', label: '서울 강동구', group: '서울', shard: '1', fullName: '서울특별시 강동구 천호동', includeBuySell: false },
  { id: '6140', name: '성수동1가', label: '서울 성동/광진구', group: '서울', shard: '1', fullName: '서울특별시 성동구 성수동1가', includeBuySell: false },
  { id: '6086', name: '전농동', label: '서울 동대문/중랑구', group: '서울', shard: '1', fullName: '서울특별시 동대문구 전농동', includeBuySell: false },
  { id: '142',  name: '미아동', label: '서울 성북/강북구', group: '서울', shard: '1', fullName: '서울특별시 강북구 미아동', includeBuySell: false },
  { id: '6073', name: '상계동', label: '서울 노원/도봉구', group: '서울', shard: '1', fullName: '서울특별시 노원구 상계동', includeBuySell: true },

  // [Wave 2 (shard: '2'): 서울 도심·서부·서남권 (8곳)]
  { id: '6244', name: '이촌동', label: '서울 용산/종로/중구', group: '서울', shard: '2', fullName: '서울특별시 용산구 이촌동', includeBuySell: false },
  { id: '230',  name: '서교동', label: '서울 마포/서대문구', group: '서울', shard: '2', fullName: '서울특별시 마포구 서교동', includeBuySell: true },
  { id: '6255', name: '불광동', label: '서울 은평구', group: '서울', shard: '2', fullName: '서울특별시 은평구 불광동', includeBuySell: false },
  { id: '6052', name: '마곡동', label: '서울 강서구', group: '서울', shard: '2', fullName: '서울특별시 강서구 마곡동', includeBuySell: true },
  { id: '6190', name: '목동', label: '서울 양천구', group: '서울', shard: '2', fullName: '서울특별시 양천구 목동', includeBuySell: false },
  { id: '312',  name: '문래동', label: '서울 영등포/동작구', group: '서울', shard: '2', fullName: '서울특별시 영등포구 문래동', includeBuySell: true },
  { id: '6064', name: '구로동', label: '서울 구로/금천구', group: '서울', shard: '2', fullName: '서울특별시 구로구 구로동', includeBuySell: false },
  { id: '355',  name: '신림동', label: '서울 관악구', group: '서울', shard: '2', fullName: '서울특별시 관악구 신림동', includeBuySell: false },

  // [Wave 3 (shard: '3'): 경기 남부·동남권 (10곳)]
  { id: '1339', name: '정자동', label: '경기 성남(분당/판교)', group: '경기', shard: '3', fullName: '경기도 성남시 분당구 정자동', includeBuySell: true },
  { id: '4720', name: '풍덕천동', label: '경기 용인(수지/기흥)', group: '경기', shard: '3', fullName: '경기도 용인시 수지구 풍덕천동', includeBuySell: true },
  { id: '4726', name: '역북동', label: '경기 용인(처인)/이천/여주', group: '경기', shard: '3', fullName: '경기도 용인시 처인구 역북동', includeBuySell: false },
  { id: '4451', name: '태전동', label: '경기 광주시', group: '경기', shard: '3', fullName: '경기도 광주시 태전동', includeBuySell: false },
  { id: '4814', name: '망월동', label: '경기 하남시(미사)', group: '경기', shard: '3', fullName: '경기도 하남시 망월동', includeBuySell: false },
  { id: '1291', name: '인계동', label: '경기 수원시', group: '경기', shard: '3', fullName: '경기도 수원시 팔달구 인계동', includeBuySell: true },
  { id: '4843', name: '영천동', label: '경기 화성(동탄)/오산', group: '경기', shard: '3', fullName: '경기도 화성시 동탄구 영천동', includeBuySell: true },
  { id: '1766', name: '봉담읍', label: '경기 화성(봉담/향남)', group: '경기', shard: '3', fullName: '경기도 화성시 효행구 봉담읍', includeBuySell: false },
  { id: '11139', name: '고덕동', label: '경기 평택/안성', group: '경기', shard: '3', fullName: '경기도 평택시 고덕동', includeBuySell: false },
  { id: '1404', name: '범계동', label: '경기 안양/과천', group: '경기', shard: '3', fullName: '경기도 안양시 동안구 범계동', includeBuySell: true },

  // [Wave 4 (shard: '4'): 경기 서부·북부권 (11곳)]
  { id: '4464', name: '산본동', label: '경기 군포/의왕', group: '경기', shard: '4', fullName: '경기도 군포시 산본동', includeBuySell: false },
  { id: '4441', name: '철산동', label: '경기 광명시', group: '경기', shard: '4', fullName: '경기도 광명시 철산동', includeBuySell: false },
  { id: '1517', name: '고잔동', label: '경기 안산시', group: '경기', shard: '4', fullName: '경기도 안산시 단원구 고잔동', includeBuySell: false },
  { id: '4245', name: '배곧동', label: '경기 시흥시(배곧/정왕)', group: '경기', shard: '4', fullName: '경기도 시흥시 배곧동', includeBuySell: false },
  { id: '1420', name: '중동', label: '경기 부천시', group: '경기', shard: '4', fullName: '경기도 부천시 원미구 중동', includeBuySell: true },
  { id: '1763', name: '구래동', label: '경기 김포시', group: '경기', shard: '4', fullName: '경기도 김포시 구래동', includeBuySell: false },
  { id: '1568', name: '대화동', label: '경기 고양시(일산/덕양)', group: '경기', shard: '4', fullName: '경기도 고양시 일산서구 대화동', includeBuySell: true },
  { id: '4774', name: '야당동', label: '경기 파주시(운정)', group: '경기', shard: '4', fullName: '경기도 파주시 야당동', includeBuySell: false },
  { id: '4470', name: '다산동', label: '경기 남양주/구리', group: '경기', shard: '4', fullName: '경기도 남양주시 다산동', includeBuySell: true },
  { id: '4741', name: '민락동', label: '경기 의정부시', group: '경기', shard: '4', fullName: '경기도 의정부시 민락동', includeBuySell: false },
  { id: '4656', name: '옥정동', label: '경기 양주/포천/동두천', group: '경기', shard: '4', fullName: '경기도 양주시 옥정동', includeBuySell: false },

  // [Wave 5 (shard: '5'): 인천광역시 (5곳)]
  { id: '6543', name: '송도동', label: '인천 연수/남동/미추홀구', group: '인천', shard: '5', fullName: '인천광역시 연수구 송도동', includeBuySell: true },
  { id: '6519', name: '부평동', label: '인천 부평/계양구', group: '인천', shard: '5', fullName: '인천광역시 부평구 부평동', includeBuySell: true },
  { id: '6541', name: '청라동', label: '인천 서구(청라)', group: '인천', shard: '5', fullName: '인천광역시 서해구 청라동', includeBuySell: true },
  { id: '6496', name: '구월동', label: '인천 남동구(구월)', group: '인천', shard: '5', fullName: '인천광역시 남동구 구월동', includeBuySell: true },
  { id: '11007', name: '아라동', label: '인천 검단신도시', group: '인천', shard: '5', fullName: '인천광역시 검단구 아라동', includeBuySell: true },

  // [Wave 6 (shard: '6'): 충청·대전·세종 (8곳)]
  { id: '5793', name: '둔산동', label: '대전 서구/중구/동구', group: '충청·대전·세종', shard: '6', fullName: '대전광역시 서구 둔산동', includeBuySell: true },
  { id: '4238', name: '봉명동', label: '대전 유성/대덕구', group: '충청·대전·세종', shard: '6', fullName: '대전광역시 유성구 봉명동', includeBuySell: false },
  { id: '6414', name: '다정동', label: '세종특별자치시', group: '충청·대전·세종', shard: '6', fullName: '세종특별자치시 다정동', includeBuySell: true },
  { id: '2292', name: '불당동', label: '충남 천안시', group: '충청·대전·세종', shard: '6', fullName: '충청남도 천안시 서북구 불당동', includeBuySell: true },
  { id: '2333', name: '배방읍', label: '충남 아산/예산/홍성', group: '충청·대전·세종', shard: '6', fullName: '충청남도 아산시 배방읍', includeBuySell: false },
  { id: '7075', name: '예천동', label: '충남 서산/당진/태안', group: '충청·대전·세종', shard: '6', fullName: '충청남도 서산시 예천동', includeBuySell: false },
  { id: '7201', name: '복대동', label: '충북 청주시', group: '충청·대전·세종', shard: '6', fullName: '충청북도 청주시 흥덕구 복대동', includeBuySell: true },
  { id: '2165', name: '연수동', label: '충북 충주/제천/음성', group: '충청·대전·세종', shard: '6', fullName: '충청북도 충주시 연수동', includeBuySell: false },

  // [Wave 7 (shard: '7'): 부산·울산·경남 (9곳)]
  { id: '5918', name: '부전동', label: '부산 서면/부산진/중부', group: '부산·울산·경남', shard: '7', fullName: '부산광역시 부산진구 부전동', includeBuySell: true },
  { id: '6026', name: '우동', label: '부산 해운대/동래/기장', group: '부산·울산·경남', shard: '7', fullName: '부산광역시 해운대구 우동', includeBuySell: true },
  { id: '5898', name: '대연동', label: '부산 남구/수영구(광안·민락)', group: '부산·울산·경남', shard: '7', fullName: '부산광역시 남구 대연동', includeBuySell: false },
  { id: '5924', name: '화명동', label: '부산 북구/사상구', group: '부산·울산·경남', shard: '7', fullName: '부산광역시 북구 화명동', includeBuySell: false },
  { id: '5873', name: '명지동', label: '부산 강서/사하구', group: '부산·울산·경남', shard: '7', fullName: '부산광역시 강서구 명지동', includeBuySell: false },
  { id: '1201', name: '삼산동', label: '울산 남구/중구/울주', group: '부산·울산·경남', shard: '7', fullName: '울산광역시 남구 삼산동', includeBuySell: true },
  { id: '3478', name: '상남동', label: '경남 창원/마산/진해', group: '부산·울산·경남', shard: '7', fullName: '경상남도 창원시 성산구 상남동', includeBuySell: true },
  { id: '3610', name: '내외동', label: '경남 김해/양산', group: '부산·울산·경남', shard: '7', fullName: '경상남도 김해시 내외동', includeBuySell: false },
  { id: '3565', name: '충무공동', label: '경남 진주/거제/통영', group: '부산·울산·경남', shard: '7', fullName: '경상남도 진주시 충무공동', includeBuySell: false },

  // [Wave 8 (shard: '8'): 대구·경북 (6곳)]
  { id: '5663', name: '범어동', label: '대구 수성/동구/중구', group: '대구·경북', shard: '8', fullName: '대구광역시 수성구 범어동', includeBuySell: true },
  { id: '5569', name: '상인동', label: '대구 달서/서구/달성', group: '대구·경북', shard: '8', fullName: '대구광역시 달서구 상인동', includeBuySell: true },
  { id: '5644', name: '태전동', label: '대구 북구(칠곡)', group: '대구·경북', shard: '8', fullName: '대구광역시 북구 태전동', includeBuySell: false },
  { id: '3104', name: '해도동', label: '경북 포항/경주', group: '대구·경북', shard: '8', fullName: '경상북도 포항시 남구 해도동', includeBuySell: false },
  { id: '3224', name: '인동동', label: '경북 구미/김천', group: '대구·경북', shard: '8', fullName: '경상북도 구미시 인동동', includeBuySell: true },
  { id: '3319', name: '중방동', label: '경북 경산/안동/영주', group: '대구·경북', shard: '8', fullName: '경상북도 경산시 중방동', includeBuySell: false },

  // [Wave 9 (shard: '9'): 광주·전라 & 강원·제주 (6곳)]
  { id: '1015', name: '치평동', label: '광주 서구/남구/동구', group: '광주·전라', shard: '9', fullName: '광주광역시 서구 치평동', includeBuySell: true },
  { id: '1086', name: '수완동', label: '광주 광산(수완·첨단)/북구', group: '광주·전라', shard: '9', fullName: '광주광역시 광산구 수완동', includeBuySell: false },
  { id: '6941', name: '효자동3가', label: '전북 전주/익산/군산', group: '광주·전라', shard: '9', fullName: '전북특별자치도 전주시 완산구 효자동3가', includeBuySell: true },
  { id: '6698', name: '연향동', label: '전남 순천/여수/광양/목포', group: '광주·전라', shard: '9', fullName: '전라남도 순천시 연향동', includeBuySell: false },
  { id: '1925', name: '무실동', label: '강원 원주/춘천/강릉', group: '강원·제주', shard: '9', fullName: '강원특별자치도 원주시 무실동', includeBuySell: true },
  { id: '3835', name: '노형동', label: '제주 제주시/서귀포', group: '강원·제주', shard: '9', fullName: '제주특별자치도 제주시 노형동', includeBuySell: true }
];

const ALL_SELECTABLE_HUBS = DEFAULT_HUBS;

const COVERAGE_NOTE = `대표 ${DEFAULT_HUBS.length}개 거점에서 거점당 최대 약 20개 매물을 가져온 근사 결과이며 전수 검색이 아닙니다.`;

const MAX_KEYWORD_LENGTH = 100;
const MAX_CUSTOM_HUBS = 10;
const REQUEST_TIMEOUT_MS = 6000;
const USER_AGENT = 'daangn-nationwide-search/1.0 (personal-use search aggregator)';

// 크기·TTL 상한이 있는 캐시 (서버 인스턴스 메모리 내, 서버리스에서는 인스턴스마다 따로 유지됨)
class BoundedCache {
  constructor(maxEntries, ttlMs) {
    this.maxEntries = maxEntries;
    this.ttlMs = ttlMs;
    this.map = new Map();
  }
  get(key) {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.time > this.ttlMs) {
      this.map.delete(key);
      return undefined;
    }
    return entry.value;
  }
  set(key, value) {
    this.map.delete(key); // 삽입 순서 갱신
    this.map.set(key, { time: Date.now(), value });
    if (this.map.size > this.maxEntries) {
      const now = Date.now();
      for (const [k, e] of this.map) {
        if (now - e.time > this.ttlMs) this.map.delete(k);
      }
      while (this.map.size > this.maxEntries) {
        this.map.delete(this.map.keys().next().value);
      }
    }
  }
}

// 거점별 & 키워드별 누적 캐시 (60분 유지)
const CACHE_TTL_MS = 60 * 60 * 1000;
const integratedHubCache = new BoundedCache(500, CACHE_TTL_MS);
const buySellHubCache = new BoundedCache(500, CACHE_TTL_MS);
const keywordMergedCache = new BoundedCache(50, CACHE_TTL_MS);
const MAX_ITEMS_PER_BS_CACHE_ENTRY = 200;
const MAX_MERGED_ARTICLES = 3000;

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
    regionName: encodeURIComponent(String(name)),
    countryCode: 'kr',
    id: String(id),
    name: String(name)
  });
  return 'search_region=' + utf8ToBase64(payload);
}

// 실패 사유를 구분해 반환: http_<status> | network | parse(응답 구조가 예상과 다름)
async function fetchHtml(url, hub) {
  let res;
  try {
    res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ko-KR,ko;q=0.9',
        'Cookie': makeSearchRegionCookie(hub.id, hub.name)
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
  } catch {
    return { ok: false, reason: 'network' };
  }
  if (!res.ok) return { ok: false, reason: `http_${res.status}` };
  try {
    return { ok: true, html: await res.text() };
  } catch {
    return { ok: false, reason: 'network' };
  }
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
    const cleanRaw = raw.replace(/;\s*$/, '');
    return JSON.parse(cleanRaw);
  } catch {
    return null;
  }
}

// 당근 서버 검색 URL 생성 시 '-제외어' 토큰은 제거하여 전송 (필터링 단계에서 제외 처리)
function getCleanDaangnQuery(keyword) {
  const tokens = (keyword || '').trim().split(/\s+/).filter(Boolean);
  const pos = tokens.filter(t => !(t.startsWith('-') && t.length > 1));
  return pos.length > 0 ? pos.join(' ') : (keyword || '').trim();
}

// 1) 통합검색 경로 (/kr/search/?q=...) — 광역 반경의 판매중(Ongoing) 매물 반환
// 반환: { ok, items, reason? } — reason: http_<status> | network | parse
async function fetchRegionIntegratedOnce(keyword, hub) {
  const cleanQ = getCleanDaangnQuery(keyword);
  const url = `https://www.daangn.com/kr/search/?q=${encodeURIComponent(cleanQ)}`;
  const page = await fetchHtml(url, hub);
  if (!page.ok) return { ok: false, items: [], reason: page.reason };

  const ctx = parseRemixContext(page.html);
  if (!ctx?.state?.loaderData) return { ok: false, items: [], reason: 'parse' };

  const routeData = Object.values(ctx.state.loaderData).find(v => v && Array.isArray(v.sections));
  if (!routeData) return { ok: false, items: [], reason: 'parse' };

  // 검색 결과가 없을 때는 buy-sell 섹션 자체가 없을 수 있으므로 구조 변경이 아니라 "빈 결과"로 취급
  const buySellSection = routeData.sections.find(s => s.type === 'buy-sell');
  const results = (buySellSection && Array.isArray(buySellSection.results)) ? buySellSection.results : [];
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

// 2) 중고거래 전용 경로 (/kr/search/buy-sell/?q=...) — 해당 지역의 최대 20개 매물 + 거래완료(Closed)·예약중(Reserved) 및 안심결제 매물 반환
async function fetchRegionBuySellOnce(keyword, hub) {
  const cleanQ = getCleanDaangnQuery(keyword);
  const url = `https://www.daangn.com/kr/search/buy-sell/?q=${encodeURIComponent(cleanQ)}`;
  const page = await fetchHtml(url, hub);
  if (!page.ok) return { ok: false, items: [], reason: page.reason };

  const ctx = parseRemixContext(page.html);
  const shell = ctx?.state?.loaderData?.['routes/_buy-sell-shell'];
  if (!shell || !Array.isArray(shell.buySellArticles)) {
    return { ok: false, items: [], reason: 'parse' };
  }

  const list = shell.buySellArticles; // 빈 배열은 정상적인 "결과 없음"
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

// 네트워크 오류·5xx 처럼 일시적일 수 있는 실패만 최대 1회 재시도.
// 429/403(차단·제한)이나 parse(구조 변경)는 재시도해도 소용없고 부하만 늘리므로 즉시 포기.
function isRetryable(reason) {
  return reason === 'network' || /^http_5\d\d$/.test(reason || '');
}

async function fetchWithRetry(fn, retries = 1, waitMs = 400) {
  let last = { ok: false, items: [], reason: 'network' };
  for (let i = 0; i <= retries; i++) {
    try {
      last = await fn();
    } catch {
      last = { ok: false, items: [], reason: 'network' };
    }
    if (last.ok || !isRetryable(last.reason)) return last;
    if (i < retries) await sleep(waitMs);
  }
  return last;
}

function itemKey(item) {
  return item && (item.id || item.href);
}

// 새 항목을 앞에, 캐시 항목을 뒤에 두고 id 기준 중복 제거 (상한 적용)
function mergeUnique(fresh, cached, limit) {
  const seen = new Set();
  const out = [];
  for (const item of [...fresh, ...cached]) {
    const key = itemKey(item);
    if (key) {
      if (seen.has(key)) continue;
      seen.add(key);
    }
    out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}

// 통합검색과 중고거래 검색의 캐시를 분리 관리하여 한쪽이 Rate Limit에 걸려도 다른 쪽 캐시가 오염되지 않도록 보호
// 반환: { items, failures: [{ route, reason }] } — failures 는 최종적으로 실패한 경로만 담음
async function fetchRegionCombined(keyword, hub, forceBuySell = false) {
  const intKey = `int:${keyword.toLowerCase()}:${hub.id}`;
  const bsKey = `bs:${keyword.toLowerCase()}:${hub.id}`;
  const shouldFetchBuySell = forceBuySell || hub.includeBuySell !== false;
  const failures = [];

  const [integratedRes, buySellRes] = await Promise.all([
    fetchWithRetry(() => fetchRegionIntegratedOnce(keyword, hub), 1, 400),
    shouldFetchBuySell
      ? fetchWithRetry(() => fetchRegionBuySellOnce(keyword, hub), 1, 400)
      : Promise.resolve({ ok: true, items: [], skipped: true })
  ]);

  if (!integratedRes.ok) failures.push({ route: 'integrated', reason: integratedRes.reason });
  if (!buySellRes.ok) failures.push({ route: 'buy-sell', reason: buySellRes.reason });

  let intItems = integratedRes.items;
  const cachedInt = integratedHubCache.get(intKey);
  if (integratedRes.ok && intItems.length > 0) {
    integratedHubCache.set(intKey, intItems);
  } else if (cachedInt) {
    intItems = cachedInt;
  }

  let bsItems = buySellRes.items;
  const cachedBs = buySellHubCache.get(bsKey);
  if (buySellRes.ok && bsItems.length > 0) {
    bsItems = mergeUnique(bsItems, cachedBs || [], MAX_ITEMS_PER_BS_CACHE_ENTRY);
    buySellHubCache.set(bsKey, bsItems);
  } else if (cachedBs) {
    bsItems = cachedBs;
  }

  return { items: [...intItems, ...bsItems], failures };
}

function envInt(name, fallback) {
  const n = parseInt(process.env[name], 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

// 거점 조회를 소량씩 나누어 당근 서버 부하를 낮춤 (기본 3개 동시, 배치 사이 400ms)
async function runPacedTasks(
  tasks,
  batchSize = Math.max(1, envInt('DAANGN_BATCH_SIZE', 3)),
  delayMs = envInt('DAANGN_BATCH_DELAY_MS', 400)
) {
  const results = [];
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(fn => fn().catch(() => ({ items: [], failures: [{ route: 'internal', reason: 'network' }] })))
    );
    results.push(...batchResults);
    if (i + batchSize < tasks.length) {
      await sleep(delayMs);
    }
  }
  return results;
}

const SYNONYM_GROUPS = [
  ['맥미니', 'macmini'],
  ['맥북', 'macbook'],
  ['맥북에어', 'macbookair'],
  ['맥북프로', 'macbookpro'],
  ['맥스튜디오', 'macstudio'],
  ['아이폰', 'iphone'],
  ['아이패드', 'ipad'],
  ['에어팟', 'airpods', 'airpod'],
  ['애플워치', 'applewatch'],
  ['갤럭시', 'galaxy'],
  ['플레이스테이션', '플스', 'ps'],
  ['닌텐도스위치', '스위치', 'switch'],
  ['사운드바', 'soundbar'],
  ['엘지', 'lg'],
  ['삼성', 'samsung'],
  ['프로', 'pro'],
  ['맥스', 'max'],
  ['울트라', 'ultra'],
  ['플러스', 'plus'],
  ['에어', 'air'],
  ['슬림', 'slim']
];

function getSynonyms(token) {
  const t = token.toLowerCase().replace(/\s+/g, '');
  for (const group of SYNONYM_GROUPS) {
    if (group.includes(t)) return group;
  }
  return [t];
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchSingleCandidate(cand, rawLower, compactLower) {
  // 영문+숫자 조합 모델/세대 토큰 (예: m5, m4, qp5w, s24)
  if (/^[a-z]+\d+[a-z0-9]*$/i.test(cand)) {
    const pattern = cand.replace(/([a-z]+)(\d+)/gi, '$1\\s*$2');
    const re = new RegExp(`(?<![a-z0-9])${pattern}(?!\\d)`, 'i');
    return re.test(rawLower) || re.test(compactLower);
  }
  // 순수 영문 단어 (예: pro, max, air, mini)
  if (/^[a-z]+$/i.test(cand)) {
    if (cand.length >= 6 && compactLower.includes(cand)) return true;
    const re = new RegExp(`(?<![a-z])${escapeRegex(cand)}(?![a-z])`, 'i');
    return re.test(rawLower);
  }
  // 순수 숫자 토큰 (예: 16, 256, 512)
  if (/^\d+$/.test(cand)) {
    const re = new RegExp(`(?<!\\d)${escapeRegex(cand)}(?!\\d)`);
    return re.test(rawLower);
  }
  // 한글+숫자 조합 또는 일반 한글 키워드
  if (/\d+$/.test(cand)) {
    const pattern = cand.replace(/([^\d]+)(\d+)/g, '$1\\s*$2');
    const re = new RegExp(`${pattern}(?!\\d)`, 'i');
    return re.test(rawLower) || re.test(compactLower);
  }
  return compactLower.includes(cand) || rawLower.includes(cand);
}

function tokenMatchesText(token, rawText) {
  const rawLower = (rawText || '').toLowerCase();
  const compactLower = rawLower.replace(/\s+/g, '');
  const candidates = getSynonyms(token);
  return candidates.some(cand => matchSingleCandidate(cand, rawLower, compactLower));
}

function evaluateKeywordMatch(title, content, keyword) {
  const rawTokens = (keyword || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (rawTokens.length === 0) {
    return { isExactMatch: true, isTitleMatch: true };
  }

  const positiveTokens = [];
  const negativeTokens = [];
  for (const t of rawTokens) {
    if (t.startsWith('-') && t.length > 1) {
      negativeTokens.push(t.slice(1));
    } else {
      positiveTokens.push(t);
    }
  }

  const titleStr = title || '';
  const contentStr = content || '';
  const fullStr = `${titleStr} ${contentStr}`;

  // 1) 제외 키워드(-m4 등)가 제목이나 본문에 있으면 즉시 제외
  for (const neg of negativeTokens) {
    if (tokenMatchesText(neg, fullStr)) {
      return { isExactMatch: false, isTitleMatch: false };
    }
  }

  if (positiveTokens.length === 0) {
    return { isExactMatch: true, isTitleMatch: true };
  }

  const allInTitle = positiveTokens.every(tok => tokenMatchesText(tok, titleStr));

  // 2) 세대/버전 숫자 충돌 방지
  // 예: 검색어에 'm5'가 있는데 제목에는 'm5'가 없고 'M4', 'M2', 'M1' 등 다른 세대 번호가 제목에 명시된 매물은
  // 본문에 "M5 기변으로 판매" 등이 적혀 있더라도 다른 모델이므로 정확 일치에서 제외
  const titleLower = titleStr.toLowerCase();
  for (const tok of positiveTokens) {
    const m = tok.match(/^([a-z가-힣]+?)(\d+)$/i);
    if (m) {
      const prefix = m[1];
      const num = m[2];
      if (!tokenMatchesText(tok, titleStr)) {
        const prefixConflictRe = new RegExp(`(?<![a-z0-9])${escapeRegex(prefix)}\\s*(?!${escapeRegex(num)}(?!\\d))\\d+`, 'i');
        if (prefixConflictRe.test(titleLower)) {
          return { isExactMatch: false, isTitleMatch: false };
        }
      }
    }
  }

  // 3) 제목에 모든 검색 토큰(동의어·띄어쓰기 무시 포함)이 들어있으면 최우선 정확 일치
  if (allInTitle) {
    return { isExactMatch: true, isTitleMatch: true };
  }

  // 4) 제목+본문 통합 검사
  const allInFull = positiveTokens.every(tok => tokenMatchesText(tok, fullStr));
  if (!allInFull) {
    return { isExactMatch: false, isTitleMatch: false };
  }

  // 5) 2단어 이상 조합 검색(예: '맥미니 m5 pro')일 때:
  // 모델 번호/칩셋/등급 토큰(숫자 포함 토큰 또는 pro/프로/max/맥스/ultra/울트라/air/에어/plus/플러스/mini/미니)은
  // 반드시 '제목(title)'에 존재해야 정확 일치로 인정 (본문에만 언급된 타 모델 매물 완벽 차단)
  if (positiveTokens.length >= 2) {
    const tierWords = new Set(['pro', '프로', 'max', '맥스', 'ultra', '울트라', 'plus', '플러스', 'air', '에어', 'fe']);
    for (const tok of positiveTokens) {
      const isModelOrTierToken = /\d/.test(tok) || tierWords.has(tok);
      if (isModelOrTierToken && !tokenMatchesText(tok, titleStr)) {
        return { isExactMatch: false, isTitleMatch: false };
      }
    }
    const anyInTitle = positiveTokens.some(tok => tokenMatchesText(tok, titleStr));
    if (!anyInTitle) {
      return { isExactMatch: false, isTitleMatch: false };
    }
  }

  return { isExactMatch: true, isTitleMatch: false };
}

function normalizeArticle(raw, keyword) {
  const title = raw.title || '';
  const content = raw.content || '';
  const { isExactMatch, isTitleMatch } = evaluateKeywordMatch(title, content, keyword);
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
  keyword = String(keyword || '').trim().slice(0, MAX_KEYWORD_LENGTH);
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
      // 추가 지역 수를 제한해 한 요청이 당근으로 보내는 요청 수가 무제한 늘어나지 않도록 함
      const customList = typeof customHubsParam === 'string'
        ? (customHubsParam.length > 4000 ? null : JSON.parse(customHubsParam))
        : customHubsParam;
      if (Array.isArray(customList)) {
        for (const c of customList.slice(0, MAX_CUSTOM_HUBS)) {
          if (!c || typeof c !== 'object') continue;
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

  const nestedResults = await runPacedTasks(tasks);
  const flatRaw = nestedResults.flatMap(r => r.items);

  // 실패 집계: 거점별 실패 사유를 모아 "결과 없음"과 "가져오지 못함"을 구분해서 알림
  const failureReasons = {};
  let failedHubCount = 0;
  let parseErrorCount = 0;
  let blockedCount = 0;
  nestedResults.forEach((r, idx) => {
    if (!r.failures.length) return;
    failedHubCount++;
    for (const f of r.failures) {
      failureReasons[f.reason] = (failureReasons[f.reason] || 0) + 1;
      if (f.reason === 'parse') parseErrorCount++;
      if (f.reason === 'http_429' || f.reason === 'http_403') blockedCount++;
    }
    if (r.failures.some(f => f.reason === 'parse')) {
      console.warn(`[daangn] 응답 구조를 해석하지 못함: hub=${targetHubs[idx].id} (${targetHubs[idx].name}) — 당근 페이지 구조 변경 가능성`);
    }
  });

  const warnings = [];
  if (parseErrorCount > 0) {
    warnings.push('당근 응답 구조를 해석하지 못한 거점이 있습니다. 당근 페이지 구조가 바뀌었을 수 있으니 파서 점검이 필요합니다.');
  }
  if (blockedCount > 0) {
    warnings.push('당근 서버가 일부 요청을 제한(403/429)했습니다. 잠시 후 다시 시도하거나 호출 빈도를 낮춰 주세요.');
  }
  const otherFailures = failedHubCount - Math.min(failedHubCount, parseErrorCount + blockedCount);
  if (otherFailures > 0) {
    warnings.push('일부 거점은 네트워크 오류나 서버 오류로 조회하지 못했습니다. 해당 거점 결과는 누락되었을 수 있습니다.');
  }
  // 모든 거점이 구조 해석에 실패하면 "매물 없음"이 아니라 파서 고장으로 본다
  const schemaChanged = targetHubs.length > 0 && parseErrorCount >= targetHubs.length;

  const globalKey = `${keyword.toLowerCase()}::${hubIdParam || shardParam || 'all'}`;
  const prevGlobalMap = keywordMergedCache.get(globalKey);
  const map = prevGlobalMap ? new Map(prevGlobalMap) : new Map();

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

  // 한 키워드 캐시가 무한히 커지지 않도록 가장 오래 들어온 항목부터 제한
  while (map.size > MAX_MERGED_ARTICLES) {
    map.delete(map.keys().next().value);
  }
  if (map.size > 0) {
    keywordMergedCache.set(globalKey, map);
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
    failedHubCount,
    failureReasons,
    schemaChanged,
    warnings,
    coverageNote: COVERAGE_NOTE,
    articles
  };
}

async function searchRegionsByKeyword(keyword) {
  const k = (keyword || '').trim().slice(0, MAX_KEYWORD_LENGTH);
  if (!k) return { locations: [] };
  const apiRes = await fetch(
    `https://www.daangn.com/kr/api/v1/regions/keyword?keyword=${encodeURIComponent(k)}`,
    { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }
  );
  if (!apiRes.ok) {
    throw new Error(`동네 검색 응답 오류 (HTTP ${apiRes.status})`);
  }
  return await apiRes.json();
}

module.exports = {
  DEFAULT_HUBS,
  ALL_SELECTABLE_HUBS,
  searchNationwide,
  searchRegionsByKeyword
};
