import React, { useState } from 'react';
import './BrandBriefForm.css';

const BrandBriefForm = ({ onSubmit, loading }) => {
  const [brandBrief, setBrandBrief] = useState('');
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map((file) => ({
      file,
      preview: file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : null,
      name: file.name,
      type: file.type,
      size: file.size,
    }));
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview);
    }
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!brandBrief.trim()) {
      alert('Please enter a brand brief');
      return;
    }
    onSubmit({ brandBrief, files: files.map(f => f.file) });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="brand-brief-form">
      <h2>Create Your Instagram Ad</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="brandBrief">
            Brand Brief <span className="required">*</span>
          </label>
          <textarea
            id="brandBrief"
            className="brand-brief-textarea"
            placeholder="Describe your brand, product, target audience, key message, and any specific requirements..."
            value={brandBrief}
            onChange={(e) => setBrandBrief(e.target.value)}
            rows={8}
            required
            disabled={loading}
          />
          <small className="helper-text">
            Include details about your product, target audience, tone, and desired call-to-action
          </small>
        </div>

        <div className="form-group">
          <label>Upload Files (Optional)</label>
          <div
            className={`file-drop-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="fileInput"
              className="file-input"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileInput}
              disabled={loading}
            />
            <label htmlFor="fileInput" className="file-input-label">
              <div className="upload-icon">📁</div>
              <p>Drag and drop files here, or click to select</p>
              <small>Supported: Images (PNG, JPG) and PDFs</small>
            </label>
          </div>

          {files.length > 0 && (
            <div className="file-preview-container">
              <h4>Uploaded Files ({files.length})</h4>
              <div className="file-preview-grid">
                {files.map((fileObj, index) => (
                  <div key={index} className="file-preview-item">
                    {fileObj.preview ? (
                      <img
                        src={fileObj.preview}
                        alt={fileObj.name}
                        className="file-preview-image"
                      />
                    ) : (
                      <div className="file-preview-placeholder">
                        <span className="file-icon">📄</span>
                      </div>
                    )}
                    <div className="file-info">
                      <p className="file-name" title={fileObj.name}>
                        {fileObj.name}
                      </p>
                      <p className="file-size">{formatFileSize(fileObj.size)}</p>
                    </div>
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={() => removeFile(index)}
                      disabled={loading}
                      aria-label="Remove file"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={loading || !brandBrief.trim()}
        >
          {loading ? 'Generating Schema...' : 'Generate Ad Schema'}
        </button>
      </form>
    </div>
  );
};

export default BrandBriefForm;
