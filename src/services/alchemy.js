import { config } from '../config.js';

/**
 * Fetches NFTs owned by a wallet address using Ankr API (free, no key needed)
 * @param {string} walletAddress - The wallet address to fetch NFTs for
 * @param {string} pageToken - Pagination token
 * @param {number} pageSize - Number of NFTs per page
 * @returns {Promise<{nfts: Array, pageToken: string|null}>}
 */
export async function fetchNFTsForWallet(walletAddress = null, pageToken = null, pageSize = 50) {
  const address = walletAddress || config.wallet.address;

  if (!address || address === '0x0000000000000000000000000000000000000000') {
    throw new Error('Wallet address is not configured');
  }

  // Use Ankr API (free, no key required for basic usage)
  const requestBody = {
    jsonrpc: '2.0',
    method: 'ankr_getNFTsByOwner',
    params: {
      blockchain: 'eth',
      walletAddress: address,
      pageSize,
      ...(pageToken && { pageToken }),
    },
    id: 1,
  };

  const response = await fetch('https://rpc.ankr.com/multichain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || 'API error');
  }

  const result = data.result || {};

  // Transform Ankr response to match our expected format
  const nfts = (result.assets || []).map(item => ({
    contract: {
      address: item.contractAddress,
      name: item.collectionName,
    },
    tokenId: item.tokenId,
    name: item.name || `#${item.tokenId}`,
    description: item.description,
    image: {
      cachedUrl: item.imageUrl,
      thumbnailUrl: item.imageUrl,
      originalUrl: item.imageUrl,
    },
    collection: {
      name: item.collectionName,
      slug: item.symbol,
    },
    raw: item,
  }));

  return {
    nfts,
    pageToken: result.nextPageToken || null,
  };
}

/**
 * Fetches all NFTs for a wallet by handling pagination automatically
 * @param {string} walletAddress - The wallet address to fetch NFTs for
 * @param {number} maxNFTs - Maximum number of NFTs to fetch
 * @returns {Promise<Array>} Array of all NFTs
 */
export async function fetchAllNFTs(walletAddress = null, maxNFTs = 200) {
  const allNFTs = [];
  let pageToken = null;

  do {
    const result = await fetchNFTsForWallet(walletAddress, pageToken);
    allNFTs.push(...result.nfts);
    pageToken = result.pageToken;

    if (allNFTs.length >= maxNFTs) {
      break;
    }
  } while (pageToken);

  return allNFTs.slice(0, maxNFTs);
}

/**
 * Extracts the best available image URL from an NFT object
 * @param {Object} nft - The NFT object
 * @returns {string|null} The image URL or null
 */
export function getNFTImageUrl(nft) {
  const image = nft.image;
  if (!image) return null;

  return (
    image.cachedUrl ||
    image.thumbnailUrl ||
    image.originalUrl ||
    null
  );
}

/**
 * Gets the OpenSea URL for an NFT
 * @param {Object} nft - The NFT object
 * @returns {string} The OpenSea URL
 */
export function getOpenSeaUrl(nft) {
  const contractAddress = nft.contract?.address;
  const tokenId = nft.tokenId;

  if (!contractAddress || !tokenId) {
    return 'https://opensea.io';
  }

  return `https://opensea.io/assets/ethereum/${contractAddress}/${tokenId}`;
}
