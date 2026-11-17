const { DEFAULT_HUBS } = require('../lib/daangn');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.statusCode = 200;
  res.end(JSON.stringify({ hubs: DEFAULT_HUBS }));
};
