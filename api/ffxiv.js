// Vercel Serverless Function - XIVAPI Proxy
// This avoids CORS issues by proxying XIVAPI requests server-side

const XIVAPI_BASE = 'https://xivapi.com';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action, name, server, id } = req.query;

  try {
    let url;

    if (action === 'search' && name && server) {
      // Search for character
      const encodedName = encodeURIComponent(name);
      url = `${XIVAPI_BASE}/character/search?name=${encodedName}&server=${encodeURIComponent(server)}`;
    } else if (action === 'character' && id) {
      // Get character details
      url = `${XIVAPI_BASE}/character/${encodeURIComponent(id)}?extended=1&data=FC`;
    } else {
      return res.status(200).json({
        error: 'Invalid parameters',
        message: 'Use action=search with name & server, or action=character with id'
      });
    }

    console.log('Fetching XIVAPI:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Portfolio-Site/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('XIVAPI response error:', response.status, errorText);
      return res.status(200).json({
        error: `XIVAPI returned ${response.status}`,
        details: errorText.substring(0, 200)
      });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('XIVAPI proxy error:', error);
    res.status(200).json({
      error: 'Proxy error',
      message: error.message || 'Failed to fetch XIVAPI data'
    });
  }
}
