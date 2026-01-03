// Vercel Serverless Function - Steam API Proxy
// This avoids CORS issues by proxying Steam API requests server-side

const STEAM_API_KEY = process.env.STEAM_API_KEY || 'B6B48C572C22956F30632E5B3890E6C8';
const STEAM_ID = process.env.STEAM_ID || '76561198355375261';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { endpoint } = req.query;

  try {
    let data = {};

    if (endpoint === 'profile' || !endpoint) {
      // Fetch player summary
      const profileRes = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${STEAM_ID}`
      );
      const profileData = await profileRes.json();
      data.profile = profileData.response?.players?.[0] || null;
    }

    if (endpoint === 'games' || !endpoint) {
      // Fetch owned games
      const gamesRes = await fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&include_appinfo=1&include_played_free_games=1`
      );
      const gamesData = await gamesRes.json();
      data.games = gamesData.response || { games: [], game_count: 0 };
    }

    if (endpoint === 'recent' || !endpoint) {
      // Fetch recently played games
      const recentRes = await fetch(
        `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&count=10`
      );
      const recentData = await recentRes.json();
      data.recentGames = recentData.response?.games || [];
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Steam API error:', error);
    res.status(500).json({ error: 'Failed to fetch Steam data' });
  }
}
