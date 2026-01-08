import { config } from '../config.js';

/**
 * Fetches NFTs owned by a wallet address via the serverless proxy
 * @param {string} walletAddress - The wallet address to fetch NFTs for
 * @param {string} pageKey - Pagination key
 * @param {number} pageSize - Number of NFTs per page
 * @returns {Promise<{nfts: Array, pageKey: string|null}>}
 */
export async function fetchNFTsForWallet(walletAddress = null, pageKey = null, pageSize = 100) {
  const address = walletAddress || config.wallet.address;

  const params = new URLSearchParams({ pageSize: pageSize.toString() });
  if (address) params.append('address', address);
  if (pageKey) params.append('pageKey', pageKey);

  const response = await fetch(`/api/nfts?${params}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.configured) {
    console.warn('NFT API not configured:', data.message);
    return { nfts: [], pageKey: null };
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return {
    nfts: data.nfts || [],
    pageKey: data.pageKey || null,
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
  let pageKey = null;

  do {
    const result = await fetchNFTsForWallet(walletAddress, pageKey);
    allNFTs.push(...result.nfts);
    pageKey = result.pageKey;

    if (allNFTs.length >= maxNFTs) {
      break;
    }
  } while (pageKey);

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
