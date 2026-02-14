import React, { useState } from 'react';
import BrandBriefForm from '../components/BrandBriefForm';
import SchemaPreview from '../components/SchemaPreview';
import DraftPreview from '../components/DraftPreview';
import ExportShare from '../components/ExportShare';
import './WorkspacePage.css';

const WorkspacePage = () => {
  const [schema, setSchema] = useState(null);
  const [draft, setDraft] = useState(null);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState(null);

  // Get API URL from environment or use default
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Mock schema response for testing
  const getMockSchema = () => ({
    hook: "Transform your morning routine with our revolutionary coffee maker",
    visual_style: "Modern, minimalist aesthetic with warm tones and lifestyle shots",
    duration: "15-30",
    cta: "Shop Now - Limited Time 20% Off",
    target_audience: "Young professionals aged 25-40",
    tone: "Energetic and aspirational"
  });

  // Mock draft response for testing
  const getMockDraft = () => ({
    type: "video",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    metadata: {
      duration: "30",
      resolution: "1080x1920",
      format: "MP4",
      file_size: "5.2 MB"
    },
    message: "Draft generated successfully!"
  });

  const handleBriefSubmit = async ({ brandBrief, files }) => {
    setSchemaLoading(true);
    setSchema(null);
    setDraft(null);
    setDraftError(null);

    try {
      // Prepare FormData for file uploads
      const formData = new FormData();
      formData.append('brand_brief', brandBrief);
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      // Try to call the real API, fall back to mock data
      try {
        const response = await fetch(`${API_URL}/api/schema`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        setSchema(data);
      } catch (apiError) {
        console.warn('API unavailable, using mock data:', apiError);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSchema(getMockSchema());
      }
    } catch (error) {
      console.error('Error generating schema:', error);
      alert('Failed to generate schema. Please try again.');
    } finally {
      setSchemaLoading(false);
    }
  };

  const handleGenerateDraft = async () => {
    setDraftLoading(true);
    setDraftError(null);
    setDraft(null);

    try {
      // Try to call the real API, fall back to mock data
      try {
        const response = await fetch(`${API_URL}/api/render`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ schema }),
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        setDraft(data);
      } catch (apiError) {
        console.warn('API unavailable, using mock data:', apiError);
        // Simulate longer processing time for video generation
        await new Promise(resolve => setTimeout(resolve, 3000));
        setDraft(getMockDraft());
      }
    } catch (error) {
      console.error('Error generating draft:', error);
      setDraftError('Failed to generate ad draft. Please try again.');
    } finally {
      setDraftLoading(false);
    }
  };

  const handleStartOver = () => {
    if (window.confirm('Are you sure you want to start over? This will clear all current work.')) {
      setSchema(null);
      setDraft(null);
      setDraftError(null);
    }
  };

  return (
    <div className="workspace-page">
      <header className="workspace-header">
        <div className="header-content">
          <h1 className="app-title">Ad-Maxxer</h1>
          <p className="app-tagline">AI-Powered Instagram Ad Generation</p>
        </div>
        {(schema || draft) && (
          <button className="start-over-btn" onClick={handleStartOver}>
            Start Over
          </button>
        )}
      </header>

      <main className="workspace-content">
        <div className="workflow-container">
          {/* Step 1: Brand Brief Form */}
          <section className="workflow-step">
            <div className="step-indicator">
              <span className="step-number">1</span>
              <span className="step-title">Brand Brief</span>
            </div>
            <BrandBriefForm
              onSubmit={handleBriefSubmit}
              loading={schemaLoading}
            />
          </section>

          {/* Step 2: Schema Preview */}
          {(schema || schemaLoading) && (
            <section className="workflow-step">
              <div className="step-indicator">
                <span className="step-number">2</span>
                <span className="step-title">Ad Schema</span>
              </div>
              {schemaLoading ? (
                <div className="loading-placeholder">
                  <div className="spinner"></div>
                  <p>Generating ad schema...</p>
                </div>
              ) : (
                <SchemaPreview
                  schema={schema}
                  onGenerateDraft={handleGenerateDraft}
                  loading={draftLoading}
                />
              )}
            </section>
          )}

          {/* Step 3: Draft Preview */}
          {(draft || draftLoading || draftError) && (
            <section className="workflow-step">
              <div className="step-indicator">
                <span className="step-number">3</span>
                <span className="step-title">Draft Preview</span>
              </div>
              <DraftPreview
                draft={draft}
                loading={draftLoading}
                error={draftError}
              />
            </section>
          )}

          {/* Step 4: Export & Share */}
          {draft && !draftLoading && !draftError && (
            <section className="workflow-step">
              <div className="step-indicator">
                <span className="step-number">4</span>
                <span className="step-title">Export & Share</span>
              </div>
              <ExportShare draft={draft} />
            </section>
          )}
        </div>
      </main>

      <footer className="workspace-footer">
        <p>&copy; 2024 Ad-Maxxer. All rights reserved.</p>
        <div className="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <span className="separator">•</span>
          <a href="#terms">Terms of Service</a>
          <span className="separator">•</span>
          <a href="#support">Support</a>
        </div>
      </footer>
    </div>
  );
};

export default WorkspacePage;
