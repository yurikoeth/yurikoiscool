// Warcraft Logs API v2 Service (GraphQL)
// Requires OAuth2 client credentials from https://www.warcraftlogs.com/api/clients
import { config } from '../config.js';

const { wow, apis } = config;

// Token cache
let accessToken = null;
let tokenExpiry = null;

/**
 * Check if Warcraft Logs credentials are configured
 * @returns {boolean} Whether credentials are available
 */
export function isWarcraftLogsConfigured() {
  return !!(apis.warcraftLogsClientId && apis.warcraftLogsClientSecret);
}

/**
 * Get OAuth2 access token using client credentials flow
 * @returns {Promise<string>} Access token
 */
async function getAccessToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  if (!isWarcraftLogsConfigured()) {
    throw new Error('Warcraft Logs credentials not configured');
  }

  const tokenUrl = 'https://www.warcraftlogs.com/oauth/token';
  const credentials = btoa(`${apis.warcraftLogsClientId}:${apis.warcraftLogsClientSecret}`);

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OAuth error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    // Set expiry to 5 minutes before actual expiry for safety
    tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

    return accessToken;
  } catch (error) {
    console.error('Failed to get Warcraft Logs access token:', error);
    throw error;
  }
}

/**
 * Execute GraphQL query against Warcraft Logs API v2
 * @param {string} query - GraphQL query
 * @param {object} variables - Query variables
 * @returns {Promise<object>} Query result
 */
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
    throw new Error(`Warcraft Logs API error: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    throw new Error(result.errors[0]?.message || 'GraphQL query failed');
  }

  return result.data;
}

/**
 * Difficulty ID mapping for WoW
 */
const DIFFICULTY = {
  LFR: 1,
  NORMAL: 3,
  HEROIC: 4,
  MYTHIC: 5,
};

const DIFFICULTY_NAMES = {
  1: 'LFR',
  3: 'Normal',
  4: 'Heroic',
  5: 'Mythic',
};

/**
 * Get parse color based on percentile
 * @param {number} percentile - Parse percentile (0-100)
 * @returns {string} Color hex code
 */
export function getParseColor(percentile) {
  if (percentile >= 100) return '#e5cc80'; // Gold (100)
  if (percentile >= 99) return '#e268a8'; // Pink (99)
  if (percentile >= 95) return '#ff8000'; // Orange (95-98)
  if (percentile >= 75) return '#a335ee'; // Purple (75-94)
  if (percentile >= 50) return '#0070ff'; // Blue (50-74)
  if (percentile >= 25) return '#1eff00'; // Green (25-49)
  return '#666666'; // Gray (0-24)
}

/**
 * Fetch character parses from Warcraft Logs
 * @param {object} options - Options
 * @param {string} options.characterName - Character name (defaults to config)
 * @param {string} options.serverSlug - Server slug (defaults to config)
 * @param {string} options.serverRegion - Server region (defaults to config)
 * @returns {Promise<object>} Character parse data
 */
export async function fetchCharacterParses({
  characterName = wow.characterName,
  serverSlug = wow.realm,
  serverRegion = wow.region,
} = {}) {
  if (!isWarcraftLogsConfigured()) {
    console.warn('Warcraft Logs credentials not configured. Register at https://www.warcraftlogs.com/api/clients');
    return null;
  }

  // GraphQL query to get character zone rankings
  const query = `
    query CharacterData($name: String!, $serverSlug: String!, $serverRegion: String!) {
      characterData {
        character(name: $name, serverSlug: $serverSlug, serverRegion: $serverRegion) {
          id
          name
          server {
            slug
            region {
              slug
            }
          }
          classID
          zoneRankings
        }
      }
    }
  `;

  try {
    const data = await executeQuery(query, {
      name: characterName,
      serverSlug: serverSlug.toLowerCase().replace(/\s+/g, '-'),
      serverRegion: serverRegion.toUpperCase(),
    });

    const character = data?.characterData?.character;
    if (!character) {
      console.warn('Character not found on Warcraft Logs');
      return null;
    }

    return {
      id: character.id,
      name: character.name,
      server: character.server?.slug,
      region: character.server?.region?.slug,
      classId: character.classID,
      zoneRankings: character.zoneRankings,
    };
  } catch (error) {
    console.error('Failed to fetch character parses:', error);
    return null;
  }
}

/**
 * Fetch detailed raid rankings by difficulty
 * @param {object} options - Options
 * @returns {Promise<object>} Raid rankings organized by difficulty
 */
export async function fetchRaidRankings({
  characterName = wow.characterName,
  serverSlug = wow.realm,
  serverRegion = wow.region,
} = {}) {
  if (!isWarcraftLogsConfigured()) {
    console.warn('Warcraft Logs credentials not configured');
    return null;
  }

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

  try {
    const data = await executeQuery(query, {
      name: characterName,
      serverSlug: serverSlug.toLowerCase().replace(/\s+/g, '-'),
      serverRegion: serverRegion.toUpperCase(),
    });

    const character = data?.characterData?.character;
    if (!character) {
      return null;
    }

    // Process rankings for each difficulty
    const processRankings = (rankings, difficultyName) => {
      if (!rankings || typeof rankings !== 'object') return null;

      const bestPerformanceAverage = rankings.bestPerformanceAverage;
      const encounters = rankings.rankings || [];

      return {
        difficulty: difficultyName,
        averagePerformance: bestPerformanceAverage,
        encounters: encounters.map(enc => ({
          encounterName: enc.encounter?.name || 'Unknown',
          encounterId: enc.encounter?.id,
          rankPercent: enc.rankPercent,
          medianPercent: enc.medianPercent,
          totalKills: enc.totalKills,
          fastestKill: enc.fastestKill,
          spec: enc.spec,
          bestSpec: enc.bestSpec,
          allStars: enc.allStars,
        })).filter(enc => enc.rankPercent !== null),
      };
    };

    return {
      characterName: character.name,
      classId: character.classID,
      lfr: processRankings(character.lfr, 'LFR'),
      normal: processRankings(character.normal, 'Normal'),
      heroic: processRankings(character.heroic, 'Heroic'),
      mythic: processRankings(character.mythic, 'Mythic'),
    };
  } catch (error) {
    console.error('Failed to fetch raid rankings:', error);
    return null;
  }
}

/**
 * Fetch recent reports/logs for a character
 * @param {object} options - Options
 * @returns {Promise<Array>} Recent reports
 */
export async function fetchRecentReports({
  characterName = wow.characterName,
  serverSlug = wow.realm,
  serverRegion = wow.region,
  limit = 10,
} = {}) {
  if (!isWarcraftLogsConfigured()) {
    return null;
  }

  const query = `
    query CharacterReports($name: String!, $serverSlug: String!, $serverRegion: String!, $limit: Int!) {
      characterData {
        character(name: $name, serverSlug: $serverSlug, serverRegion: $serverRegion) {
          recentReports(limit: $limit) {
            data {
              code
              title
              startTime
              endTime
              zone {
                id
                name
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await executeQuery(query, {
      name: characterName,
      serverSlug: serverSlug.toLowerCase().replace(/\s+/g, '-'),
      serverRegion: serverRegion.toUpperCase(),
      limit,
    });

    const reports = data?.characterData?.character?.recentReports?.data || [];

    return reports.map(report => ({
      code: report.code,
      title: report.title,
      startTime: new Date(report.startTime),
      endTime: new Date(report.endTime),
      zone: report.zone?.name,
      zoneId: report.zone?.id,
      url: `https://www.warcraftlogs.com/reports/${report.code}`,
    }));
  } catch (error) {
    console.error('Failed to fetch recent reports:', error);
    return null;
  }
}

/**
 * Fetch all Warcraft Logs data for a character
 * @param {object} options - Options
 * @returns {Promise<object>} Combined logs data
 */
export async function fetchAllWarcraftLogsData(options = {}) {
  if (!isWarcraftLogsConfigured()) {
    return {
      configured: false,
      message: 'Warcraft Logs credentials not configured. Register at https://www.warcraftlogs.com/api/clients to get client ID and secret.',
    };
  }

  try {
    const [rankings, recentReports] = await Promise.all([
      fetchRaidRankings(options),
      fetchRecentReports({ ...options, limit: 5 }),
    ]);

    if (!rankings) {
      return {
        configured: true,
        error: 'Character not found on Warcraft Logs',
      };
    }

    return {
      configured: true,
      rankings,
      recentReports,
      profileUrl: `https://www.warcraftlogs.com/character/${options.serverRegion || wow.region}/${(options.serverSlug || wow.realm).toLowerCase().replace(/\s+/g, '-')}/${options.characterName || wow.characterName}`,
    };
  } catch (error) {
    console.error('Failed to fetch Warcraft Logs data:', error);
    return {
      configured: true,
      error: error.message || 'Failed to fetch Warcraft Logs data',
    };
  }
}
