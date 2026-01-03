// Vercel API route for Warcraft Logs
// Proxies requests to avoid exposing OAuth credentials client-side

const CLIENT_ID = process.env.WARCRAFTLOGS_CLIENT_ID?.trim();
const CLIENT_SECRET = process.env.WARCRAFTLOGS_CLIENT_SECRET?.trim();

// Token cache
let accessToken = null;
let tokenExpiry = null;

async function getAccessToken() {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const tokenUrl = 'https://www.warcraftlogs.com/oauth/token';
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('OAuth failed:', response.status, errorBody);
    throw new Error(`OAuth error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

  return accessToken;
}

async function executeQuery(query, variables = {}) {
  const token = await getAccessToken();

  const response = await fetch('https://www.warcraftlogs.com/api/v2/client', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(200).json({
      configured: false,
      message: 'Warcraft Logs credentials not configured'
    });
  }

  const { name, server, region } = req.query;

  const characterName = name || 'Yüriko';
  const serverSlug = (server || 'moon-guard').toLowerCase().replace(/\s+/g, '-');
  const serverRegion = (region || 'us').toUpperCase();

  try {
    // Query for all difficulties
    const query = `
      query CharacterRankings($name: String!, $serverSlug: String!, $serverRegion: String!) {
        characterData {
          character(name: $name, serverSlug: $serverSlug, serverRegion: $serverRegion) {
            id
            name
            classID
            lfr: zoneRankings(difficulty: 1)
            normal: zoneRankings(difficulty: 3)
            heroic: zoneRankings(difficulty: 4)
            mythic: zoneRankings(difficulty: 5)
          }
        }
      }
    `;

    const result = await executeQuery(query, {
      name: characterName,
      serverSlug,
      serverRegion,
    });

    if (result.errors) {
      return res.status(200).json({
        configured: true,
        error: result.errors[0]?.message || 'GraphQL error'
      });
    }

    const character = result.data?.characterData?.character;
    if (!character) {
      return res.status(200).json({
        configured: true,
        error: 'Character not found on Warcraft Logs'
      });
    }

    // Process rankings
    const processRankings = (rankings, difficultyName) => {
      if (!rankings || typeof rankings !== 'object') return null;

      return {
        difficulty: difficultyName,
        averagePerformance: rankings.bestPerformanceAverage,
        encounters: (rankings.rankings || []).map(enc => ({
          encounterName: enc.encounter?.name || 'Unknown',
          rankPercent: enc.rankPercent,
          medianPercent: enc.medianPercent,
          totalKills: enc.totalKills,
          spec: enc.spec,
        })).filter(enc => enc.rankPercent !== null),
      };
    };

    res.status(200).json({
      configured: true,
      rankings: {
        characterName: character.name,
        classId: character.classID,
        lfr: processRankings(character.lfr, 'LFR'),
        normal: processRankings(character.normal, 'Normal'),
        heroic: processRankings(character.heroic, 'Heroic'),
        mythic: processRankings(character.mythic, 'Mythic'),
      },
      profileUrl: `https://www.warcraftlogs.com/character/${serverRegion.toLowerCase()}/${serverSlug}/${characterName}`,
    });
  } catch (error) {
    console.error('Warcraft Logs API error:', error);
    res.status(200).json({
      configured: true,
      error: error.message || 'Failed to fetch Warcraft Logs data'
    });
  }
}
