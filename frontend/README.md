# DESTINY AI – Frontend (React + Vite)

A simple, demo‑ready UI for palm analysis with:
- Image upload and live camera capture
- AI‑generated analysis with plain‑language descriptions
- History view of past scans
- PDF report download
- Proxy integration to the FastAPI backend

## Quick Start
- Prerequisites: Node.js 18+, npm
- Install dependencies:
  - `npm install`
- Start development server:
  - `npm run dev`
- Open the app:
  - http://localhost:5173/

## Backend Integration
- The frontend proxies API calls to the backend at http://localhost:8000
- Proxy config is defined in [vite.config.js](./vite.config.js)
- Recommended: run backend before using analysis and report features

## Key Pages
- Dashboard: navigation to core features
- Analysis: upload/capture image, run AI analysis, view descriptive results, download PDF
- History: review past analyses with scores and timestamps
- Profile: manage account and latest palm report
- Admin: system metrics and user list (requires admin role)

## Demo Flow
- Login or register any user
- Go to Analysis:
  - Upload a palm image or use Live Camera
  - Click “Analyze Palm”
  - Review Vitality, Cognitive, Emotional scores
  - Read the descriptive lines under each card
  - Click “Download Report” to export a descriptive PDF
- Open History to review previous scans

## Tech Stack
- React, Vite, Tailwind CSS, Framer Motion
- axios, react‑router‑dom, lucide‑react

## Linting
- Run: `npm run lint`
- Fix common issues before demo

## Notes
- SVG icons from lucide‑react and inline SVGs use the standard namespace:
  - `xmlns="http://www.w3.org/2000/svg"`
  - Ensures consistent rendering across browsers
