const { DEFAULT_HUBS } = require('../lib/daangn');
const { guardNode } = require('../lib/guard');

module.exports = async (req, res) => {
  const release = guardNode(req, res, 'hubs');
  if (!release) return;

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.statusCode = 200;
  res.end(JSON.stringify({ hubs: DEFAULT_HUBS }));
  release();
};
