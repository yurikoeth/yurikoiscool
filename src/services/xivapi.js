// XIVAPI Service for FFXIV character data
// Uses serverless proxy to avoid CORS issues

import { config } from '../config.js';

/**
 * Search for a character by name and server
 * @param {string} name - Character name
 * @param {string} server - Server name (e.g., 'Famfrit')
 * @returns {Promise<Object|null>} - Character search result or null
 */
export async function searchCharacter(name, server) {
  const params = new URLSearchParams({
    action: 'search',
    name,
    server,
  });

  try {
    const response = await fetch(`/api/ffxiv?${params}`);

    if (!response.ok) {
      throw new Error(`XIVAPI search failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.Results && data.Results.length > 0) {
      // Find exact match for name (case-insensitive)
      const exactMatch = data.Results.find(
        char => char.Name.toLowerCase() === name.toLowerCase()
      );
      return exactMatch || data.Results[0];
    }

    return null;
  } catch (error) {
    console.error('Error searching for character:', error);
    throw error;
  }
}

/**
 * Fetch detailed character data by Lodestone ID
 * @param {number} lodestoneId - The character's Lodestone ID
 * @returns {Promise<Object>} - Full character details
 */
export async function fetchCharacterDetails(lodestoneId) {
  const params = new URLSearchParams({
    action: 'character',
    id: lodestoneId.toString(),
  });

  try {
    const response = await fetch(`/api/ffxiv?${params}`);

    if (!response.ok) {
      throw new Error(`XIVAPI character fetch failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching character details:', error);
    throw error;
  }
}

/**
 * Get character with full details by name and server
 * Combines search and detail fetch into one call
 * @param {string} name - Character name
 * @param {string} server - Server name
 * @returns {Promise<Object>} - Full character data
 */
export async function getCharacter(name, server) {
  const searchResult = await searchCharacter(name, server);

  if (!searchResult) {
    throw new Error(`Character "${name}" not found on ${server}`);
  }

  const details = await fetchCharacterDetails(searchResult.ID);
  return details;
}

/**
 * Get character using config values
 * @returns {Promise<Object>} - Full character data
 */
export async function getConfiguredCharacter() {
  const { characterName, server, lodestoneId } = config.ffxiv;

  // Use Lodestone ID directly if available (more reliable)
  if (lodestoneId) {
    return fetchCharacterDetails(lodestoneId);
  }

  return getCharacter(characterName, server);
}

/**
 * Parse class/job data from character
 * @param {Object} character - Character object from XIVAPI
 * @returns {Object} - Parsed job information
 */
export function parseJobs(character) {
  if (!character?.Character?.ClassJobs) {
    return { activeJob: null, jobs: [] };
  }

  const classJobs = character.Character.ClassJobs;

  // Find the active job (highest item level or currently equipped)
  const activeJobData = character.Character.ActiveClassJob;

  // Map all jobs with their levels
  const jobs = classJobs
    .filter(job => job.Level > 0)
    .map(job => ({
      id: job.ClassID,
      jobId: job.JobID,
      name: job.UnlockedState?.Name || job.Name || getJobName(job.JobID || job.ClassID),
      abbreviation: getJobAbbreviation(job.JobID || job.ClassID),
      level: job.Level,
      expLevel: job.ExpLevel,
      expLevelMax: job.ExpLevelMax,
      expLevelTogo: job.ExpLevelTogo,
      isSpecialized: job.IsSpecialised,
      icon: getJobIcon(job.JobID || job.ClassID),
      role: getJobRole(job.JobID || job.ClassID),
    }))
    .sort((a, b) => b.level - a.level);

  // Get active job info
  const activeJob = activeJobData ? {
    id: activeJobData.ClassID,
    jobId: activeJobData.JobID,
    name: activeJobData.UnlockedState?.Name || getJobName(activeJobData.JobID || activeJobData.ClassID),
    abbreviation: getJobAbbreviation(activeJobData.JobID || activeJobData.ClassID),
    level: activeJobData.Level,
    icon: getJobIcon(activeJobData.JobID || activeJobData.ClassID),
    role: getJobRole(activeJobData.JobID || activeJobData.ClassID),
  } : jobs[0];

  return { activeJob, jobs };
}

/**
 * Get job name from ID
 */
function getJobName(id) {
  const jobNames = {
    1: 'Gladiator', 2: 'Pugilist', 3: 'Marauder', 4: 'Lancer', 5: 'Archer',
    6: 'Conjurer', 7: 'Thaumaturge', 8: 'Carpenter', 9: 'Blacksmith', 10: 'Armorer',
    11: 'Goldsmith', 12: 'Leatherworker', 13: 'Weaver', 14: 'Alchemist', 15: 'Culinarian',
    16: 'Miner', 17: 'Botanist', 18: 'Fisher', 19: 'Paladin', 20: 'Monk',
    21: 'Warrior', 22: 'Dragoon', 23: 'Bard', 24: 'White Mage', 25: 'Black Mage',
    26: 'Arcanist', 27: 'Summoner', 28: 'Scholar', 29: 'Rogue', 30: 'Ninja',
    31: 'Machinist', 32: 'Dark Knight', 33: 'Astrologian', 34: 'Samurai', 35: 'Red Mage',
    36: 'Blue Mage', 37: 'Gunbreaker', 38: 'Dancer', 39: 'Reaper', 40: 'Sage',
    41: 'Viper', 42: 'Pictomancer',
  };
  return jobNames[id] || 'Unknown';
}

/**
 * Get job abbreviation from ID
 */
function getJobAbbreviation(id) {
  const abbrevs = {
    1: 'GLA', 2: 'PGL', 3: 'MRD', 4: 'LNC', 5: 'ARC',
    6: 'CNJ', 7: 'THM', 8: 'CRP', 9: 'BSM', 10: 'ARM',
    11: 'GSM', 12: 'LTW', 13: 'WVR', 14: 'ALC', 15: 'CUL',
    16: 'MIN', 17: 'BTN', 18: 'FSH', 19: 'PLD', 20: 'MNK',
    21: 'WAR', 22: 'DRG', 23: 'BRD', 24: 'WHM', 25: 'BLM',
    26: 'ACN', 27: 'SMN', 28: 'SCH', 29: 'ROG', 30: 'NIN',
    31: 'MCH', 32: 'DRK', 33: 'AST', 34: 'SAM', 35: 'RDM',
    36: 'BLU', 37: 'GNB', 38: 'DNC', 39: 'RPR', 40: 'SGE',
    41: 'VPR', 42: 'PCT',
  };
  return abbrevs[id] || '???';
}

/**
 * Get job role from ID
 */
function getJobRole(id) {
  const tanks = [1, 3, 19, 21, 32, 37];
  const healers = [6, 24, 28, 33, 40];
  const melee = [2, 4, 20, 22, 29, 30, 34, 39, 41];
  const ranged = [5, 23, 31, 38];
  const casters = [7, 25, 26, 27, 35, 36, 42];
  const crafters = [8, 9, 10, 11, 12, 13, 14, 15];
  const gatherers = [16, 17, 18];

  if (tanks.includes(id)) return 'tank';
  if (healers.includes(id)) return 'healer';
  if (melee.includes(id)) return 'melee';
  if (ranged.includes(id)) return 'ranged';
  if (casters.includes(id)) return 'caster';
  if (crafters.includes(id)) return 'crafter';
  if (gatherers.includes(id)) return 'gatherer';
  return 'unknown';
}

/**
 * Get job icon URL
 */
function getJobIcon(id) {
  // XIVAPI job icons
  const paddedId = String(id).padStart(6, '0');
  return `https://xivapi.com/cj/1/${paddedId}.png`;
}

/**
 * Calculate average item level from gear
 * @param {Object} character - Character object from XIVAPI
 * @returns {number} - Average item level
 */
export function calculateItemLevel(character) {
  if (!character?.Character?.GearSet?.Gear) {
    return 0;
  }

  const gear = character.Character.GearSet.Gear;
  const slots = Object.values(gear);

  if (slots.length === 0) return 0;

  // Sum up item levels (excluding soul crystal and belt if present)
  let totalIL = 0;
  let count = 0;

  for (const item of slots) {
    if (item && item.Item && item.Item.LevelItem) {
      totalIL += item.Item.LevelItem;
      count++;
    }
  }

  return count > 0 ? Math.floor(totalIL / count) : 0;
}

/**
 * Get Free Company info
 * @param {Object} data - Full XIVAPI response
 * @returns {Object|null} - Free Company info or null
 */
export function getFreeCompany(data) {
  if (!data?.FreeCompany) {
    return null;
  }

  const fc = data.FreeCompany;
  return {
    id: fc.ID,
    name: fc.Name,
    tag: fc.Tag,
    slogan: fc.Slogan,
    formed: fc.Formed,
    rank: fc.Rank,
    ranking: fc.Ranking,
    memberCount: fc.ActiveMemberCount,
    crest: fc.Crest,
  };
}

export default {
  searchCharacter,
  fetchCharacterDetails,
  getCharacter,
  getConfiguredCharacter,
  parseJobs,
  calculateItemLevel,
  getFreeCompany,
};
