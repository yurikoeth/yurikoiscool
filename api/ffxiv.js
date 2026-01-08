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

    if (action === 'search') {
      // Search for character
      const encodedName = encodeURIComponent(name);
      url = `${XIVAPI_BASE}/character/search?name=${encodedName}&server=${server}`;
    } else if (action === 'character' && id) {
      // Get character details
      url = `${XIVAPI_BASE}/character/${id}?extended=1&data=FC`;
    } else {
      return res.status(400).json({ error: 'Invalid action. Use action=search or action=character' });
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`XIVAPI error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('XIVAPI proxy error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch XIVAPI data' });
  }
}
