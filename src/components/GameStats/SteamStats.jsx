import React, { useState, useEffect, useRef } from 'react';
import { fetchAllSteamData, hasValidCredentials } from '../../services/steam.js';
import './SteamStats.css';

// Helper to format playtime
const formatPlaytime = (hours) => {
  if (hours >= 1000) {
    return `${(hours / 1000).toFixed(1)}k hrs`;
  }
  return `${hours} hrs`;
};

// Helper to get persona state text
const getPersonaState = (state, currentGame) => {
  if (currentGame) {
    return 'In-Game';
  }
  const states = {
    0: 'Offline',
    1: 'Online',
    2: 'Busy',
    3: 'Away',
    4: 'Snooze',
    5: 'Looking to Trade',
    6: 'Looking to Play',
  };
  return states[state] || 'Unknown';
};

// Helper to format date
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Steam Logo SVG Component
const SteamLogo = () => (
  <svg
    className="steam-logo"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.44 8.87 8 9.8v-1.62c-3.26-.87-5.67-3.86-5.67-7.43 0-.7.1-1.38.28-2.02l3.44 1.42a2.5 2.5 0 0 0 2.45 2.95 2.5 2.5 0 0 0 2.5-2.5c0-.14-.02-.27-.04-.4l2.82-2.01c.93 0 1.82-.3 2.56-.81L20.5 11c.88 0 1.69-.3 2.34-.8.1.58.16 1.18.16 1.8 0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm6.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
  </svg>
);

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="steam-stats steam-stats--loading">
    <div className="steam-header">
      <div className="skeleton skeleton--circle"></div>
      <div className="skeleton-text">
        <div className="skeleton skeleton--text skeleton--text-lg"></div>
        <div className="skeleton skeleton--text skeleton--text-sm"></div>
      </div>
    </div>
    <div className="steam-stats-grid">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton skeleton--card"></div>
      ))}
    </div>
    <div className="steam-games-section">
      <div className="skeleton skeleton--text skeleton--text-md"></div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton skeleton--game-card"></div>
      ))}
    </div>
  </div>
);

// Error State Component
const ErrorState = ({ error, onRetry }) => (
  <div className="steam-stats steam-stats--error">
    <div className="error-content">
      <SteamLogo />
      <h3>Failed to load Steam stats</h3>
      <p>{error}</p>
      <button className="retry-button" onClick={onRetry}>
        Try Again
      </button>
    </div>
  </div>
);

// Game Card Component
const GameCard = ({ game, showRecentPlaytime = false }) => (
  <div className="game-card">
    <div className="game-card__image-container">
      <img
        src={game.logoUrl}
        alt={game.name}
        className="game-card__image"
        loading="lazy"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    </div>
    <div className="game-card__info">
      <h4 className="game-card__title">{game.name}</h4>
      <div className="game-card__stats">
        <span className="game-card__playtime">
          {formatPlaytime(game.playtimeHours)} total
        </span>
        {showRecentPlaytime && game.playtime2WeeksHours > 0 && (
          <span className="game-card__recent">
            {game.playtime2WeeksHours} hrs last 2 weeks
          </span>
        )}
      </div>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ icon, label, value, subValue }) => (
  <div className="stat-card">
    <div className="stat-card__icon">{icon}</div>
    <div className="stat-card__content">
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
      {subValue && <span className="stat-card__subvalue">{subValue}</span>}
    </div>
  </div>
);

