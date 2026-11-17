const { searchNationwide } = require('../lib/daangn');

module.exports = async (req, res) => {
  const host = req.headers.host || '';
  if (host.includes('daangn-nationwide-search-lby3.vercel.app')) {
    res.writeHead(308, { 'Location': `https://daangn-nationwide-search-smoky.vercel.app${req.url}` });
    res.end();
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

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

  try {
    const effectiveShard = (!shardParam && !hubIdParam) ? '1' : shardParam;
    const result = await searchNationwide({ keyword, hubIdParam, shardParam: effectiveShard, customHubsParam, groupsParam });
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message }));
  }
};
