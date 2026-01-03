import { useState, useEffect } from 'react';
import { fetchAllNFTs, getNFTImageUrl, getOpenSeaUrl } from '../services/alchemy.js';
import './NFTGallery.css';

function NFTCard({ nft, onClick }) {
  const imageUrl = getNFTImageUrl(nft);
  const name = nft.name || nft.title || `#${nft.tokenId}`;
  const collectionName = nft.contract?.name || nft.collection?.name || 'Unknown Collection';
  const openSeaUrl = getOpenSeaUrl(nft);

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(nft);
    }
  };

  return (
    <a
      href={openSeaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="nft-card"
      onClick={handleClick}
    >
      <div className="nft-image-container">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="nft-image"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="nft-image-placeholder" style={{ display: imageUrl ? 'none' : 'flex' }}>
          <span>No Image</span>
        </div>
      </div>
      <div className="nft-info">
        <h3 className="nft-name">{name}</h3>
        <p className="nft-collection">{collectionName}</p>
      </div>
    </a>
  );
}

function NFTSkeleton() {
  return (
    <div className="nft-card nft-skeleton">
      <div className="nft-image-container skeleton-image"></div>
      <div className="nft-info">
        <div className="skeleton-text skeleton-name"></div>
        <div className="skeleton-text skeleton-collection"></div>
      </div>
    </div>
  );
}

function NFTModal({ nft, onClose }) {
  const imageUrl = getNFTImageUrl(nft);
  const name = nft.name || nft.title || `#${nft.tokenId}`;
  const collectionName = nft.contract?.name || nft.collection?.name || 'Unknown Collection';
  const openSeaUrl = getOpenSeaUrl(nft);
  const description = nft.description || nft.raw?.metadata?.description;

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="nft-modal-overlay" onClick={onClose}>
      <div className="nft-modal" onClick={(e) => e.stopPropagation()}>
        <button className="nft-modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="nft-modal-content">
          <div className="nft-modal-image-container">
            {imageUrl ? (
              <img src={imageUrl} alt={name} className="nft-modal-image" />
            ) : (
              <div className="nft-image-placeholder">
                <span>No Image</span>
              </div>
            )}
          </div>
          <div className="nft-modal-details">
            <h2 className="nft-modal-name">{name}</h2>
            <p className="nft-modal-collection">{collectionName}</p>
            {description && <p className="nft-modal-description">{description}</p>}
            <a
              href={openSeaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="nft-opensea-link"
            >
              View on OpenSea
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NFTGallery() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNft, setSelectedNft] = useState(null);

  useEffect(() => {
    async function loadNFTs() {
      try {
        setLoading(true);
        setError(null);
        const fetchedNFTs = await fetchAllNFTs();
        setNfts(fetchedNFTs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadNFTs();
  }, []);

  const handleCardClick = (nft) => {
    setSelectedNft(nft);
  };

  const handleCloseModal = () => {
    setSelectedNft(null);
  };

  if (error) {
    return (
      <div className="nft-gallery-container">
        <div className="nft-error">
          <p>Failed to load NFTs</p>
          <p className="nft-error-detail">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nft-gallery-container">
      {loading ? (
        <div className="nft-grid">
          {[...Array(8)].map((_, i) => (
            <NFTSkeleton key={i} />
          ))}
        </div>
      ) : nfts.length === 0 ? (
        <div className="nft-empty">
          <p>No NFTs found in this wallet</p>
        </div>
      ) : (
        <div className="nft-grid">
          {nfts.map((nft, index) => (
            <NFTCard
              key={`${nft.contract?.address}-${nft.tokenId}-${index}`}
              nft={nft}
              onClick={handleCardClick}
            />
          ))}
        </div>
      )}

      {selectedNft && <NFTModal nft={selectedNft} onClose={handleCloseModal} />}
    </div>
  );
}
