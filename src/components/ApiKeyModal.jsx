import { useState, useEffect } from 'react';
import './ApiKeyModal.css';

/**
 * Modal for entering the Gemini API key.
 * Stores the key in localStorage so users don't have to re-enter it.
 */
function ApiKeyModal({ isOpen, onClose, onSave, currentKey }) {
  const [key, setKey] = useState(currentKey || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setKey(currentKey || '');
      setError('');
    }
  }, [isOpen, currentKey]);

  function handleSave() {
    const trimmed = key.trim();

    if (!trimmed) {
      setError('Please enter your API key.');
      return;
    }

    // Basic format check — Gemini keys start with "AI" and are ~39 chars
    if (trimmed.length < 20) {
      setError('That doesn\'t look like a valid API key. Check and try again.');
      return;
    }

    onSave(trimmed);
    onClose();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
          </div>
          <h2>Connect Gemini AI</h2>
        </div>

        <p className="modal-description">
          Enter your free Google Gemini API key to power the AI extraction.
          Your key stays in your browser and is never stored on any server.
        </p>

        <div className="modal-input-group">
          <label htmlFor="api-key-input">API Key</label>
          <input
            id="api-key-input"
            type="password"
            className="input-field"
            placeholder="AIzaSy..."
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          {error && <span className="input-error">{error}</span>}
        </div>

        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="get-key-link"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Get a free API key from Google AI Studio
        </a>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApiKeyModal;
