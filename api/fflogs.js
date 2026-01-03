// Vercel API route for FFLogs (FFXIV)
// Uses same OAuth as Warcraft Logs - same service provider

const CLIENT_ID = process.env.WARCRAFTLOGS_CLIENT_ID?.trim();
const CLIENT_SECRET = process.env.WARCRAFTLOGS_CLIENT_SECRET?.trim();

// Token cache
let accessToken = null;
let tokenExpiry = null;

async function getAccessToken() {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const tokenUrl = 'https://www.fflogs.com/oauth/token';
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
    console.error('FFLogs OAuth failed:', response.status, errorBody);
    throw new Error(`OAuth error: ${response.status}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

  return accessToken;
}

async function executeQuery(query, variables = {}) {
  const token = await getAccessToken();

  const response = await fetch('https://www.fflogs.com/api/v2/client', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`FFLogs API error: ${response.status}`);
  }

  return response.json();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(200).json({
      configured: false,
      message: 'FFLogs credentials not configured'
    });
  }

  const { name, server, region } = req.query;

  const characterName = name || 'Yuriko Mh';
  const serverSlug = (server || 'Excalibur').toLowerCase();
  const serverRegion = (region || 'NA').toUpperCase();

  try {
    // Query for zone rankings across difficulties
    const query = `
      query CharacterRankings($name: String!, $serverSlug: String!, $serverRegion: String!) {
        characterData {
          character(name: $name, serverSlug: $serverSlug, serverRegion: $serverRegion) {
            id
            name
            lodestoneID
            savage: zoneRankings(difficulty: 101)
            extreme: zoneRankings(difficulty: 100)
            ultimate: zoneRankings(difficulty: 100, partition: 1)
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
      console.error('FFLogs GraphQL errors:', result.errors);
      return res.status(200).json({
        configured: true,
        error: result.errors[0]?.message || 'GraphQL error'
      });
    }

    const character = result.data?.characterData?.character;
    if (!character) {
      return res.status(200).json({
        configured: true,
        error: 'Character not found on FFLogs'
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
          encounterId: enc.encounter?.id,
          // FFXIV boss icon from FFLogs CDN
          iconUrl: enc.encounter?.id ? `https://assets.rpglogs.com/img/ff/bosses/${enc.encounter.id}-icon.jpg` : null,
          rankPercent: enc.rankPercent,
          medianPercent: enc.medianPercent,
          totalKills: enc.totalKills,
          job: enc.spec,
        })).filter(enc => enc.rankPercent !== null),
      };
    };

    res.status(200).json({
      configured: true,
      rankings: {
        characterName: character.name,
        lodestoneId: character.lodestoneID,
        savage: processRankings(character.savage, 'Savage'),
        extreme: processRankings(character.extreme, 'Extreme'),
        ultimate: processRankings(character.ultimate, 'Ultimate'),
      },
      profileUrl: `https://www.fflogs.com/character/${serverRegion.toLowerCase()}/${serverSlug}/${encodeURIComponent(characterName)}`,
    });
  } catch (error) {
    console.error('FFLogs API error:', error);
    res.status(200).json({
      configured: true,
      error: error.message || 'Failed to fetch FFLogs data'
    });
  }
}
