import { useState, useEffect, useRef } from 'react';
import { fetchAllWoWData } from '../../services/blizzard.js';
import { fetchAllWarcraftLogsData, getParseColor, isWarcraftLogsConfigured } from '../../services/warcraftlogs.js';

const styles = {
  container: {
    backgroundColor: '#000000',
    borderRadius: '12px',
    padding: '24px',
    color: '#e0e0e0',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    border: '1px solid #1a1a1a',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '2px solid #ff8000',
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '8px',
    border: '2px solid #ff8000',
    objectFit: 'cover',
  },
  avatarFallback: {
    width: '64px',
    height: '64px',
    borderRadius: '8px',
    backgroundColor: '#ff8000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#ffffff',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#888',
  },
  specBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#1a1a1a',
    color: '#ff8000',
    marginTop: '6px',
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '13px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '12px',
  },
  statsRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #1a1a1a',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '11px',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  ratingValue: {
    fontSize: '28px',
    fontWeight: 'bold',
  },
  dungeonList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  dungeonItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: '#0a0a0a',
    borderRadius: '6px',
    marginBottom: '6px',
    border: '1px solid #1a1a1a',
  },
  dungeonName: {
    flex: 1,
    fontSize: '14px',
  },
  keyLevel: {
    fontWeight: 'bold',
    padding: '3px 10px',
    borderRadius: '4px',
    backgroundColor: '#1a1a1a',
    marginLeft: '12px',
    fontSize: '14px',
  },
  upgrades: {
    marginLeft: '8px',
    fontSize: '12px',
  },
  raidCard: {
    backgroundColor: '#0a0a0a',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #1a1a1a',
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  raidName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
  },
  raidProgress: {
    fontSize: '14px',
    fontWeight: '600',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 40px',
    color: '#888',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid #1a1a1a',
    borderTop: '3px solid #ff8000',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '12px',
  },
  error: {
    backgroundColor: '#1a0a0a',
    border: '1px solid #ff4444',
    borderRadius: '8px',
    padding: '16px',
    color: '#ff8888',
    textAlign: 'center',
  },
  link: {
    display: 'inline-block',
    marginTop: '16px',
    padding: '10px 20px',
    backgroundColor: '#ff8000',
    color: '#000',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '14px',
  },
  rankBadge: {
    flex: '1',
    minWidth: '80px',
    backgroundColor: '#0a0a0a',
    border: '1px solid #1a1a1a',
    borderRadius: '8px',
    padding: '10px 8px',
    textAlign: 'center',
  },
  rankLabel: {
    display: 'block',
    fontSize: '10px',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  rankValue: {
    display: 'block',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#ff8000',
  },
  rankSpec: {
    display: 'block',
    fontSize: '9px',
    color: '#666',
    marginTop: '2px',
  },
  raidDetailed: {
    backgroundColor: '#0a0a0a',
    borderRadius: '8px',
    border: '1px solid #1a1a1a',
    padding: '14px 16px',
    marginBottom: '8px',
  },
  raidHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  difficultyRow: {
    display: 'flex',
    gap: '8px',
  },
  difficultyBadge: {
    flex: 1,
    padding: '6px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: '#1a1a1a',
  },
  // Warcraft Logs styles
  logsSection: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #1a1a1a',
  },
  logsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  logsTitle: {
    fontSize: '13px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    margin: 0,
  },
  logsNotConfigured: {
    backgroundColor: '#0a0a0a',
    border: '1px solid #1a1a1a',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    color: '#666',
    fontSize: '13px',
  },
  difficultyTabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '12px',
    backgroundColor: '#0a0a0a',
    padding: '4px',
    borderRadius: '8px',
  },
  difficultyTab: {
    flex: 1,
    padding: '8px 12px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: 'transparent',
    color: '#666',
  },
  difficultyTabActive: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
  },
  parseCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: '8px',
    border: '1px solid #1a1a1a',
    padding: '12px',
    marginBottom: '8px',
  },
  parseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  bossName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
  },
  parseValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: '#1a1a1a',
  },
  parseStats: {
    display: 'flex',
    gap: '12px',
    fontSize: '11px',
    color: '#666',
  },
  averageParseCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: '8px',
    border: '1px solid #1a1a1a',
    padding: '16px',
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  averageLabel: {
    fontSize: '12px',
    color: '#888',
    textTransform: 'uppercase',
  },
  averageValue: {
    fontSize: '28px',
    fontWeight: 'bold',
  },
  noParses: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
    fontSize: '13px',
  },
  wclLink: {
    display: 'inline-block',
    marginTop: '12px',
    marginLeft: '8px',
    padding: '10px 20px',
    backgroundColor: '#f8b700',
    color: '#000',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '14px',
  },
  // 3D Model Viewer styles
  modelSection: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #1a1a1a',
  },
  modelContainer: {
    position: 'relative',
    width: '100%',
    height: '400px',
    backgroundColor: '#0a0a0a',
    borderRadius: '12px',
    border: '1px solid #1a1a1a',
    overflow: 'hidden',
  },
  modelIframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  modelOverlay: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    padding: '12px',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelHint: {
    fontSize: '11px',
    color: '#666',
  },
  modelLink: {
    fontSize: '12px',
    color: '#ff8000',
    textDecoration: 'none',
  },
};

