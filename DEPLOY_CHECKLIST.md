# Deployment Checklist

## ✅ Pre-Deployment (Local Machine)

### 1. Build the React Frontend
```bash
npm run build
```
✓ This creates `client/dist/` with the production build
✓ Build should complete with ~122 KB gzipped bundle

### 2. Verify Environment Variables
```bash
node scripts/verify-env.js
```
✓ All required variables should show ✅

Required variables:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- RESEND_API_KEY
- AIDAFORM_BASE_URL
- AIDAFORM_WEBHOOK_SECRET

### 3. Test Locally
```bash
npm start
```
✓ Visit http://localhost:3000
✓ Test login with valid credentials
✓ Verify navigation works
✓ Check that styles load correctly

---

## 🚀 Deploy to Hostinger (Passenger)

### Step 1: Upload Files
Upload the **entire project directory** to Hostinger via FTP or Git:
```
/home/user/public_html/  (or your domain root)
├── app.js
├── package.json
├── client/
│   ├── dist/           ← React build (production)
│   └── ...
├── routes/
├── lib/
├── data/
├── public/             ← Static assets
├── scripts/
└── ... (all other files)
```

**Important**: Make sure `client/dist/` is included! This is the built React app.

### Step 2: Set Environment Variables on Hostinger

1. Go to **Hostinger Dashboard** → **Manage** → **Advanced** → **Environment Variables**

2. Add these variables:

```
NODE_ENV=production
PORT=3000
APP_URL=https://your-domain.com

SUPABASE_URL=https://govbfxytrdxpmutxbkds.supabase.co
SUPABASE_ANON_KEY=sb_publishable_L3DIzjZFkKZzChUWggHasg_QAOUYi0Q
SUPABASE_SERVICE_ROLE_KEY=[from Supabase dashboard]

RESEND_API_KEY=[from Resend dashboard]
FROM_EMAIL=noreply@thecscd.org

AIDAFORM_BASE_URL=https://15158.aidaform.com/interview
AIDAFORM_TOKEN_FIELD=candidate_token
AIDAFORM_APPLICANT_FIELD=applicant_id
AIDAFORM_WEBHOOK_SECRET=[unique secret]

EVENT_NAME=YPDS Jakarta 2026
REMINDER_LEAD_MINUTES=60
```

### Step 3: Verify Node Version
Ensure Node version matches your local setup:
- Local: `node -v` (should be v22.22.0 or similar)
- Hostinger: Set to same version in control panel

### Step 4: Start the App

Hostinger Passenger should auto-start from `app.js`, but you can manually:
1. Go to **Hostinger Dashboard** → **Manage** → **Restart Application**
2. Or SSH and run: `npm start`

### Step 5: Verify Deployment

Test these URLs:
```
✓ https://your-domain.com/              → React app loads
✓ https://your-domain.com/api/config    → API responds with config
✓ https://your-domain.com/health        → Should return { ok: true }
```

---

## ❌ Troubleshooting

### App Won't Start

**Error: "Cannot find module"**
```bash
# SSH to Hostinger and reinstall
npm install
npm run build
npm start
```

**Error: "Port already in use"**
- Check if app is already running: `lsof -i :3000`
- Kill and restart: `pkill node && npm start`

### Styles Not Loading
- Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)
- Verify `client/dist/` exists on server
- Check Express logs: `npm start`

### Login/API Not Working
- Verify all env vars are set: `node scripts/verify-env.js`
- Check Supabase project is accessible
- Verify CORS headers in Express (already configured)

### Blank Page
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab (should see assets loading)
4. Verify React bundle is loading: look for `index-*.js` in Network

---

## 📋 What Gets Deployed

```
Express Backend (unchanged)
├── Routes: /api/me, /api/data, /api/interview (same as before)
├── Database: Supabase (same connection)
└── Serves: React build as static files (new)

React Frontend (completely new)
├── Built from: client/src/
├── Output: client/dist/
└── Served by: Express static middleware
```

---

## 🔄 Deployment Flow

```
Local Development:
npm install
npm run build      → Creates client/dist/
npm start         → Starts on localhost:3000

Production (Hostinger):
Upload files (including client/dist/)
Set env vars
Passenger auto-starts app.js
Express serves React build as SPA
All /api calls go to backend routes
```

---

## ✨ What's New vs Before

**Before (Vanilla JS):**
- Single index.html served by Express
- All JavaScript inline in public/js/app.js
- No build step

**After (React):**
- SPA shell index.html in client/dist/
- React components split across many files
- Build step: `npm run build` (required before deploy)
- Faster, more maintainable, modern tooling

---

## 🎯 Success Criteria

After deployment, verify:
- ✅ App loads at https://your-domain.com
- ✅ Login page appears
- ✅ Can log in with valid credentials
- ✅ Dashboard loads with greeting
- ✅ Navigation between tabs works
- ✅ Styles (dark/light) apply correctly
- ✅ API calls work (announcements load)
- ✅ No console errors (F12)

---

## 📞 Support

If still having issues:

1. **Check Express logs**: `npm start` and watch output
2. **Check browser console**: F12 → Console tab
3. **Verify build exists**: SSH and run `ls -la client/dist/`
4. **Verify env vars**: SSH and run `node scripts/verify-env.js`
5. **Check Hostinger logs**: Dashboard → Logs

---

**Last Updated**: 2026-07-16
**Status**: Ready for production deployment
