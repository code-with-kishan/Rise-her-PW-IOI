# RISEher Quick Start Deployment Guide

Deploy RISEher in 15 minutes!

---

## 🚀 Quick 3-Step Deployment

### Step 1: Prepare Backend (Render) - 3 minutes

```bash
# 1. Go to https://render.com/dashboard
# 2. Click "New +"  → "Web Service"
# 3. Connect your GitHub account
# 4. Select RISEher repository
# 5. Configure:
#    Name: riseher-backend
#    Build Cmd: npm install
#    Start Cmd: npm start
#    Plan: Free
```

**Add Environment Variables:**
```
NODE_ENV=production
PORT=3000
GEMINI_API_KEY=[Get from Google Cloud Console]
JWT_SECRET=[Run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
FRONTEND_URL=[Will add after Vercel deployment]
ALLOWED_ORIGINS=[Will add after Vercel deployment]
```

**Deploy** and note your backend URL (e.g., `https://riseher-backend.onrender.com`)

---

### Step 2: Deploy Frontend (Vercel) - 5 minutes

```bash
# 1. Go to https://vercel.com/dashboard
# 2. Click "Add New" → "Project"
# 3. Select "GitHub"
# 4. Search and import "RISEher"
# 5. Configure:
#    Framework: Vite
#    Build Cmd: npm run build
#    Output Dir: dist
```

**Add Environment Variable:**
```
VITE_API_URL=https://riseher-backend.onrender.com/api
VITE_NODE_ENV=production
```

**Deploy** and note your frontend URL (e.g., `https://riseher.vercel.app`)

---

### Step 3: Configure CORS - 2 minutes

1. **Go back to Render Dashboard**
2. **Select your backend service**
3. **Update Environment Variables:**
   ```
   FRONTEND_URL=https://riseher.vercel.app
   ALLOWED_ORIGINS=https://riseher.vercel.app
   ```
4. **Service will auto-redeploy** ✅

---

## ✅ Testing

```bash
# Test backend is running
curl https://riseher-backend.onrender.com/api/health

# Should return:
# {"status":"ok","timestamp":"2026-04-18T..."}

# Visit frontend
# https://riseher.vercel.app

# Open browser DevTools → Network tab
# Make a request (login, load page, etc.)
# Verify API calls go to backend
```

---

## 🔑 Required API Keys

| Service | Where to Get | Purpose |
|---------|-------------|---------|
| Gemini API | https://console.cloud.google.com | AI Chat Features |
| Firebase | https://console.firebase.google.com | (Already in code) |

**To get Gemini API Key:**
1. Go to https://console.cloud.google.com
2. Create new project
3. Enable "Generative Language API"
4. Create API key
5. Copy and paste to Render `GEMINI_API_KEY`

---

## 📊 What's Now Live

| Component | URL | Status |
|-----------|-----|--------|
| Frontend | `https://riseher.vercel.app` | ✅ Live |
| Backend API | `https://riseher-backend.onrender.com/api` | ✅ Live |
| Health Check | `/api/health` | ✅ Ready |
| AI Chat | `/api/ai/chat` | ✅ Ready |
| Auth | `/api/auth/*` | ✅ Ready |
| Marketplace | `/api/marketplace/*` | ✅ Ready |

---

## 🔍 Troubleshooting

### Backend won't deploy
- Check Node version (should be 18+)
- Check logs in Render → Logs tab
- Verify `npm start` works locally: `npm run dev`

### Frontend shows API errors
- Check `VITE_API_URL` is set correctly
- Check backend `ALLOWED_ORIGINS` includes frontend URL
- Wait 2-3 mins for Render redeploy after changing env vars

### CORS errors in browser
1. Open DevTools → Console
2. Copy the exact error
3. Update Render `ALLOWED_ORIGINS` with exact URL

### 404 API errors
- Verify backend is running: `curl backend-url/api/health`
- Check API path matches route files in `server/routes/`
- Verify `VITE_API_URL` doesn't have trailing slash

---

## 📱 Next Steps

- [ ] Setup monitoring (Render dashboard)
- [ ] Add custom domain (optional)
- [ ] Setup error tracking (Sentry)
- [ ] Configure email alerts
- [ ] Setup CI/CD improvements
- [ ] Add database backups

---

## 📚 Full Documentation

For detailed step-by-step instructions, see:
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Verification checklist
- **[README.md](./README.md)** - Project overview

---

## 🆘 Need Help?

| Issue | Solution |
|-------|----------|
| Build failed | Check `npm run build` locally first |
| API not responding | Verify `GEMINI_API_KEY` is set |
| Page not loading | Check browser DevTools console |
| Can't connect to backend | Verify `VITE_API_URL` env var |

---

**Congratulations!** 🎉 RISEher is now deployed and live!

Monitor your deployments in:
- **Vercel:** https://vercel.com/dashboard
- **Render:** https://render.com/dashboard
