import { useState } from 'react';
import './EventsTable.css';

/**
 * Displays extracted events in a sortable, filterable table.
 * Users can select which events to export to .ics.
 */
function EventsTable({ events, courseName, semester, onExport, onAddEvent }) {
  const [selectedIds, setSelectedIds] = useState(
    () => new Set(events.map((_, i) => i))
  );
  const [filterType, setFilterType] = useState('all');
  const [sortAsc, setSortAsc] = useState(true);

  // Manual event addition state
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', type: 'assignment', description: '' });

  // Filter events by type
  const filtered = filterType === 'all'
    ? events
    : events.filter((e) => e.type === filterType);

  // Sort by date
  const sorted = [...filtered].sort((a, b) => {
    const cmp = a.date.localeCompare(b.date);
    return sortAsc ? cmp : -cmp;
  });

  // Count by type for filter tabs
  const counts = {};
  events.forEach((e) => {
    counts[e.type] = (counts[e.type] || 0) + 1;
  });

  function toggleAll() {
    if (selectedIds.size === events.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(events.map((_, i) => i)));
    }
  }

  function toggleOne(idx) {
    const next = new Set(selectedIds);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setSelectedIds(next);
  }

  function handleExport() {
    const selected = events.filter((_, i) => selectedIds.has(i));
    onExport(selected);
  }

  function handleManualSubmit() {
    if (!newEvent.title || !newEvent.date) return;
    onAddEvent({ ...newEvent }); // fires state update to App.jsx
    
    // Auto-select the new event (will be at the end of the array due to append)
    const nextIds = new Set(selectedIds);
    nextIds.add(events.length);
    setSelectedIds(nextIds);
    
    // reset form
    setIsAdding(false);
    setNewEvent({ title: '', date: '', time: '', type: 'assignment', description: '' });
  }

  function formatDate(dateStr) {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  function formatTime(timeStr) {
    if (!timeStr || !timeStr.trim()) return '—';
    try {
      const [h, m] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(h), parseInt(m));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeStr;
    }
  }

  const typeLabels = ['all', 'exam', 'assignment', 'reading', 'lab', 'lecture', 'other'];

  return (
    <div className="events-section animate-fade-in">
      {/* Course info header */}
      <div className="course-header">
        <div>
          <h2>{courseName}</h2>
          {semester && <span className="semester-label">{semester}</span>}
        </div>
        <div className="event-count">
          {events.length} event{events.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {typeLabels.map((type) => {
          const count = type === 'all' ? events.length : (counts[type] || 0);
          if (type !== 'all' && count === 0) return null;
          return (
            <button
              key={type}
              className={`filter-tab ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
              id={`filter-${type}`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              <span className="filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="table-container glass-card">
        <table className="events-table" id="events-table">
          <thead>
            <tr>
              <th className="col-check">
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={selectedIds.size === events.length}
                  onChange={toggleAll}
                  id="select-all-checkbox"
                />
              </th>
              <th
                className="col-date sortable"
                onClick={() => setSortAsc(!sortAsc)}
              >
                Date {sortAsc ? '↑' : '↓'}
              </th>
              <th className="col-time">Time</th>
              <th className="col-type">Type</th>
              <th className="col-title">Event</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((event) => {
              // Find original index for selection tracking
              const origIdx = events.indexOf(event);
              return (
                <tr
                  key={origIdx}
                  className={selectedIds.has(origIdx) ? 'selected' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={selectedIds.has(origIdx)}
                      onChange={() => toggleOne(origIdx)}
                    />
                  </td>
                  <td className="cell-date">{formatDate(event.date)}</td>
                  <td className="cell-time">{formatTime(event.time)}</td>
                  <td>
                    <span className={`badge badge-${event.type}`}>
                      {event.type}
                    </span>
                  </td>
                  <td className="cell-title">
                    <span className="event-title">{event.title}</span>
                    {event.description && (
                      <span className="event-desc">{event.description}</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {isAdding && (
              <tr className="manual-entry-row">
                <td></td>
                <td className="cell-date">
                  <input type="date" className="input-field btn-sm" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                </td>
                <td className="cell-time">
                  <input type="time" className="input-field btn-sm" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
                </td>
                <td>
                  <select className="input-field btn-sm" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}>
                    {typeLabels.filter(t => t !== 'all').map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </td>
                <td className="cell-title" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input type="text" placeholder="Title (e.g. Midterm)" className="input-field btn-sm" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                  <input type="text" placeholder="Details (optional)" className="input-field btn-sm" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary btn-sm" onClick={handleManualSubmit}>Save Event</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setIsAdding(false)}>Cancel</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Export bar */}
      <div className="export-bar">
        <button
          className="btn btn-secondary"
          onClick={() => setIsAdding(true)}
          style={{ marginRight: 'auto' }}
        >
          + Add Missing Event
        </button>

        <p className="selection-info">
          {selectedIds.size} of {events.length} events selected
        </p>
        <button
          className="btn btn-primary"
          onClick={handleExport}
          disabled={selectedIds.size === 0}
          id="export-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export .ics Calendar
        </button>
      </div>
    </div>
  );
}

export default EventsTable;
