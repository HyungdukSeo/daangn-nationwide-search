const { searchRegionsByKeyword } = require('../lib/daangn');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const keyword = (url.searchParams.get('q') || '').trim();

  try {
    const data = await searchRegionsByKeyword(keyword);
    res.statusCode = 200;
    res.end(JSON.stringify(data));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message }));
  }
};
