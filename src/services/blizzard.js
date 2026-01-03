// Raider.io API Service for World of Warcraft
// Free API, no key required
import { config } from '../config.js';

const { wow } = config;

/**
 * Fetch character profile from Raider.io
 * @returns {Promise<object>} Character data
 */
export async function fetchCharacterProfile() {
  const characterName = encodeURIComponent(wow.characterName);
  const realm = wow.realm;
  const region = wow.region;

  const url = `https://raider.io/api/v1/characters/profile?region=${region}&realm=${realm}&name=${characterName}&fields=gear,mythic_plus_scores_by_season:current,mythic_plus_best_runs:all,raid_progression,mythic_plus_ranks`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Raider.io API error: ${response.status}`);
    }

    const data = await response.json();

    // Construct character render URL from thumbnail
    // thumbnail: .../{id}-avatar.jpg -> render: .../{id}-main-raw.png
    const thumbnailUrl = data.thumbnail_url;
    let renderUrl = null;
    if (thumbnailUrl) {
      renderUrl = thumbnailUrl
        .replace(/-avatar\.jpg.*$/, '-main-raw.png')
        .replace(/\?.*$/, ''); // Remove query params
    }

    return {
      name: data.name,
      realm: data.realm,
      region: data.region,
      class: data.class,
      activeSpec: data.active_spec_name,
      activeRole: data.active_spec_role,
      race: data.race,
      faction: data.faction,
      achievementPoints: data.achievement_points,
      thumbnailUrl: data.thumbnail_url,
      renderUrl: renderUrl,
      profileUrl: data.profile_url,
      gear: {
        itemLevel: data.gear?.item_level_equipped || 0,
        itemLevelTotal: data.gear?.item_level_total || 0,
      },
      mythicPlusRanks: {
        overall: data.mythic_plus_ranks?.overall || {},
        class: data.mythic_plus_ranks?.class || {},
        spec: data.mythic_plus_ranks?.class_spec || {},
      },
    };
  } catch (error) {
    console.error('Failed to fetch character profile:', error);
    return getMockCharacterProfile();
  }
}

/**
 * Fetch Mythic+ data from Raider.io
 * @returns {Promise<object>} M+ data
 */
export async function fetchMythicPlusProfile() {
  const characterName = encodeURIComponent(wow.characterName);
  const realm = wow.realm;
  const region = wow.region;

  const url = `https://raider.io/api/v1/characters/profile?region=${region}&realm=${realm}&name=${characterName}&fields=mythic_plus_scores_by_season:current,mythic_plus_best_runs:all`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Raider.io API error: ${response.status}`);
    }

    const data = await response.json();

    const currentSeason = data.mythic_plus_scores_by_season?.[0];

    return {
      rating: currentSeason?.scores?.all || 0,
      ratingColor: currentSeason?.segments?.all?.color || '#ffffff',
      bestRuns: (data.mythic_plus_best_runs || []).slice(0, 8).map(run => ({
        dungeon: run.dungeon,
        shortName: run.short_name,
        level: run.mythic_level,
        score: run.score,
        completedInTime: run.num_keystone_upgrades > 0,
        upgrades: run.num_keystone_upgrades,
        affixes: (run.affixes || []).map(a => a.name),
        url: run.url,
        iconUrl: run.icon_url || null,
      })),
    };
  } catch (error) {
    console.error('Failed to fetch M+ data:', error);
    return getMockMythicPlusProfile();
  }
}

/**
 * Fetch raid progression from Raider.io
 * @returns {Promise<object>} Raid progress
 */
export async function fetchRaidProgress() {
  const characterName = encodeURIComponent(wow.characterName);
  const realm = wow.realm;
  const region = wow.region;

  const url = `https://raider.io/api/v1/characters/profile?region=${region}&realm=${realm}&name=${characterName}&fields=raid_progression`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Raider.io API error: ${response.status}`);
    }

    const data = await response.json();
    const progression = data.raid_progression || {};

    // Raid tier priority (current tier first)
    const raidPriority = ['manaforge-omega', 'liberation-of-undermine', 'nerubar-palace'];

    const raids = Object.entries(progression).map(([raidSlug, progress]) => ({
      slug: raidSlug,
      name: formatRaidName(raidSlug),
      summary: progress.summary,
      normalKills: progress.normal_bosses_killed,
      heroicKills: progress.heroic_bosses_killed,
      mythicKills: progress.mythic_bosses_killed,
      totalBosses: progress.total_bosses,
    }));

    // Sort by priority (current tier first)
    raids.sort((a, b) => {
      const aPriority = raidPriority.indexOf(a.slug);
      const bPriority = raidPriority.indexOf(b.slug);
      if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;
      return (b.mythicKills || 0) - (a.mythicKills || 0);
    });

    return {
      raids: raids.slice(0, 4),
    };
  } catch (error) {
    console.error('Failed to fetch raid progress:', error);
    return getMockRaidProgress();
  }
}

/**
 * Format raid slug to readable name
 */
function formatRaidName(slug) {
  const names = {
    'liberation-of-undermine': 'Liberation of Undermine',
    'nerubar-palace': "Nerub'ar Palace",
    'blackrock-depths': 'Blackrock Depths',
    'amirdrassil-the-dreams-hope': "Amirdrassil",
    'aberrus-the-shadowed-crucible': 'Aberrus',
    'vault-of-the-incarnates': 'Vault of the Incarnates',
    'manaforge-omega': 'Manaforge Omega',
  };
  return names[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Fetch all WoW character data in one call
 * @returns {Promise<object>} Combined character data
 */
export async function fetchAllWoWData() {
  const [profile, mythicPlus, raids] = await Promise.all([
    fetchCharacterProfile(),
    fetchMythicPlusProfile(),
    fetchRaidProgress(),
  ]);

  return {
    profile,
    mythicPlus,
    raids,
    isMockData: !profile.thumbnailUrl,
  };
}

// Mock data functions for fallback
function getMockCharacterProfile() {
  return {
    name: wow.characterName || 'Hero',
    realm: wow.realm || 'Moon Guard',
    class: 'Mage',
    activeSpec: 'Arcane',
    race: 'Void Elf',
    faction: 'Alliance',
    thumbnailUrl: null,
    gear: { itemLevel: 720, itemLevelTotal: 720 },
  };
}

function getMockMythicPlusProfile() {
  return {
    rating: 3500,
    ratingColor: '#ff8000',
    bestRuns: [
      { dungeon: 'Ara-Kara', shortName: 'AK', level: 17, score: 442, completedInTime: true, upgrades: 2 },
      { dungeon: 'City of Threads', shortName: 'COT', level: 16, score: 430, completedInTime: true, upgrades: 1 },
    ],
  };
}

function getMockRaidProgress() {
  return {
    raids: [
      { name: 'Liberation of Undermine', summary: '8/8 H', mythicKills: 0, heroicKills: 8, totalBosses: 8 },
    ],
  };
}
