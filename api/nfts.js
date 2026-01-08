// Vercel Serverless Function - NFT API Proxy
// This avoids CORS issues by proxying Alchemy NFT API requests server-side

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS || '0xc9b7a281e601baf49d6bb8ba390868539eac2c7c';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!ALCHEMY_API_KEY) {
    return res.status(200).json({
      configured: false,
      message: 'ALCHEMY_API_KEY not configured in Vercel environment variables',
      nfts: []
    });
  }

  const { pageKey, pageSize = 100 } = req.query;
  const address = req.query.address || WALLET_ADDRESS;

  try {
    const baseUrl = `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`;

    const params = new URLSearchParams({
      owner: address,
      withMetadata: 'true',
      pageSize: pageSize.toString(),
    });

    if (pageKey) {
      params.append('pageKey', pageKey);
    }

    const response = await fetch(`${baseUrl}/getNFTsForOwner?${params}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Alchemy API error:', response.status, errorText);
      throw new Error(`Alchemy API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform Alchemy response to match existing format
    const nfts = (data.ownedNfts || [])
      .filter(nft => {
        // Filter out spam NFTs
        const spamInfo = nft.contract?.spamClassifications || [];
        return spamInfo.length === 0;
      })
      .map(nft => ({
        contract: {
          address: nft.contract?.address,
          name: nft.contract?.name || nft.contract?.openSeaMetadata?.collectionName,
        },
        tokenId: nft.tokenId,
        name: nft.name || nft.title || `#${nft.tokenId}`,
        description: nft.description,
        image: {
          cachedUrl: nft.image?.cachedUrl || nft.image?.thumbnailUrl,
          thumbnailUrl: nft.image?.thumbnailUrl || nft.image?.cachedUrl,
          originalUrl: nft.image?.originalUrl || nft.raw?.metadata?.image,
        },
        collection: {
          name: nft.contract?.openSeaMetadata?.collectionName || nft.contract?.name,
          slug: nft.contract?.openSeaMetadata?.collectionSlug,
        },
        raw: nft,
      }));

    res.status(200).json({
      configured: true,
      nfts,
      pageKey: data.pageKey || null,
      totalCount: data.totalCount || nfts.length,
    });
  } catch (error) {
    console.error('NFT API error:', error);
    res.status(200).json({
      configured: true,
      error: error.message || 'Failed to fetch NFT data',
      nfts: []
    });
  }
}
