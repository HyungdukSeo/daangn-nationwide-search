const { DEFAULT_HUBS, searchNationwide, searchRegionsByKeyword } = require('../../lib/daangn');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8'
  };

  const path = event.path || '';
  const params = event.queryStringParameters || {};

  try {
    if (path.endsWith('/hubs')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ hubs: DEFAULT_HUBS })
      };
    }

    if (path.endsWith('/regions')) {
      const keyword = (params.q || '').trim();
      const data = await searchRegionsByKeyword(keyword);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

    if (path.endsWith('/search')) {
      const keyword = (params.q || '').trim();
      if (!keyword) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: '검색어를 입력해 주세요.' })
        };
      }
      const result = await searchNationwide({
        keyword,
        hubIdParam: params.hubId,
        shardParam: params.shard,
        customHubsParam: params.customHubs,
        groupsParam: params.groups
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not Found' })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
