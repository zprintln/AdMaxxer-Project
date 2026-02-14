import React, { useState } from 'react';
import './DraftPreview.css';

const DraftPreview = ({ draft, loading, error }) => {
  const [videoError, setVideoError] = useState(false);

  if (loading) {
    return (
      <div className="draft-preview loading-state">
        <div className="loading-container">
          <div className="spinner"></div>
          <h3>Generating Your Ad Draft</h3>
          <p>This may take a few moments...</p>
          <div className="progress-steps">
            <div className="step">
              <span className="step-icon">✓</span>
              <span>Analyzing schema</span>
            </div>
            <div className="step active">
              <span className="step-icon">⟳</span>
              <span>Creating visuals</span>
            </div>
            <div className="step">
              <span className="step-icon">○</span>
              <span>Rendering video</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="draft-preview error-state">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Generation Failed</h3>
          <p className="error-message">{error}</p>
          <p className="error-help">
            Please try again or contact support if the problem persists.
          </p>
        </div>
      </div>
    );
  }

  if (!draft) return null;

  return (
    <div className="draft-preview">
      <div className="draft-header">
        <h2>Ad Draft Preview</h2>
        <span className="draft-badge">Draft v1</span>
      </div>

      <div className="draft-content">
        {draft.type === 'video' && draft.url && (
          <div className="video-container">
            {!videoError ? (
              <video
                controls
                className="draft-video"
                onError={() => setVideoError(true)}
              >
                <source src={draft.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="video-error">
                <p>Unable to load video preview</p>
                <small>URL: {draft.url}</small>
              </div>
            )}
          </div>
        )}

        {draft.type === 'image' && draft.url && (
          <div className="image-container">
            <img
              src={draft.url}
              alt="Ad draft"
              className="draft-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="image-error" style={{ display: 'none' }}>
              <p>Unable to load image preview</p>
              <small>URL: {draft.url}</small>
            </div>
          </div>
        )}

        {draft.metadata && (
          <div className="draft-metadata">
            <h4>Draft Details</h4>
            <div className="metadata-grid">
              {draft.metadata.duration && (
                <div className="metadata-item">
                  <span className="metadata-label">Duration:</span>
                  <span className="metadata-value">{draft.metadata.duration}s</span>
                </div>
              )}
              {draft.metadata.resolution && (
                <div className="metadata-item">
                  <span className="metadata-label">Resolution:</span>
                  <span className="metadata-value">{draft.metadata.resolution}</span>
                </div>
              )}
              {draft.metadata.format && (
                <div className="metadata-item">
                  <span className="metadata-label">Format:</span>
                  <span className="metadata-value">{draft.metadata.format}</span>
                </div>
              )}
              {draft.metadata.file_size && (
                <div className="metadata-item">
                  <span className="metadata-label">File Size:</span>
                  <span className="metadata-value">{draft.metadata.file_size}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {draft.message && (
          <div className="draft-message">
            <p>{draft.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftPreview;
