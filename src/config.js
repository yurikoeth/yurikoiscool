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
    lodestoneId: '26595912',
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
    commanderName: 'YURIKO',
    commanderId: '00195620',
    server: '031 / 20PHX',
    union: 'サイバーマネー',
    squadPower: 66488,
    nikkesObtained: 68,
    costumes: 11,
    // Representative squad (top 5)
    representativeSquad: [
      { name: 'Cinderella', power: 14192 },
      { name: 'Scarlet: Black Shadow', power: 12094 },
      { name: 'Red Hood', power: 10818 },
      { name: 'Crown', power: 10270 },
      { name: 'Modernia', power: 12094 },
    ],
    // Nikke distribution by rarity
    distribution: {
      ssr: 45,
      sr: 15,
      r: 8,
    },
  },

  // API endpoints
  apis: {
    alchemy: 'https://eth-mainnet.g.alchemy.com/nft/v3',
    alchemyKey: '', // Get from https://www.alchemy.com/
    steam: 'https://api.steampowered.com',
    xivapi: 'https://xivapi.com',
    warcraftLogs: 'https://www.warcraftlogs.com/api/v2',
    warcraftLogsClientId: '', // Get from https://www.warcraftlogs.com/api/clients
    warcraftLogsClientSecret: '',
    blizzard: 'https://us.api.blizzard.com',
    poe: 'https://api.pathofexile.com',
  },
}
