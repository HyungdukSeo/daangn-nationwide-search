const { searchNationwide } = require('../lib/daangn');
const { guardNode } = require('../lib/guard');

module.exports = async (req, res) => {
  const host = req.headers.host || '';
  if (host.includes('daangn-nationwide-search-lby3.vercel.app')) {
    res.writeHead(308, { 'Location': `https://daangn-nationwide-search-smoky.vercel.app${req.url}` });
    res.end();
    return;
  }

  if (req.method === 'OPTIONS') {
    guardNode(req, res, 'hubs'); // CORS 헤더만 설정 (허용 출처일 때)
    res.statusCode = 204;
    res.end();
    return;
  }

  const release = guardNode(req, res, 'search');
  if (!release) return;

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const keyword = (url.searchParams.get('q') || '').trim();
    const hubIdParam = url.searchParams.get('hubId');
    const shardParam = url.searchParams.get('shard');
    const customHubsParam = url.searchParams.get('customHubs');
    const groupsParam = url.searchParams.get('groups');

    if (!keyword) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: '검색어를 입력해 주세요.' }));
      return;
    }

    const effectiveShard = (!shardParam && !hubIdParam) ? '1' : shardParam;
    const result = await searchNationwide({ keyword, hubIdParam, shardParam: effectiveShard, customHubsParam, groupsParam });
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (err) {
    console.error('[api/search]', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: '검색 중 오류가 발생했습니다.' }));
  } finally {
    release();
  }
};
