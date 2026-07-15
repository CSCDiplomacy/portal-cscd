# React Migration: Deployment Guide

## Overview

This repository has been migrated from vanilla JavaScript to React 18 + TypeScript. The build process now uses Vite for the frontend (client/) while the Express backend remains unchanged.

## Build & Deploy

### Local Development

```bash
# Install dependencies (both root and client)
npm install
cd client && npm install && cd ..

# Terminal 1: Start Express backend
npm start

# Terminal 2: Start Vite dev server (with hot reload)
cd client && npm run dev
```

The app will be available at:
- Frontend dev: `http://localhost:5173` (with hot reload)
- Backend API: `http://localhost:3000`
- Vite proxies `/api` calls to `localhost:3000`

### Production Build

```bash
# Build the React frontend
npm run build

# This outputs to client/dist/
# Express will serve it as static files
```

### Deploy to Hostinger (Passenger)

1. **Build locally** (creates `client/dist/`)
   ```bash
   npm run build
   ```

2. **Push to your Hostinger repository or deploy via FTP**
   - The entire project directory (including `client/dist/`) goes to Hostinger
   - Passenger watches `app.js` as the startup file (already configured)

3. **Start the app**
   ```bash
   npm start
   ```
   
   Or let Passenger auto-start it on your configured domain.

## Architecture

### Backend (Node/Express)
- **Entry point**: `app.js`
- **Routes**: `routes/` (API routes remain unchanged)
- **Database**: Supabase (Auth + Postgres)
- **Port**: 3000 (or `$PORT` env var)

### Frontend (React)
- **Bundler**: Vite
- **Framework**: React 18 + TypeScript
- **CSS**: Tailwind + custom globals
- **State**: Zustand (3 stores: auth, delegate, ui)
- **Build output**: `client/dist/`

### Deployment Flow

```
Express (app.js)
  ├── /api/* → API routes (unchanged)
  └── /* → Serves client/dist/ as static files (SPA fallback to index.html)
```

## Environment Variables

Both backend and client need these env vars. Set them on Hostinger:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AidaForm (interview)
AIDAFORM_BASE_URL=https://your-form.aidaform.com/interview

# Email (Resend)
RESEND_API_KEY=your-resend-key

# Event Config
EVENT_NAME=YPDS Jakarta 2026

# Port
PORT=3000
```

## File Structure (After Build)

```
/home/user/cscd/interview_portal/
├── app.js                    # Express entry point
├── package.json
├── public/                   # Static assets (unchanged)
│   ├── index.html           # SPA shell (updated)
│   ├── img/
│   ├── manifest.json
│   └── sw.js
├── routes/                   # API routes (unchanged)
├── lib/                      # Backend lib (unchanged)
├── data/                     # Static JSON (unchanged)
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── stores/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── dist/                 # ← This is served by Express
│   ├── package.json
│   └── vite.config.ts
└── scripts/                  # Seed, migrations (unchanged)
```

## What Changed

### Frontend ✨
- **No more vanilla JS**: Replaced with React components
- **State management**: Zustand (replaces global objects)
- **Build step**: `npm run build` required before deploy
- **Dev server**: Vite (hot reload, fast)
- **CSS**: Tailwind + custom design tokens

### Backend (No Changes)
- Express routes same
- Database unchanged
- Auth flow same (Supabase)
- API contracts same

## Performance Notes

- **Bundle size**: ~122 KB gzipped (reasonable for a full SPA)
- **Caching strategy**:
  - `index.html` → no-cache (always revalidate)
  - `*.js, *.css` → 7-day cache (fingerprinted by Vite)
  - Static assets → 7-day cache
- **Service Worker**: Registered for offline fallback

## Troubleshooting

### App won't start on Hostinger
- Check that `NODE_VERSION` in Hostinger settings matches your local (`node -v`)
- Ensure all env vars are set
- Check error logs in Hostinger control panel

### Styles not loading
- Run `npm run build` to rebuild `client/dist/`
- Clear browser cache (Cmd/Ctrl + Shift + R)
- Ensure `client/dist/` was uploaded

### API calls 404
- Ensure Express is receiving requests (check logs)
- Verify `/api/*` routes are working: `curl http://localhost:3000/api/config`

### Hot reload not working in dev
- Make sure you ran `cd client && npm run dev` (not `npm start`)
- Vite runs on `localhost:5173`, Express on `3000`

## Monitoring & Logs

### Local Development
- React error boundary catches component errors
- Console logs in browser dev tools
- Express logs to stdout

### Production (Hostinger)
- Check Hostinger's error logs
- Sentry integration can be added for monitoring
- Service worker logs to browser console

## Next Steps

1. **Test locally**: `npm install && npm run build && npm start`
2. **Deploy to Hostinger**: Push code, ensure env vars set, restart app
3. **Monitor**: Watch error logs for issues
4. **Optimize**: Consider code-splitting for large routes if needed

## Support

For issues:
1. Check browser console (F12) for errors
2. Check Hostinger error logs
3. Verify all env vars are set
4. Rebuild frontend: `npm run build`
5. Restart app on Hostinger

---

**Last Updated**: 2026-07-16
**Migration Status**: Complete (Phases 1-6 ✓)
