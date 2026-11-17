const { searchNationwide } = require('../lib/daangn');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const keyword = (url.searchParams.get('q') || '').trim();
  const hubIdParam = url.searchParams.get('hubId');
  const customHubsParam = url.searchParams.get('customHubs');
  const groupsParam = url.searchParams.get('groups');

  if (!keyword) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: '검색어를 입력해 주세요.' }));
    return;
  }

  try {
    const result = await searchNationwide({ keyword, hubIdParam, customHubsParam, groupsParam });
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message }));
  }
};
