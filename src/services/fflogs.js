// FFLogs Service for FFXIV
// Uses Vercel API route to handle OAuth securely

import { config } from '../config.js';

const { ffxiv } = config;

/**
 * Get parse color based on percentile (FFXIV colors)
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
 * Fetch all FFLogs data via API route
 */
export async function fetchAllFFLogsData(options = {}) {
  try {
    const params = new URLSearchParams({
      name: options.characterName || ffxiv.characterName,
      server: options.server || ffxiv.server,
      region: options.region || 'NA',
    });

    const response = await fetch(`/api/fflogs?${params}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch FFLogs data:', error);
    return {
      configured: false,
      error: error.message || 'Failed to fetch FFLogs data',
    };
  }
}
