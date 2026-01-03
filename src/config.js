// Configuration for portfolio data sources

export const config = {
  // Profile info
  profile: {
    name: 'Yuriko',
    tagline: 'Gamer & NFT Collector',
  },

  // Ethereum wallet address for NFT display
  wallet: {
    address: '0xc9b7a281e601baf49d6bb8ba390868539eac2c7c',
  },

  // Steam profile
  steam: {
    steamId: '76561198355375261',
    apiKey: '', // Set via Vercel env var STEAM_API_KEY
  },

  // FFXIV character
  ffxiv: {
    characterName: 'Yuriko Mh',
    server: 'Excalibur',
    dataCenter: 'Primal',
  },

  // World of Warcraft
  wow: {
    region: 'us',
    realm: 'moon-guard',
    characterName: 'Yüriko',
    clientId: '', // Get from https://develop.battle.net/
    clientSecret: '',
  },

  // Path of Exile 2
  poe2: {
    accountName: 'YourAccount',
    realm: 'pc',
  },

  // Nikke (manual stats - no API)
  nikke: {
    commanderLevel: 200,
    totalNikkes: 150,
    sssNikkes: 45,
    favoriteSquad: ['Scarlet', 'Modernia', 'Rouge'],
    pvpRank: 'Champion',
  },

  // API endpoints
  apis: {
    alchemy: 'https://eth-mainnet.g.alchemy.com/nft/v3',
    alchemyKey: '', // Get from https://www.alchemy.com/
    steam: 'https://api.steampowered.com',
    xivapi: 'https://xivapi.com',
    fflogs: 'https://www.fflogs.com/api/v2',
    fflogsClientId: '', // Get from https://www.fflogs.com/api/clients
    fflogsClientSecret: '',
    blizzard: 'https://us.api.blizzard.com',
    poe: 'https://api.pathofexile.com',
  },
}
