import React, { useState, useEffect } from 'react';
import { fetchAllPOE2Data, formatExperience, getClassInfo } from '../../services/poe.js';
import './POE2Stats.css';

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    borderBottom: '2px solid #af6025',
    paddingBottom: '12px',
  },
  logo: {
    width: '40px',
    height: '40px',
    backgroundColor: '#af6025',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#ffffff',
  },
  mockBadge: {
    backgroundColor: '#4a4a6a',
    color: '#a0a0c0',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    marginLeft: 'auto',
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '14px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '12px',
  },
  leagueCard: {
    backgroundColor: '#0a0a0a',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #af6025',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leagueName: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#af6025',
  },
  leagueType: {
    fontSize: '12px',
    color: '#888',
    marginTop: '4px',
  },
  accountName: {
    fontSize: '14px',
    color: '#888',
  },
  characterList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  characterCard: {
    backgroundColor: '#0a0a0a',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #1a1a1a',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'border-color 0.2s ease',
  },
  classIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1a1a2e',
    flexShrink: 0,
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '4px',
  },
  characterClass: {
    fontSize: '14px',
    marginBottom: '4px',
  },
  characterMeta: {
    fontSize: '12px',
    color: '#666',
  },
  levelBadge: {
    backgroundColor: '#1a1a1a',
    padding: '8px 16px',
    borderRadius: '8px',
    textAlign: 'center',
    flexShrink: 0,
  },
  levelLabel: {
    fontSize: '10px',
    color: '#888',
    textTransform: 'uppercase',
  },
  levelValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  leagueBadge: {
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: '#3a3a5a',
    color: '#af6025',
    marginLeft: '8px',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    color: '#888',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid #3a3a5a',
    borderTop: '3px solid #af6025',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '12px',
  },
  error: {
    backgroundColor: '#3a2020',
    border: '1px solid #ff4444',
    borderRadius: '8px',
    padding: '16px',
    color: '#ff8888',
    textAlign: 'center',
  },
  errorTitle: {
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  retryButton: {
    backgroundColor: '#af6025',
    color: '#1a1a2e',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    marginTop: '12px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#666',
  },
  statsRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #1a1a1a',
  },
  statLabel: {
    fontSize: '11px',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#af6025',
  },
};

// Add keyframes for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('poe2-stats-styles')) {
  styleSheet.id = 'poe2-stats-styles';
  document.head.appendChild(styleSheet);
}

function POE2Stats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const poeData = await fetchAllPOE2Data();
      setData(poeData);
    } catch (err) {
      setError(err.message || 'Failed to load POE2 data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getClassInitial = (className) => {
    const initials = {
      'Warrior': 'W',
      'Mercenary': 'M',
      'Ranger': 'R',
      'Sorceress': 'S',
      'Witch': 'Wi',
      'Monk': 'Mo',
      'Huntress': 'H',
      'Druid': 'D',
    };
    return initials[className] || className.charAt(0);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          Loading Path of Exile 2 data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <div style={styles.errorTitle}>Error Loading Data</div>
          <div>{error}</div>
          <button style={styles.retryButton} onClick={loadData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { account, characters, currentLeague, isMockData } = data;

  // Sort characters by level descending
  const sortedCharacters = [...characters].sort((a, b) => b.level - a.level);

  // Calculate stats
  const totalLevels = characters.reduce((sum, char) => sum + char.level, 0);
  const highestLevel = Math.max(...characters.map(c => c.level));
  const challengeLeagueChars = characters.filter(c => c.league === currentLeague?.name).length;

  return (
    <div className="poe2-stats">
      <div style={styles.header}>
        <div style={styles.logo}>P2</div>
        <h2 style={styles.title}>Path of Exile 2</h2>
        {isMockData && <span style={styles.mockBadge}>Demo Data</span>}
      </div>

      {/* Current League */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Current League</div>
        <div style={styles.leagueCard}>
          <div>
            <div style={styles.leagueName}>{currentLeague?.name || 'Unknown'}</div>
            <div style={styles.leagueType}>{currentLeague?.type || 'Challenge League'}</div>
          </div>
          <div style={styles.accountName}>{account.name}</div>
        </div>

        {/* Quick Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Characters</div>
            <div style={styles.statValue}>{characters.length}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Highest Level</div>
            <div style={styles.statValue}>{highestLevel}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>In League</div>
            <div style={styles.statValue}>{challengeLeagueChars}</div>
          </div>
        </div>
      </div>

      {/* Characters List */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Characters</div>
        {sortedCharacters.length === 0 ? (
          <div style={styles.emptyState}>No characters found</div>
        ) : (
          <ul style={styles.characterList}>
            {sortedCharacters.map((character, index) => {
              const classInfo = getClassInfo(character.class);
              return (
                <li
                  key={index}
                  style={{
                    ...styles.characterCard,
                    borderColor: index === 0 ? classInfo.color : '#3a3a5a',
                  }}
                >
                  <div
                    style={{
                      ...styles.classIcon,
                      backgroundColor: classInfo.color,
                    }}
                  >
                    {getClassInitial(character.class)}
                  </div>
                  <div style={styles.characterInfo}>
                    <div style={styles.characterName}>
                      {character.name}
                      <span style={styles.leagueBadge}>{character.league}</span>
                    </div>
                    <div style={{ ...styles.characterClass, color: classInfo.color }}>
                      {character.class}
                    </div>
                    <div style={styles.characterMeta}>
                      XP: {formatExperience(character.experience)}
                    </div>
                  </div>
                  <div style={styles.levelBadge}>
                    <div style={styles.levelLabel}>Level</div>
                    <div style={styles.levelValue}>{character.level}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default POE2Stats;