// Main SteamStats Component
const SteamStats = ({ topGamesCount = 5, showRecentGames = true }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllGames, setShowAllGames] = useState(false);
  const mountedRef = useRef(true);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const steamData = await fetchAllSteamData();
      if (mountedRef.current) setData(steamData);
    } catch (err) {
      if (mountedRef.current) setError(err.message || 'Failed to load Steam data');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    loadData();
    return () => { mountedRef.current = false; };
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadData} />;
  }

  if (!data) {
    return null;
  }

  const { profile, ownedGames, recentGames, isMockData } = data;
  const topGames = ownedGames.games.slice(0, topGamesCount);
  const totalPlaytimeHours = Math.round(
    ownedGames.games.reduce((sum, game) => sum + game.playtimeHours, 0)
  );

  return (
    <div className="steam-stats">
      {isMockData && (
        <div className="steam-notice">
          <span className="steam-notice__icon">!</span>
          <span>
            Showing demo data. Configure Steam API credentials in config.js for live stats.
            Note: Steam API requires a CORS proxy for browser use.
          </span>
        </div>
      )}

      {/* Profile Header */}
      <div className="steam-header">
        <a
          href={profile.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="steam-header__avatar-link"
        >
          <img
            src={profile.avatarUrl}
            alt={profile.personaName}
            className="steam-header__avatar"
          />
          <span
            className={`steam-header__status steam-header__status--${
              profile.currentGame ? 'ingame' : profile.personaState === 1 ? 'online' : 'offline'
            }`}
          ></span>
        </a>
        <div className="steam-header__info">
          <div className="steam-header__name-row">
            <SteamLogo />
            <h2 className="steam-header__name">{profile.personaName}</h2>
            {profile.level > 0 && (
              <span className="steam-header__level">Lvl {profile.level}</span>
            )}
          </div>
          <p className="steam-header__status-text">
            {getPersonaState(profile.personaState, profile.currentGame)}
            {profile.currentGame && (
              <span className="steam-header__current-game"> - Playing {profile.currentGame}</span>
            )}
            {!profile.currentGame && profile.personaState === 0 && profile.lastLogoff && (
              <span> - Last seen {formatDate(profile.lastLogoff)}</span>
            )}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="steam-stats-grid">
        <StatCard
          icon={
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
          }
          label="Games Owned"
          value={ownedGames.totalCount}
        />
        <StatCard
          icon={
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
          }
          label="Total Playtime"
          value={formatPlaytime(totalPlaytimeHours)}
        />
      </div>

      {/* Top Games by Playtime */}
      <div className="steam-games-section">
        <h3 className="steam-section-title">
          <svg viewBox="0 0 24 24" fill="currentColor" className="section-icon">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
          Top Games by Playtime
        </h3>
        <div className="steam-games-list">
          {topGames.map((game) => (
            <GameCard key={game.appId} game={game} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {showRecentGames && recentGames.games.length > 0 && (
        <div className="steam-games-section">
          <h3 className="steam-section-title">
            <svg viewBox="0 0 24 24" fill="currentColor" className="section-icon">
              <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
            </svg>
            Recent Activity (Last 2 Weeks)
          </h3>
          <div className="steam-games-list steam-games-list--recent">
            {recentGames.games.map((game) => (
              <GameCard key={game.appId} game={game} showRecentPlaytime />
            ))}
          </div>
        </div>
      )}

      {/* All Games Dropdown */}
      <div className="steam-all-games-section">
        <button
          className={`steam-all-games-toggle ${showAllGames ? 'steam-all-games-toggle--open' : ''}`}
          onClick={() => setShowAllGames(!showAllGames)}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="toggle-icon">
            <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
          </svg>
          View All {ownedGames.totalCount} Games
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`chevron-icon ${showAllGames ? 'chevron-icon--open' : ''}`}
          >
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
          </svg>
        </button>

        <div className={`steam-all-games-panel ${showAllGames ? 'steam-all-games-panel--open' : ''}`}>
          <div className="steam-all-games-grid">
            {ownedGames.games.map((game) => (
              <a
                key={game.appId}
                href={`https://store.steampowered.com/app/${game.appId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="steam-game-tile"
                title={`${game.name} - ${formatPlaytime(game.playtimeHours)}`}
              >
                <img
                  src={game.logoUrl}
                  alt={game.name}
                  className="steam-game-tile__image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="steam-game-tile__overlay">
                  <span className="steam-game-tile__name">{game.name}</span>
                  <span className="steam-game-tile__playtime">{formatPlaytime(game.playtimeHours)}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Action Links */}
      <div className="steam-footer">
        <div className="steam-action-links">
          <a
            href={`steam://friends/add/${profile.steamId}`}
            className="steam-action-link steam-action-link--add"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="action-icon">
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            Add Friend
          </a>
          <a
            href={`steam://friends/message/${profile.steamId}`}
            className="steam-action-link steam-action-link--message"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="action-icon">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
            </svg>
            Message
          </a>
        </div>
        <a
          href={profile.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="steam-profile-link"
        >
          <SteamLogo />
          View Full Steam Profile
          <svg viewBox="0 0 24 24" fill="currentColor" className="external-icon">
            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default SteamStats;
