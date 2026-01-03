// Steam API Service
// Uses Vercel API route to avoid CORS issues

import { config } from '../config.js';

const STEAM_ID = config.steam.steamId;

/**
 * Check if we're running on Vercel (production)
 */
const isProduction = () => {
  return typeof window !== 'undefined' &&
    (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1'));
};

/**
 * Fetch all Steam data via API route (works on Vercel)
 */
export const fetchAllSteamData = async () => {
  // Try the API route first (works when deployed to Vercel)
  try {
    const response = await fetch('/api/steam');

    if (response.ok) {
      const data = await response.json();

      const profile = data.profile ? {
        steamId: data.profile.steamid,
        personaName: data.profile.personaname,
        avatarUrl: data.profile.avatarfull,
        profileUrl: data.profile.profileurl,
        personaState: data.profile.personastate,
        lastLogoff: data.profile.lastlogoff,
        timeCreated: data.profile.timecreated,
        currentGame: data.profile.gameextrainfo || null,
        currentGameId: data.profile.gameid || null,
      } : getMockPlayerSummary();

      const ownedGames = data.games?.games ? {
        totalCount: data.games.game_count || data.games.games.length,
        games: data.games.games.map(game => ({
          appId: game.appid,
          name: game.name,
          playtimeMinutes: game.playtime_forever,
          playtimeHours: Math.round((game.playtime_forever / 60) * 10) / 10,
          playtime2Weeks: game.playtime_2weeks || 0,
          logoUrl: `https://steamcdn-a.akamaihd.net/steam/apps/${game.appid}/header.jpg`,
        })).sort((a, b) => b.playtimeMinutes - a.playtimeMinutes),
      } : getMockOwnedGames();

      const recentGames = data.recentGames ? {
        totalCount: data.recentGames.length,
        games: data.recentGames.map(game => ({
          appId: game.appid,
          name: game.name,
          playtimeMinutes: game.playtime_forever,
          playtimeHours: Math.round((game.playtime_forever / 60) * 10) / 10,
          playtime2WeeksMinutes: game.playtime_2weeks,
          playtime2WeeksHours: Math.round((game.playtime_2weeks / 60) * 10) / 10,
          logoUrl: `https://steamcdn-a.akamaihd.net/steam/apps/${game.appid}/header.jpg`,
        })),
      } : getMockRecentGames();

      return {
        profile,
        ownedGames,
        recentGames,
        isMockData: false,
      };
    }
  } catch (error) {
    console.log('API route not available, using mock data');
  }

  // Fallback to mock data for local development
  return {
    profile: getMockPlayerSummary(),
    ownedGames: getMockOwnedGames(),
    recentGames: getMockRecentGames(),
    isMockData: true,
  };
};

// Legacy exports for compatibility
export const fetchPlayerSummary = async () => {
  const data = await fetchAllSteamData();
  return data.profile;
};

export const fetchOwnedGames = async () => {
  const data = await fetchAllSteamData();
  return data.ownedGames;
};

export const fetchRecentGames = async () => {
  const data = await fetchAllSteamData();
  return data.recentGames;
};

export const hasValidCredentials = () => STEAM_ID && STEAM_ID.length > 10;

// ============================================
// Mock Data (for local development)
// ============================================

const getMockPlayerSummary = () => ({
  steamId: STEAM_ID || '76561198355375261',
  personaName: 'Yuriko',
  avatarUrl: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
  profileUrl: `https://steamcommunity.com/profiles/${STEAM_ID}`,
  personaState: 1,
  lastLogoff: Math.floor(Date.now() / 1000) - 3600,
  timeCreated: 1293753600,
});

const getMockOwnedGames = () => ({
  totalCount: 150,
  games: [
    { appId: 730, name: 'Counter-Strike 2', playtimeMinutes: 12000, playtimeHours: 200, logoUrl: 'https://steamcdn-a.akamaihd.net/steam/apps/730/header.jpg' },
    { appId: 1245620, name: 'Elden Ring', playtimeMinutes: 9600, playtimeHours: 160, logoUrl: 'https://steamcdn-a.akamaihd.net/steam/apps/1245620/header.jpg' },
    { appId: 1086940, name: "Baldur's Gate 3", playtimeMinutes: 7200, playtimeHours: 120, logoUrl: 'https://steamcdn-a.akamaihd.net/steam/apps/1086940/header.jpg' },
    { appId: 2379780, name: 'Path of Exile 2', playtimeMinutes: 4800, playtimeHours: 80, logoUrl: 'https://steamcdn-a.akamaihd.net/steam/apps/2379780/header.jpg' },
    { appId: 1172470, name: 'Apex Legends', playtimeMinutes: 3600, playtimeHours: 60, logoUrl: 'https://steamcdn-a.akamaihd.net/steam/apps/1172470/header.jpg' },
    { appId: 292030, name: 'The Witcher 3', playtimeMinutes: 3000, playtimeHours: 50, logoUrl: 'https://steamcdn-a.akamaihd.net/steam/apps/292030/header.jpg' },
  ],
});

const getMockRecentGames = () => ({
  totalCount: 4,
  games: [
    { appId: 2379780, name: 'Path of Exile 2', playtimeMinutes: 4800, playtimeHours: 80, playtime2WeeksMinutes: 1200, playtime2WeeksHours: 20, logoUrl: 'https://steamcdn-a.akamaihd.net/steam/apps/2379780/header.jpg' },
    { appId: 1086940, name: "Baldur's Gate 3", playtimeMinutes: 7200, playtimeHours: 120, playtime2WeeksMinutes: 600, playtime2WeeksHours: 10, logoUrl: 'https://steamcdn-a.akamaihd.net/steam/apps/1086940/header.jpg' },
    { appId: 730, name: 'Counter-Strike 2', playtimeMinutes: 12000, playtimeHours: 200, playtime2WeeksMinutes: 300, playtime2WeeksHours: 5, logoUrl: 'https://steamcdn-a.akamaihd.net/steam/apps/730/header.jpg' },
    { appId: 1245620, name: 'Elden Ring', playtimeMinutes: 9600, playtimeHours: 160, playtime2WeeksMinutes: 180, playtime2WeeksHours: 3, logoUrl: 'https://steamcdn-a.akamaihd.net/steam/apps/1245620/header.jpg' },
  ],
});

export default {
  fetchPlayerSummary,
  fetchOwnedGames,
  fetchRecentGames,
  fetchAllSteamData,
  hasValidCredentials,
};
