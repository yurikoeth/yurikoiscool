import React, { useState } from 'react';

const styles = {
  container: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
  },
  toggleButton: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#1DB954',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(29, 185, 84, 0.4)',
    transition: 'all 0.3s ease',
  },
  toggleButtonHover: {
    transform: 'scale(1.1)',
    boxShadow: '0 6px 25px rgba(29, 185, 84, 0.5)',
  },
  musicIcon: {
    width: '28px',
    height: '28px',
    color: '#fff',
  },
  playerPanel: {
    position: 'absolute',
    bottom: '70px',
    right: '0',
    backgroundColor: '#000',
    borderRadius: '12px',
    padding: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    border: '1px solid #1a1a1a',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '600',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '0',
    lineHeight: '1',
  },
};

function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Spotify playlist ID extracted from URL
  const playlistId = '3P3Qn98cYn5OZvwK6UxeLT';

  return (
    <div style={styles.container}>
      {isOpen && (
        <div style={styles.playerPanel}>
          <div style={styles.panelHeader}>
            <span>Dark Opera Playlist</span>
            <button style={styles.closeButton} onClick={() => setIsOpen(false)}>
              x
            </button>
          </div>
          <iframe
            title="Spotify Playlist"
            src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
            width="300"
            height="380"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ borderRadius: '8px' }}
          />
        </div>
      )}

      <button
        style={{
          ...styles.toggleButton,
          ...(isHovered ? styles.toggleButtonHover : {}),
        }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={isOpen ? 'Close Music Player' : 'Open Music Player'}
      >
        <svg style={styles.musicIcon} viewBox="0 0 24 24" fill="currentColor">
          {isOpen ? (
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          ) : (
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          )}
        </svg>
      </button>
    </div>
  );
}

export default MusicPlayer;
