import { useState, useRef } from 'react';

const RaidLogger = ({ onRaidLogged, onClose }) => {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [map, setMap] = useState('');
  const [status, setStatus] = useState('survived');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const maps = ['Volta', 'Karst', 'Pinnacle', 'Breach'];

  const handleAuth = (e) => {
    e.preventDefault();
    if (adminKey.trim()) {
      setIsAuthenticated(true);
    }
  };

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setParsing(true);
    setError('');

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;

        const response = await fetch('/api/raids/parse-screenshot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': adminKey,
          },
          body: JSON.stringify({ image: base64 }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to parse screenshot');
        }

        const data = await response.json();

        // Auto-fill form with parsed data
        if (data.map) setMap(data.map);
        if (data.status) setStatus(data.status);
        if (data.items) setItems(data.items);

        setParsing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
      setParsing(false);
    }
  };

  const addItem = () => {
    setItems([...items, { item_name: '', quantity: 1, value: 0, fir: true }]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === 'fir' ? value :
      (field === 'quantity' || field === 'value') ? parseInt(value) || 0 : value;
    setItems(updated);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!map) {
      setError('Please select a map');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/raids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          map,
          status,
          notes,
          items: items.filter(i => i.item_name.trim()),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save raid');
      }

      onRaidLogged();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Auth gate
  if (!isAuthenticated) {
    return (
      <div className="raid-logger">
        <form onSubmit={handleAuth} className="raid-logger__auth">
          <input
            type="password"
            placeholder="Enter admin key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="raid-logger__input"
          />
          <button type="submit" className="raid-logger__btn">
            Authenticate
          </button>
        </form>
        <style>{loggerStyles}</style>
      </div>
    );
  }

  return (
    <div className="raid-logger">
      <form onSubmit={handleSubmit}>
        {/* Screenshot Upload */}
        <div className="raid-logger__section">
          <label>Screenshot (optional)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleScreenshotUpload}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="raid-logger__upload-btn"
            disabled={parsing}
          >
            {parsing ? 'Analyzing...' : 'Upload Screenshot for AI Analysis'}
          </button>
        </div>

        {/* Map Selection */}
        <div className="raid-logger__section">
          <label>Map</label>
          <select
            value={map}
            onChange={(e) => setMap(e.target.value)}
            className="raid-logger__select"
          >
            <option value="">Select map...</option>
            {maps.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="raid-logger__section">
          <label>Outcome</label>
          <div className="raid-logger__status-group">
            {['survived', 'kia', 'extract'].map((s) => (
              <button
                key={s}
                type="button"
                className={`raid-logger__status-btn ${status === s ? 'active' : ''} status-${s}`}
                onClick={() => setStatus(s)}
              >
                {s === 'kia' ? 'KIA' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="raid-logger__section">
          <label>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this raid..."
            className="raid-logger__textarea"
          />
        </div>

        {/* Items */}
        <div className="raid-logger__section">
          <label>Extracted Items</label>
          <div className="raid-logger__items">
            {items.map((item, index) => (
              <div key={index} className="raid-logger__item-row">
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.item_name}
                  onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                  className="raid-logger__input"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  className="raid-logger__input raid-logger__input--small"
                  min="1"
                />
                <input
                  type="number"
                  placeholder="Value"
                  value={item.value}
                  onChange={(e) => updateItem(index, 'value', e.target.value)}
                  className="raid-logger__input raid-logger__input--small"
                  min="0"
                />
                <label className="raid-logger__fir-label">
                  <input
                    type="checkbox"
                    checked={item.fir}
                    onChange={(e) => updateItem(index, 'fir', e.target.checked)}
                  />
                  FIR
                </label>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="raid-logger__remove-btn"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="raid-logger__add-btn"
            >
              + Add Item
            </button>
          </div>
        </div>

        {error && <p className="raid-logger__error">{error}</p>}

        {/* Actions */}
        <div className="raid-logger__actions">
          <button
            type="button"
            onClick={onClose}
            className="raid-logger__btn raid-logger__btn--secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="raid-logger__btn raid-logger__btn--primary"
          >
            {loading ? 'Saving...' : 'Log Raid'}
          </button>
        </div>
      </form>
      <style>{loggerStyles}</style>
    </div>
  );
};

const loggerStyles = `
.raid-logger {
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(0, 200, 200, 0.05);
  border: 1px solid rgba(0, 200, 200, 0.2);
  border-radius: 8px;
}

.raid-logger__auth {
  display: flex;
  gap: 8px;
}

.raid-logger__section {
  margin-bottom: 16px;
}

.raid-logger__section label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.85rem;
  color: #888;
}

.raid-logger__input,
.raid-logger__select,
.raid-logger__textarea {
  width: 100%;
  padding: 10px 12px;
  background: #111;
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  font-size: 0.9rem;
}

.raid-logger__input:focus,
.raid-logger__select:focus,
.raid-logger__textarea:focus {
  outline: none;
  border-color: #00d4d4;
}

.raid-logger__input--small {
  width: 80px;
}

.raid-logger__textarea {
  min-height: 60px;
  resize: vertical;
}

.raid-logger__upload-btn {
  width: 100%;
  padding: 12px;
  background: rgba(0, 200, 200, 0.1);
  border: 1px dashed #00d4d4;
  border-radius: 6px;
  color: #00d4d4;
  cursor: pointer;
  transition: all 0.2s;
}

.raid-logger__upload-btn:hover {
  background: rgba(0, 200, 200, 0.2);
}

.raid-logger__upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.raid-logger__status-group {
  display: flex;
  gap: 8px;
}

.raid-logger__status-btn {
  flex: 1;
  padding: 10px;
  background: #111;
  border: 1px solid #333;
  border-radius: 6px;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}

.raid-logger__status-btn:hover {
  border-color: #555;
}

.raid-logger__status-btn.active.status-survived {
  background: rgba(34, 197, 94, 0.2);
  border-color: #22c55e;
  color: #22c55e;
}

.raid-logger__status-btn.active.status-kia {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #ef4444;
}

.raid-logger__status-btn.active.status-extract {
  background: rgba(234, 179, 8, 0.2);
  border-color: #eab308;
  color: #eab308;
}

.raid-logger__items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.raid-logger__item-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.raid-logger__item-row .raid-logger__input:first-child {
  flex: 1;
}

.raid-logger__fir-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: #22c55e;
  cursor: pointer;
}

.raid-logger__remove-btn {
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid #ef4444;
  border-radius: 4px;
  color: #ef4444;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
}

.raid-logger__add-btn {
  padding: 8px;
  background: transparent;
  border: 1px dashed #555;
  border-radius: 6px;
  color: #888;
  cursor: pointer;
}

.raid-logger__add-btn:hover {
  border-color: #00d4d4;
  color: #00d4d4;
}

.raid-logger__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 20px;
}

.raid-logger__btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.raid-logger__btn--primary {
  background: #00d4d4;
  border: none;
  color: #000;
  font-weight: 600;
}

.raid-logger__btn--primary:hover {
  background: #00b8b8;
}

.raid-logger__btn--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.raid-logger__btn--secondary {
  background: transparent;
  border: 1px solid #555;
  color: #888;
}

.raid-logger__btn--secondary:hover {
  border-color: #888;
  color: #fff;
}

.raid-logger__error {
  color: #ef4444;
  font-size: 0.85rem;
  margin: 12px 0 0 0;
}
`;

export default RaidLogger;
