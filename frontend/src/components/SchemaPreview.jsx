import React from 'react';
import './SchemaPreview.css';

const SchemaPreview = ({ schema, onGenerateDraft, loading }) => {
  if (!schema) return null;

  return (
    <div className="schema-preview">
      <div className="schema-header">
        <h2>Ad Schema</h2>
        <p className="schema-subtitle">Review the AI-generated ad structure</p>
      </div>

      <div className="schema-content">
        <div className="schema-field">
          <label className="schema-label">
            <span className="label-icon">🎯</span>
            Hook
          </label>
          <div className="schema-value">{schema.hook || 'N/A'}</div>
          <small className="field-description">The attention-grabbing opening line</small>
        </div>

        <div className="schema-field">
          <label className="schema-label">
            <span className="label-icon">🎨</span>
            Visual Style
          </label>
          <div className="schema-value">{schema.visual_style || 'N/A'}</div>
          <small className="field-description">The aesthetic and visual approach</small>
        </div>

        <div className="schema-field">
          <label className="schema-label">
            <span className="label-icon">⏱️</span>
            Duration
          </label>
          <div className="schema-value">{schema.duration || 'N/A'}</div>
          <small className="field-description">Video length in seconds</small>
        </div>

        <div className="schema-field">
          <label className="schema-label">
            <span className="label-icon">📣</span>
            Call to Action (CTA)
          </label>
          <div className="schema-value">{schema.cta || 'N/A'}</div>
          <small className="field-description">What you want viewers to do next</small>
        </div>

        {schema.target_audience && (
          <div className="schema-field">
            <label className="schema-label">
              <span className="label-icon">👥</span>
              Target Audience
            </label>
            <div className="schema-value">{schema.target_audience}</div>
          </div>
        )}

        {schema.tone && (
          <div className="schema-field">
            <label className="schema-label">
              <span className="label-icon">💬</span>
              Tone
            </label>
            <div className="schema-value">{schema.tone}</div>
          </div>
        )}
      </div>

      <div className="schema-raw">
        <details>
          <summary>View Full JSON Schema</summary>
          <pre className="json-display">
            {JSON.stringify(schema, null, 2)}
          </pre>
        </details>
      </div>

      <button
        className="generate-draft-btn"
        onClick={onGenerateDraft}
        disabled={loading}
      >
        {loading ? 'Generating Draft...' : 'Generate Ad Draft'}
      </button>
    </div>
  );
};

export default SchemaPreview;
