# Ad-Maxxer Frontend

AI-Powered Instagram Ad Generation Workspace - React Frontend MVP

## Features

- **Brand Brief Input**: Paste your brand brief and upload supporting files (images, PDFs)
- **AI Schema Generation**: Automatically generate ad schema with hook, visual style, duration, and CTA
- **Draft Preview**: View AI-generated ad drafts with video player
- **Export & Share**: Download MP4 files, generate shareable links, and export to Instagram

## Tech Stack

- React 18.2
- React Scripts (Create React App)
- Responsive CSS with modern gradients and animations
- REST API integration with fallback mock data

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:

```env
REACT_APP_API_URL=http://localhost:5000
```

### Development

Start the development server:

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Project Structure

```
frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/         # Reusable React components
│   │   ├── BrandBriefForm.jsx
│   │   ├── BrandBriefForm.css
│   │   ├── SchemaPreview.jsx
│   │   ├── SchemaPreview.css
│   │   ├── DraftPreview.jsx
│   │   ├── DraftPreview.css
│   │   ├── ExportShare.jsx
│   │   └── ExportShare.css
│   ├── pages/              # Page components
│   │   ├── WorkspacePage.jsx
│   │   └── WorkspacePage.css
│   ├── App.jsx             # Root component
│   ├── App.css
│   ├── index.js            # Entry point
│   └── index.css           # Global styles
├── .env.example            # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## API Integration

The frontend expects two backend endpoints:

### POST /api/schema

Generate ad schema from brand brief.

**Request:**
```
FormData:
- brand_brief: string (required)
- file_0, file_1, ...: files (optional)
```

**Response:**
```json
{
  "hook": "Your attention-grabbing hook",
  "visual_style": "Modern, minimalist aesthetic",
  "duration": "15-30",
  "cta": "Shop Now",
  "target_audience": "Young professionals",
  "tone": "Energetic and aspirational"
}
```

### POST /api/render

Generate ad draft from schema.

**Request:**
```json
{
  "schema": {
    "hook": "...",
    "visual_style": "...",
    "duration": "...",
    "cta": "..."
  }
}
```

**Response:**
```json
{
  "type": "video",
  "url": "https://example.com/video.mp4",
  "metadata": {
    "duration": "30",
    "resolution": "1080x1920",
    "format": "MP4",
    "file_size": "5.2 MB"
  },
  "message": "Draft generated successfully!"
}
```

## Mock Data Mode

If the backend API is unavailable, the app automatically falls back to mock data for testing. This allows you to develop and test the UI without a running backend.

## Environment Variables

- `REACT_APP_API_URL`: Backend API base URL (default: `http://localhost:5000`)
- `REACT_APP_AUTH0_DOMAIN`: (Optional) Auth0 domain for future authentication
- `REACT_APP_AUTH0_CLIENT_ID`: (Optional) Auth0 client ID

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