// Add keyframes for spinner
if (typeof document !== 'undefined' && !document.getElementById('wow-stats-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'wow-stats-styles';
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

// 3D Character Model Viewer Component using WoWHead widget
function CharacterModelViewer({ region, realm, name }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load WoWHead's script for 3D model viewing
    if (!document.getElementById('wowhead-3d-script')) {
      const script = document.createElement('script');
      script.id = 'wowhead-3d-script';
      script.src = '//wow.zamimg.com/js/tooltips.js';
      script.async = true;
      script.onload = () => {
        // Configure WoWHead
        if (window.whTooltips) {
          window.whTooltips.renameLinks = false;
          window.whTooltips.colorLinks = false;
        }
        setLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setLoaded(true);
    }
  }, []);

  const realmSlug = realm.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
  const wowheadUrl = `https://www.wowhead.com/character/${region}/${realmSlug}/${encodeURIComponent(name)}`;

  return (
    <div style={styles.modelContainer}>
      <a
        href={wowheadUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          textDecoration: 'none',
          color: '#fff',
          gap: '16px',
        }}
      >
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '3px solid #ff8000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          fontSize: '48px',
        }}>
          🎮
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
            View 3D Model
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            Click to open on WoWHead
          </div>
        </div>
        <div style={{
          padding: '10px 24px',
          backgroundColor: '#ff8000',
          color: '#000',
          borderRadius: '6px',
          fontWeight: '600',
          fontSize: '14px',
        }}>
          Open 3D Viewer →
        </div>
      </a>
    </div>
  );
}

