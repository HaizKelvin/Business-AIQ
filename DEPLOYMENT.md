# Biashara Smart - Vercel Deployment Guide

To deploy this application to Vercel, follow these steps:

## 1. Environment Variables
You must set the following environment variable in the Vercel Dashboard under **Settings > Environment Variables**:

- `GEMINI_API_KEY`: Your Google Gemini API Key.

## 2. Firebase Configuration
The application uses the `firebase-applet-config.json` file located in the root directory. 
- **If you are pushing to a private repository:** This file is already ignored by default in some environments, but in this project it is tracked. You can keep it as is.
- **If you are pushing to a public repository:** You should move these values to environment variables and update `src/lib/firebase.ts`.

## 3. Build Settings
Vercel should automatically detect the settings:
- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

## 4. Routing
The included `vercel.json` ensures that all routes are redirected to `index.html`, which is required for Single Page Applications (SPA).

---
Built with ❤️ for Biashara Smart.
