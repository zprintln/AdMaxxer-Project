import React, { useState } from 'react';
import './ExportShare.css';

const ExportShare = ({ draft }) => {
  const [shareLink, setShareLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  if (!draft) return null;

  const handleDownload = () => {
    if (!draft.url) {
      alert('No video URL available for download');
      return;
    }

    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = draft.url;
    link.download = `ad-draft-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateShareLink = async () => {
    setIsGeneratingLink(true);

    // Simulate API call to generate share link
    // In production, this would call your backend endpoint
    setTimeout(() => {
      const mockShareLink = `https://ad-maxxer.app/share/${Math.random().toString(36).substr(2, 9)}`;
      setShareLink(mockShareLink);
      setIsGeneratingLink(false);
    }, 1000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handlePostToInstagram = () => {
    // Placeholder for Instagram posting functionality
    alert('Instagram posting functionality coming soon! For now, download the video and post manually.');
  };

  return (
    <div className="export-share">
      <h2>Export & Share</h2>
      <p className="section-description">Download your ad or share it with your team</p>

      <div className="action-buttons">
        <button
          className="action-btn download-btn"
          onClick={handleDownload}
          disabled={!draft.url}
        >
          <span className="btn-icon">⬇️</span>
          <div className="btn-content">
            <span className="btn-title">Download MP4</span>
            <small className="btn-subtitle">Save draft to your device</small>
          </div>
        </button>

        <button
          className="action-btn share-btn"
          onClick={handleGenerateShareLink}
          disabled={isGeneratingLink}
        >
          <span className="btn-icon">🔗</span>
          <div className="btn-content">
            <span className="btn-title">
              {isGeneratingLink ? 'Generating...' : 'Generate Share Link'}
            </span>
            <small className="btn-subtitle">Create a shareable URL</small>
          </div>
        </button>

        <button
          className="action-btn instagram-btn"
          onClick={handlePostToInstagram}
        >
          <span className="btn-icon">📱</span>
          <div className="btn-content">
            <span className="btn-title">Post to Instagram</span>
            <small className="btn-subtitle">Coming soon</small>
          </div>
        </button>
      </div>

      {shareLink && (
        <div className="share-link-container">
          <label className="share-link-label">Share Link Generated:</label>
          <div className="share-link-box">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="share-link-input"
            />
            <button
              className="copy-btn"
              onClick={handleCopyLink}
            >
              {copySuccess ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
          <small className="share-link-help">
            Anyone with this link can view your ad draft
          </small>
        </div>
      )}

      <div className="export-info">
        <div className="info-card">
          <h4>💡 Tips for Best Results</h4>
          <ul>
            <li>Download in MP4 format for maximum compatibility</li>
            <li>Share links expire after 30 days</li>
            <li>For Instagram, ensure your video meets their requirements (max 60s, 1080x1920px)</li>
            <li>Test your ad on multiple devices before publishing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExportShare;