function WoWStats() {
  const [data, setData] = useState(null);
  const [logsData, setLogsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('heroic');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const wowData = await fetchAllWoWData();
      setData(wowData);

      // Load Warcraft Logs data if configured
      if (isWarcraftLogsConfigured()) {
        setLogsLoading(true);
        try {
          const logs = await fetchAllWarcraftLogsData();
          setLogsData(logs);
        } catch (logsErr) {
          console.error('Failed to load Warcraft Logs data:', logsErr);
          // Don't fail the whole component if logs fail
        } finally {
          setLogsLoading(false);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load WoW data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getProgressColor = (summary) => {
    if (summary?.includes('M')) return '#ff8000'; // Mythic - orange
    if (summary?.includes('H')) return '#a335ee'; // Heroic - purple
    if (summary?.includes('N')) return '#1eff00'; // Normal - green
    return '#888';
  };

  const getUpgradeSymbol = (upgrades) => {
    if (upgrades >= 3) return '+++';
    if (upgrades === 2) return '++';
    if (upgrades === 1) return '+';
    return '';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          Loading Raider.io data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Error Loading Data</div>
          <div>{error}</div>
          <button style={{ ...styles.link, cursor: 'pointer', border: 'none' }} onClick={loadData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { profile, mythicPlus, raids } = data;

  return (
    <div style={styles.container}>
      {/* Header with Character Avatar */}
      <div style={styles.header}>
        {profile.thumbnailUrl ? (
          <img
            src={profile.thumbnailUrl}
            alt={profile.name}
            style={styles.avatar}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div style={{ ...styles.avatarFallback, display: profile.thumbnailUrl ? 'none' : 'flex' }}>
          {profile.name?.[0] || 'W'}
        </div>
        <div style={styles.headerInfo}>
          <h2 style={styles.title}>{profile.name}</h2>
          <p style={styles.subtitle}>
            {profile.race} {profile.class} • {profile.realm}
          </p>
          <span style={styles.specBadge}>{profile.activeSpec} {profile.activeRole}</span>
        </div>
      </div>

      {/* Item Level & M+ Score */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Item Level</div>
          <div style={{ ...styles.statValue, color: '#a335ee' }}>
            {profile.gear?.itemLevel || 0}
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>M+ Rating</div>
          <div style={{ ...styles.ratingValue, color: mythicPlus.ratingColor }}>
            {Math.round(mythicPlus.rating)}
          </div>
        </div>
      </div>

      {/* M+ Rankings */}
      {profile.mythicPlusRanks?.spec?.realm && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>M+ Rankings</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={styles.rankBadge}>
              <span style={styles.rankLabel}>Realm</span>
              <span style={styles.rankValue}>#{profile.mythicPlusRanks.spec.realm}</span>
              <span style={styles.rankSpec}>{profile.activeSpec}</span>
            </div>
            <div style={styles.rankBadge}>
              <span style={styles.rankLabel}>Region</span>
              <span style={styles.rankValue}>#{profile.mythicPlusRanks.spec.region}</span>
              <span style={styles.rankSpec}>{profile.activeSpec}</span>
            </div>
            <div style={{ ...styles.rankBadge, opacity: 0.7 }}>
              <span style={styles.rankLabel}>World</span>
              <span style={styles.rankValue}>#{profile.mythicPlusRanks.spec.world}</span>
              <span style={styles.rankSpec}>{profile.activeSpec}</span>
            </div>
          </div>
        </div>
      )}

      {/* Best M+ Runs */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Best Mythic+ Runs</div>
        <ul style={styles.dungeonList}>
          {mythicPlus.bestRuns?.slice(0, 5).map((run, index) => (
            <li key={index} style={styles.dungeonItem}>
              {run.iconUrl && (
                <img
                  src={run.iconUrl}
                  alt=""
                  style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <span style={styles.dungeonName}>{run.shortName || run.dungeon}</span>
              <span style={styles.keyLevel}>+{run.level}</span>
              <span style={{ ...styles.upgrades, color: run.completedInTime ? '#1eff00' : '#ff4444' }}>
                {run.completedInTime ? getUpgradeSymbol(run.upgrades) : '✗'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Raid Progress */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Raid Progression</div>
        {/* Featured raid with all difficulties */}
        {raids.raids?.[0] && (
          <div style={styles.raidDetailed}>
            <div style={styles.raidHeader}>
              <span style={styles.raidName}>{raids.raids[0].name}</span>
              <span style={{ ...styles.raidProgress, color: getProgressColor(raids.raids[0].summary) }}>
                {raids.raids[0].summary}
              </span>
            </div>
            <div style={styles.difficultyRow}>
              <div style={{ ...styles.difficultyBadge, color: '#1eff00', borderLeft: '3px solid #1eff00' }}>
                N: {raids.raids[0].normalKills}/{raids.raids[0].totalBosses}
              </div>
              <div style={{ ...styles.difficultyBadge, color: '#a335ee', borderLeft: '3px solid #a335ee' }}>
                H: {raids.raids[0].heroicKills}/{raids.raids[0].totalBosses}
              </div>
              <div style={{ ...styles.difficultyBadge, color: '#ff8000', borderLeft: '3px solid #ff8000' }}>
                M: {raids.raids[0].mythicKills}/{raids.raids[0].totalBosses}
              </div>
            </div>
          </div>
        )}
        {/* Other raids summary */}
        {raids.raids?.slice(1, 3).map((raid, index) => (
          <div key={index} style={styles.raidCard}>
            <span style={styles.raidName}>{raid.name}</span>
            <span style={{ ...styles.raidProgress, color: getProgressColor(raid.summary) }}>
              {raid.summary}
            </span>
          </div>
        ))}
      </div>

      {/* Warcraft Logs Section */}
      <div style={styles.logsSection}>
        <div style={styles.logsHeader}>
          <h3 style={styles.logsTitle}>Raid Logs (Warcraft Logs)</h3>
        </div>

        {!isWarcraftLogsConfigured() ? (
          <div style={styles.logsNotConfigured}>
            <p style={{ margin: '0 0 8px 0' }}>Warcraft Logs integration not configured.</p>
            <p style={{ margin: 0, fontSize: '12px' }}>
              Register at{' '}
              <a href="https://www.warcraftlogs.com/api/clients" target="_blank" rel="noopener noreferrer" style={{ color: '#f8b700' }}>
                warcraftlogs.com/api/clients
              </a>{' '}
              to enable parse display.
            </p>
          </div>
        ) : logsLoading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            Loading Warcraft Logs data...
          </div>
        ) : logsData?.error ? (
          <div style={styles.logsNotConfigured}>
            <p style={{ margin: 0 }}>{logsData.error}</p>
          </div>
        ) : logsData?.rankings ? (
          <>
            {/* Difficulty Tabs */}
            <div style={styles.difficultyTabs}>
              {['lfr', 'normal', 'heroic', 'mythic'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  style={{
                    ...styles.difficultyTab,
                    ...(selectedDifficulty === diff ? styles.difficultyTabActive : {}),
                    ...(selectedDifficulty === diff ? {
                      color: diff === 'mythic' ? '#ff8000' :
                             diff === 'heroic' ? '#a335ee' :
                             diff === 'normal' ? '#1eff00' : '#00ccff'
                    } : {}),
                  }}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </button>
              ))}
            </div>

            {/* Average Performance */}
            {logsData.rankings[selectedDifficulty]?.averagePerformance && (
              <div style={styles.averageParseCard}>
                <span style={styles.averageLabel}>
                  {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} Average
                </span>
                <span style={{
                  ...styles.averageValue,
                  color: getParseColor(logsData.rankings[selectedDifficulty].averagePerformance)
                }}>
                  {Math.round(logsData.rankings[selectedDifficulty].averagePerformance)}
                </span>
              </div>
            )}

            {/* Boss Parses */}
            {logsData.rankings[selectedDifficulty]?.encounters?.length > 0 ? (
              logsData.rankings[selectedDifficulty].encounters.map((encounter, idx) => (
                <div key={idx} style={styles.parseCard}>
                  <div style={styles.parseHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {encounter.iconUrl && (
                        <img
                          src={encounter.iconUrl}
                          alt=""
                          style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <span style={styles.bossName}>{encounter.encounterName}</span>
                    </div>
                    <span style={{
                      ...styles.parseValue,
                      color: getParseColor(encounter.rankPercent)
                    }}>
                      {Math.round(encounter.rankPercent)}
                    </span>
                  </div>
                  <div style={styles.parseStats}>
                    {encounter.totalKills && <span>Kills: {encounter.totalKills}</span>}
                    {encounter.medianPercent && <span>Median: {Math.round(encounter.medianPercent)}</span>}
                    {encounter.spec && <span>Spec: {encounter.spec}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.noParses}>
                No {selectedDifficulty} parses recorded for current tier.
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* 3D Character Model */}
      <div style={styles.modelSection}>
        <div style={styles.sectionTitle}>3D Character Model</div>
        <CharacterModelViewer
          region={profile.region || 'us'}
          realm={profile.realm || 'Moon Guard'}
          name={profile.name || 'Yüriko'}
        />
      </div>

      {/* Links */}
      <div style={{ marginTop: '16px' }}>
        {profile.profileUrl && (
          <a href={profile.profileUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
            View on Raider.io
          </a>
        )}
        {logsData?.profileUrl && (
          <a href={logsData.profileUrl} target="_blank" rel="noopener noreferrer" style={styles.wclLink}>
            View on Warcraft Logs
          </a>
        )}
      </div>
    </div>
  );
}

export default WoWStats;
