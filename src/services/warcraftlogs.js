// Warcraft Logs Service
// Uses Vercel API route to handle OAuth securely

import { config } from '../config.js';

const { wow } = config;

/**
 * Check if we should try to fetch Warcraft Logs data
 * Always returns true since the API route handles credential checking
 */
export function isWarcraftLogsConfigured() {
  return true;
}

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
 * Fetch all Warcraft Logs data via API route
 * @param {object} options - Options
 * @returns {Promise<object>} Combined logs data
 */
export async function fetchAllWarcraftLogsData(options = {}) {
  try {
    const params = new URLSearchParams({
      name: options.characterName || wow.characterName,
      server: options.serverSlug || wow.realm,
      region: options.serverRegion || wow.region,
    });

    const response = await fetch(`/api/warcraftlogs?${params}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch Warcraft Logs data:', error);
    return {
      configured: false,
      error: error.message || 'Failed to fetch Warcraft Logs data',
    };
  }
}
