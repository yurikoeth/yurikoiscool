import React from 'react';
import { config } from '../../config.js';

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
    borderBottom: '2px solid #ff4d6d',
  },
  avatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#ff4d6d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#000',
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
  idBadge: {
    fontSize: '12px',
    color: '#888',
    marginTop: '2px',
  },
  serverBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    backgroundColor: '#1a1a1a',
    color: '#ff4d6d',
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
  unionCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: '8px',
    padding: '12px 16px',
    border: '1px solid #1a1a1a',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  unionIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    backgroundColor: '#ff4d6d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#000',
  },
  unionName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#fff',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '20px',
  },
  statCard: {
    backgroundColor: '#0a0a0a',
    padding: '14px 10px',
    borderRadius: '8px',
    border: '1px solid #1a1a1a',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '10px',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  squadGrid: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  squadMember: {
    backgroundColor: '#0a0a0a',
    borderRadius: '8px',
    padding: '10px',
    border: '1px solid #1a1a1a',
    textAlign: 'center',
    flex: '1 1 calc(33% - 6px)',
    minWidth: '80px',
  },
  squadName: {
    fontSize: '10px',
    color: '#fff',
    marginBottom: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  squadPower: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#ff4d6d',
  },
  distributionBar: {
    display: 'flex',
    height: '24px',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  distributionSegment: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '600',
    color: '#000',
  },
  distributionLegend: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    fontSize: '11px',
    color: '#888',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '2px',
  },
};

function NikkeStats() {
  const nikke = config.nikke;

  const distribution = nikke.distribution || { ssr: 45, sr: 15, r: 8 };
  const total = distribution.ssr + distribution.sr + distribution.r;

  const ssrPercent = (distribution.ssr / total) * 100;
  const srPercent = (distribution.sr / total) * 100;
  const rPercent = (distribution.r / total) * 100;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.avatar}>
          {nikke.commanderName?.[0] || 'Y'}
        </div>
        <div style={styles.headerInfo}>
          <h2 style={styles.title}>{nikke.commanderName || 'YURIKO'}</h2>
          <div style={styles.idBadge}>ID: {nikke.commanderId || '00195620'}</div>
          <span style={styles.serverBadge}>NIKKE</span>
        </div>
      </div>

      {/* Union */}
      <div style={styles.unionCard}>
        <div style={styles.unionIcon}>U</div>
        <div>
          <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Union</div>
          <div style={styles.unionName}>{nikke.union || 'サイバーマネー'}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Squad Power</div>
          <div style={{ ...styles.statValue, color: '#ff4d6d' }}>
            {(nikke.squadPower || 66488).toLocaleString()}
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Nikkes</div>
          <div style={styles.statValue}>{nikke.nikkesObtained || 68}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Costumes</div>
          <div style={styles.statValue}>{nikke.costumes || 11}</div>
        </div>
      </div>

      {/* Representative Squad */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Representative Squad</div>
        <div style={styles.squadGrid}>
          {(nikke.representativeSquad || []).slice(0, 5).map((member, index) => (
            <div key={index} style={styles.squadMember}>
              <div style={styles.squadName}>{member.name}</div>
              <div style={styles.squadPower}>⚔ {member.power?.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Nikke Distribution */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Nikke Distribution</div>
        <div style={styles.distributionBar}>
          <div style={{
            ...styles.distributionSegment,
            width: `${ssrPercent}%`,
            backgroundColor: '#ffd700',
          }}>
            {distribution.ssr}
          </div>
          <div style={{
            ...styles.distributionSegment,
            width: `${srPercent}%`,
            backgroundColor: '#a855f7',
            color: '#fff',
          }}>
            {distribution.sr}
          </div>
          <div style={{
            ...styles.distributionSegment,
            width: `${rPercent}%`,
            backgroundColor: '#3b82f6',
            color: '#fff',
          }}>
            {distribution.r}
          </div>
        </div>
        <div style={styles.distributionLegend}>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, backgroundColor: '#ffd700' }}></div>
            SSR
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, backgroundColor: '#a855f7' }}></div>
            SR
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, backgroundColor: '#3b82f6' }}></div>
            R
          </div>
        </div>
      </div>
    </div>
  );
}

export default NikkeStats;
