import { useState, useEffect } from 'react';
import {
  getConfiguredCharacter,
  parseJobs,
  calculateItemLevel,
  getFreeCompany,
} from '../../services/xivapi.js';
import { fetchAllFFLogsData, getParseColor } from '../../services/fflogs.js';
import { config } from '../../config.js';
import './FFXIVStats.css';

/**
 * FFXIV Stats Component
 * Displays character information from FFXIV using XIVAPI
 */
export default function FFXIVStats() {
  const [characterData, setCharacterData] = useState(null);
  const [logsData, setLogsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('extreme');

  useEffect(() => {
    async function loadCharacter() {
      try {
        setLoading(true);
        setError(null);

        const data = await getConfiguredCharacter();
        setCharacterData(data);

        // Load FFLogs data
        setLogsLoading(true);
        try {
          const logs = await fetchAllFFLogsData();
          setLogsData(logs);
        } catch (logsErr) {
          console.error('Failed to load FFLogs data:', logsErr);
        } finally {
          setLogsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load FFXIV character:', err);
        setError(err.message || 'Failed to load character data');
      } finally {
        setLoading(false);
      }
    }

    loadCharacter();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!characterData?.Character) {
    return <ErrorState message="No character data available" />;
  }

  const character = characterData.Character;
  const { activeJob, jobs } = parseJobs(characterData);
  const itemLevel = calculateItemLevel(characterData);
  const freeCompany = getFreeCompany(characterData);

  // Get combat jobs (exclude crafters/gatherers for main display)
  const combatJobs = jobs.filter(
    job => !['crafter', 'gatherer'].includes(job.role)
  );
  const craftingJobs = jobs.filter(job => job.role === 'crafter');
  const gatheringJobs = jobs.filter(job => job.role === 'gatherer');

  return (
    <div className="ffxiv-stats">
      <div className="ffxiv-header">
        <div className="ffxiv-logo">
          <span className="ffxiv-icon">XIV</span>
        </div>
        <h2 className="ffxiv-title">Final Fantasy XIV</h2>
      </div>

      <div className="ffxiv-content">
        {/* Character Portrait Section */}
        <div className="ffxiv-portrait-section">
          <div className="ffxiv-portrait-frame">
            <img
              src={character.Portrait}
              alt={character.Name}
              className="ffxiv-portrait"
            />
            <div className="ffxiv-portrait-overlay" />
          </div>
        </div>

        {/* Character Info Section */}
        <div className="ffxiv-info-section">
          <div className="ffxiv-character-header">
            <h3 className="ffxiv-character-name">{character.Name}</h3>
            <span className="ffxiv-server">
              {character.Server} ({config.ffxiv.dataCenter})
            </span>
          </div>

          {/* Active Job */}
          {activeJob && (
            <div className="ffxiv-active-job">
              <img
                src={activeJob.icon}
                alt={activeJob.name}
                className="ffxiv-job-icon-large"
              />
              <div className="ffxiv-job-details">
                <span className="ffxiv-job-name">{activeJob.name}</span>
                <span className="ffxiv-job-level">Lv. {activeJob.level}</span>
              </div>
              <div className={`ffxiv-role-badge ffxiv-role-${activeJob.role}`}>
                {activeJob.role}
              </div>
            </div>
          )}

          {/* Item Level */}
          {itemLevel > 0 && (
            <div className="ffxiv-item-level">
              <span className="ffxiv-il-label">Item Level</span>
              <span className="ffxiv-il-value">{itemLevel}</span>
            </div>
          )}

          {/* Free Company */}
          {freeCompany && (
            <div className="ffxiv-free-company">
              <div className="ffxiv-fc-crest">
                {freeCompany.crest && (
                  <div className="ffxiv-fc-crest-layers">
                    {freeCompany.crest.map((layer, idx) => (
                      <img
                        key={idx}
                        src={layer}
                        alt=""
                        className="ffxiv-fc-crest-layer"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="ffxiv-fc-info">
                <span className="ffxiv-fc-tag">&lt;{freeCompany.tag}&gt;</span>
                <span className="ffxiv-fc-name">{freeCompany.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Jobs Section */}
      <div className="ffxiv-jobs-section">
        {/* Combat Jobs */}
        {combatJobs.length > 0 && (
          <div className="ffxiv-job-category">
            <h4 className="ffxiv-category-title">Combat Jobs</h4>
            <div className="ffxiv-jobs-grid">
              {combatJobs.map(job => (
                <JobBadge key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}

        {/* Crafting Jobs */}
        {craftingJobs.length > 0 && (
          <div className="ffxiv-job-category">
            <h4 className="ffxiv-category-title">Disciples of the Hand</h4>
            <div className="ffxiv-jobs-grid">
              {craftingJobs.map(job => (
                <JobBadge key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}

        {/* Gathering Jobs */}
        {gatheringJobs.length > 0 && (
          <div className="ffxiv-job-category">
            <h4 className="ffxiv-category-title">Disciples of the Land</h4>
            <div className="ffxiv-jobs-grid">
              {gatheringJobs.map(job => (
                <JobBadge key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FFLogs Section */}
      <div className="ffxiv-logs-section">
        <h4 className="ffxiv-category-title">Raid Logs (FFLogs)</h4>

        {logsLoading ? (
          <div className="ffxiv-logs-loading">Loading FFLogs data...</div>
        ) : logsData?.error ? (
          <div className="ffxiv-logs-error">{logsData.error}</div>
        ) : logsData?.rankings ? (
          <>
            {/* Difficulty Tabs */}
            <div className="ffxiv-difficulty-tabs">
              {['savage', 'extreme', 'ultimate'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`ffxiv-diff-tab ${selectedDifficulty === diff ? 'ffxiv-diff-tab--active' : ''}`}
                  style={selectedDifficulty === diff ? {
                    color: diff === 'ultimate' ? '#e5cc80' :
                           diff === 'savage' ? '#ff8000' : '#a335ee'
                  } : {}}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </button>
              ))}
            </div>

            {/* Average Performance */}
            {logsData.rankings[selectedDifficulty]?.averagePerformance && (
              <div className="ffxiv-average-parse">
                <span className="ffxiv-average-label">
                  {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} Average
                </span>
                <span
                  className="ffxiv-average-value"
                  style={{ color: getParseColor(logsData.rankings[selectedDifficulty].averagePerformance) }}
                >
                  {Math.round(logsData.rankings[selectedDifficulty].averagePerformance)}
                </span>
              </div>
            )}

            {/* Boss Parses */}
            {logsData.rankings[selectedDifficulty]?.encounters?.length > 0 ? (
              <div className="ffxiv-parses-list">
                {logsData.rankings[selectedDifficulty].encounters.map((encounter, idx) => (
                  <div key={idx} className="ffxiv-parse-card">
                    <div className="ffxiv-parse-header">
                      <div className="ffxiv-parse-boss">
                        {encounter.iconUrl && (
                          <img
                            src={encounter.iconUrl}
                            alt=""
                            className="ffxiv-boss-icon"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <span className="ffxiv-boss-name">{encounter.encounterName}</span>
                      </div>
                      <span
                        className="ffxiv-parse-value"
                        style={{ color: getParseColor(encounter.rankPercent) }}
                      >
                        {Math.round(encounter.rankPercent)}
                      </span>
                    </div>
                    <div className="ffxiv-parse-stats">
                      {encounter.totalKills && <span>Kills: {encounter.totalKills}</span>}
                      {encounter.job && <span>Job: {encounter.job}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ffxiv-no-parses">
                No {selectedDifficulty} parses recorded.
              </div>
            )}
          </>
        ) : (
          <div className="ffxiv-logs-not-configured">
            FFLogs integration available when credentials are configured.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="ffxiv-footer">
        <a
          href={`https://na.finalfantasyxiv.com/lodestone/character/${characterData.Character.ID}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="ffxiv-lodestone-link"
        >
          View on Lodestone
        </a>
        {logsData?.profileUrl && (
          <a
            href={logsData.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ffxiv-fflogs-link"
          >
            View on FFLogs
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Job Badge Component
 */
function JobBadge({ job }) {
  const isMaxLevel = job.level >= 100;

  return (
    <div
      className={`ffxiv-job-badge ${isMaxLevel ? 'ffxiv-job-max' : ''} ffxiv-role-bg-${job.role}`}
      title={`${job.name} - Level ${job.level}`}
    >
      <img src={job.icon} alt={job.name} className="ffxiv-job-icon" />
      <span className="ffxiv-job-abbrev">{job.abbreviation}</span>
      <span className="ffxiv-job-lvl">{job.level}</span>
    </div>
  );
}

/**
 * Loading State Component
 */
function LoadingState() {
  return (
    <div className="ffxiv-stats ffxiv-loading">
      <div className="ffxiv-header">
        <div className="ffxiv-logo">
          <span className="ffxiv-icon">XIV</span>
        </div>
        <h2 className="ffxiv-title">Final Fantasy XIV</h2>
      </div>
      <div className="ffxiv-loading-content">
        <div className="ffxiv-spinner" />
        <p className="ffxiv-loading-text">Loading character data...</p>
        <p className="ffxiv-loading-subtext">Consulting the Lodestone...</p>
      </div>
    </div>
  );
}

/**
 * Error State Component
 */
function ErrorState({ message }) {
  return (
    <div className="ffxiv-stats ffxiv-error">
      <div className="ffxiv-header">
        <div className="ffxiv-logo">
          <span className="ffxiv-icon">XIV</span>
        </div>
        <h2 className="ffxiv-title">Final Fantasy XIV</h2>
      </div>
      <div className="ffxiv-error-content">
        <div className="ffxiv-error-icon">!</div>
        <p className="ffxiv-error-text">Failed to load character</p>
        <p className="ffxiv-error-message">{message}</p>
        <p className="ffxiv-error-hint">
          Check that the character name and server are correct in config.
        </p>
      </div>
    </div>
  );
}
