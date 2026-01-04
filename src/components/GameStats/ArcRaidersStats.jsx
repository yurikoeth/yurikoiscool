import { useState, useEffect, useRef } from 'react';
import { fetchRaids, calculateStats } from '../../services/arcraiders';
import RaidLogger from './RaidLogger';
import './ArcRaidersStats.css';

const ArcRaidersStats = () => {
  const [raids, setRaids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [showLogger, setShowLogger] = useState(false);
  const [expandedRaid, setExpandedRaid] = useState(null);
  const mountedRef = useRef(true);

  // Only show admin controls with ?admin=true in URL
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';

  useEffect(() => {
    mountedRef.current = true;
    loadRaids();
    return () => { mountedRef.current = false; };
  }, []);

  const loadRaids = async () => {
    setLoading(true);
    const { data, error, isDemo: demo } = await fetchRaids();
    if (!mountedRef.current) return;
    if (error) setError(error.message);
    setRaids(data || []);
    setIsDemo(demo);
    setLoading(false);
  };

  const stats = calculateStats(raids);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatValue = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const getStatusBadge = (status) => {
    const badges = {
      survived: { label: 'Survived', class: 'status-survived' },
      kia: { label: 'KIA', class: 'status-kia' },
      extract: { label: 'Extract', class: 'status-extract' },
    };
    return badges[status] || badges.extract;
  };

  if (loading) {
    return (
      <div className="arc-stats">
        <div className="arc-stats__header">
          <h2>ARC Raiders</h2>
        </div>
        <div className="arc-stats__loading">
          <div className="arc-stats__skeleton" />
          <div className="arc-stats__skeleton" />
          <div className="arc-stats__skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="arc-stats">
      <div className="arc-stats__header">
        <div className="arc-stats__title-row">
          <h2>ARC Raiders</h2>
          {isAdmin && (
            <button
              className="arc-stats__log-btn"
              onClick={() => setShowLogger(!showLogger)}
            >
              {showLogger ? 'Close' : '+ Log Raid'}
            </button>
          )}
        </div>
        {isDemo && <span className="arc-stats__demo-badge">Demo Data</span>}
      </div>

      {showLogger && (
        <RaidLogger
          onRaidLogged={() => {
            loadRaids();
            setShowLogger(false);
          }}
          onClose={() => setShowLogger(false)}
        />
      )}

      {/* Stats Summary */}
      <div className="arc-stats__summary">
        <div className="arc-stats__stat">
          <span className="arc-stats__stat-value">{stats.totalRaids}</span>
          <span className="arc-stats__stat-label">Total Raids</span>
        </div>
        <div className="arc-stats__stat">
          <span className="arc-stats__stat-value">{stats.survivalRate}%</span>
          <span className="arc-stats__stat-label">Survival Rate</span>
        </div>
        <div className="arc-stats__stat">
          <span className="arc-stats__stat-value">{formatValue(stats.totalValue)}</span>
          <span className="arc-stats__stat-label">Total Value</span>
        </div>
        <div className="arc-stats__stat">
          <span className="arc-stats__stat-value">{formatValue(stats.avgValuePerRaid)}</span>
          <span className="arc-stats__stat-label">Avg per Raid</span>
        </div>
      </div>

      {/* Raid History */}
      <div className="arc-stats__raids">
        <h3>Raid History</h3>
        {raids.length === 0 ? (
          <p className="arc-stats__empty">No raids logged yet</p>
        ) : (
          <div className="arc-stats__raid-list">
            {raids.map((raid) => {
              const statusBadge = getStatusBadge(raid.status);
              const isExpanded = expandedRaid === raid.id;
              const items = raid.items || [];

              return (
                <div
                  key={raid.id}
                  className={`arc-stats__raid-card ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => setExpandedRaid(isExpanded ? null : raid.id)}
                >
                  <div className="arc-stats__raid-header">
                    <div className="arc-stats__raid-info">
                      <span className="arc-stats__raid-map">{raid.map}</span>
                      <span className="arc-stats__raid-date">{formatDate(raid.date)}</span>
                    </div>
                    <div className="arc-stats__raid-meta">
                      <span className={`arc-stats__status ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                      {raid.total_value > 0 && (
                        <span className="arc-stats__raid-value">
                          {formatValue(raid.total_value)}
                        </span>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="arc-stats__raid-details">
                      {raid.notes && (
                        <p className="arc-stats__raid-notes">{raid.notes}</p>
                      )}
                      {items.length > 0 && (
                        <div className="arc-stats__items">
                          <h4>Extracted Items</h4>
                          <table className="arc-stats__items-table">
                            <thead>
                              <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((item, idx) => (
                                <tr key={item.id || idx}>
                                  <td>
                                    {item.item_name}
                                    {item.fir && <span className="arc-stats__fir">FIR</span>}
                                  </td>
                                  <td>{item.quantity}</td>
                                  <td>{formatValue(item.quantity * item.value)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && <p className="arc-stats__error">{error}</p>}
    </div>
  );
};

export default ArcRaidersStats;
