export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminKey = process.env.RAID_ADMIN_KEY;
  const providedKey = req.headers['x-admin-key'];
  if (providedKey !== adminKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data required' });
    }

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an AI that analyzes ARC Raiders end-of-raid screenshots.
Extract the following information and return it as JSON:
- map: The map name (e.g., "Volta", "Karst", etc.)
- status: One of "survived", "kia", or "extract"
- items: Array of extracted items with { item_name, quantity, value (estimate in credits) }

Return ONLY valid JSON, no markdown or explanation.
Example: {"map": "Volta", "status": "survived", "items": [{"item_name": "Titanium Ore", "quantity": 5, "value": 2000}]}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this ARC Raiders end-of-raid screenshot and extract the map, status, and items.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: image.startsWith('data:') ? image : `data:image/png;base64,${image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    const parsed = JSON.parse(content);
    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Screenshot parsing error:', error);
    return res.status(500).json({ error: error.message });
  }
}
