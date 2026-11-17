const { searchRegionsByKeyword } = require('../lib/daangn');
const { guardNode } = require('../lib/guard');

module.exports = async (req, res) => {
  const release = guardNode(req, res, 'regions');
  if (!release) return;

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const keyword = (url.searchParams.get('q') || '').trim();
    const data = await searchRegionsByKeyword(keyword);
    res.statusCode = 200;
    res.end(JSON.stringify(data));
  } catch (err) {
    console.error('[api/regions]', err);
    res.statusCode = 502;
    res.end(JSON.stringify({ error: '동네 검색 중 오류가 발생했습니다.' }));
  } finally {
    release();
  }
};
