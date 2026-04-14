import { useState } from 'react';
import './EventsTable.css';

/**
 * Displays extracted events in a sortable, filterable table.
 * Users can select which events to export to .ics.
 */
function EventsTable({ events, courseName, semester, onExport }) {
  const [selectedIds, setSelectedIds] = useState(
    () => new Set(events.map((_, i) => i))
  );
  const [filterType, setFilterType] = useState('all');
  const [sortAsc, setSortAsc] = useState(true);

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
          </tbody>
        </table>
      </div>

      {/* Export bar */}
      <div className="export-bar">
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
