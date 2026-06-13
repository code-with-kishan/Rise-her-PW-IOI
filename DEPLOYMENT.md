# RISEher Deployment Guide

Complete guide to deploy RISEher frontend on Vercel and backend on Render.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Environment Configuration](#environment-configuration)
5. [Post-Deployment Setup](#post-deployment-setup)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Accounts
- GitHub account with repository access
- Render account (https://render.com)
- Vercel account (https://vercel.com)
- Google Cloud Console account (for Gemini API)

### Required Knowledge
- Basic Git & GitHub operations
- Understanding of environment variables
- Basic knowledge of web deployment

---

## Backend Deployment (Render)

### Step 1: Prepare the Backend

1. **Update package.json scripts**
   ```bash
   "start": "tsx server.ts"
   "dev": "tsx watch server.ts"
   "build": "tsc --noEmit"
   ```

2. **Create api.env file** (use `api.env.example` as template)
   ```bash
   cp api.env.example api.env
   ```

3. **Configure environment variables** in `api.env`:
   - Set `NODE_ENV=production`
   - Add your `GEMINI_API_KEY`
   - Generate a secure `JWT_SECRET` (min 32 characters)
   - Set `FRONTEND_URL` to your Vercel URL

### Step 2: Connect to Render

1. **Login to Render Dashboard**
   - Visit https://render.com/dashboard
   - Click "New +"

2. **Select "Web Service"**
   - Connect your GitHub repository
   - Choose the RISEher repository
   - Select branch: `main`

3. **Configure Web Service**

   **Name:** `riseher-backend`
   
   **Environment:** `Node`
   
   **Region:** Select closest to your users (e.g., `Oregon` for US)
   
   **Build Command:**
   ```bash
   npm install
   ```
   
   **Start Command:**
   ```bash
   npm start
   ```
   
   **Plan:** Free (or Starter depending on traffic)

4. **Add Environment Variables**
   - Click "Advanced" 
   - Add each variable from your `api.env`:
     - `NODE_ENV`: `production`
     - `PORT`: `3000`
     - `GEMINI_API_KEY`: [Your API key]
     - `JWT_SECRET`: [Your secure secret]
     - `FRONTEND_URL`: [Your Vercel domain]
     - `ALLOWED_ORIGINS`: `https://your-domain.vercel.app,http://localhost:5173`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete (2-5 minutes)
   - Note your backend URL: `https://riseher-backend.onrender.com`

### Step 3: Verify Backend

```bash
# Test the health endpoint
curl https://riseher-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-18T..."
}
```

---

## Frontend Deployment (Vercel)

### Step 1: Prepare the Frontend

1. **Update API base URL** in frontend code
   - Edit `src/services/api.ts`:
   ```typescript
   const API_BASE_URL = process.env.VITE_API_URL || 'https://riseher-backend.onrender.com/api';
   ```

2. **Create `.env.production`** in root:
   ```env
   VITE_API_URL=https://riseher-backend.onrender.com/api
   VITE_NODE_ENV=production
   ```

3. **Verify build works locally**
   ```bash
   npm run build
   npm run preview
   ```

### Step 2: Connect to Vercel

1. **Login to Vercel**
   - Visit https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Git Repository**
   - Select "GitHub"
   - Search for "RISEher"
   - Click "Import"

3. **Configure Project**

   **Project Name:** `riseher`
   
   **Framework:** `Vite`
   
   **Root Directory:** `./` (or empty)
   
   **Build Command:** `npm run build`
   
   **Output Directory:** `dist`
   
   **Install Command:** `npm install`

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add:
     - `VITE_API_URL`: `https://riseher-backend.onrender.com/api`
     - `VITE_NODE_ENV`: `production`

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-5 minutes)
   - Get your Vercel URL: `https://riseher.vercel.app`

### Step 3: Configure Custom Domain (Optional)

1. **Add Domain to Vercel**
   - Go to Settings → Domains
   - Add your domain
   - Follow DNS setup instructions

2. **Update Backend CORS**
   - Go to Render dashboard
   - Update `FRONTEND_URL` variable to your domain
   - Update `ALLOWED_ORIGINS` to include your domain

---

## Environment Configuration

### Backend Environment Variables

```env
# Render Production
NODE_ENV=production
PORT=3000
GEMINI_API_KEY=[Google Gemini API Key]
JWT_SECRET=[Minimum 32 character random string]
FRONTEND_URL=https://riseher.vercel.app
ALLOWED_ORIGINS=https://riseher.vercel.app
```

### Frontend Environment Variables

```env
# Vercel Production
VITE_API_URL=https://riseher-backend.onrender.com/api
VITE_NODE_ENV=production
```

### Generate Secure JWT Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

---

## Post-Deployment Setup

### Step 1: Enable Auto-Deploy

1. **Render Auto-Deploy**
   - Go to Service Settings
   - Enable "Auto-Deploy"
   - Select "Yes" for "Auto-Deploy when a new commit is pushed to main"

2. **Vercel Auto-Deploy**
   - Already enabled by default
   - Deploys automatically on push to main

### Step 2: Test Endpoints

```bash
# Test backend health
curl https://riseher-backend.onrender.com/api/health

# Test AI endpoint
curl -X POST https://riseher-backend.onrender.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "mode": "general"}'

# Test from frontend (check network tab in browser)
# Should see requests to https://riseher-backend.onrender.com/api/*
```

### Step 3: Update Backend URL in Render Config

After Vercel deployment, update the `FRONTEND_URL` in Render:
1. Go to Render Dashboard
2. Select `riseher-backend` service
3. Click "Environment"
4. Update `FRONTEND_URL` to your Vercel URL
5. Save (triggers redeploy)

---

## Monitoring & Maintenance

### Performance Monitoring

**Render Dashboard**
- Monitor CPU and Memory usage
- Check logs in "Logs" tab
- Monitor error rates

**Vercel Dashboard**
- Check analytics
- Monitor Web Vitals
- Track deploy history

### Logs Access

```bash
# Render logs
# Via dashboard: Select service → Logs tab
# Live tail:
# Login to Render CLI and use: render logs -s riseher-backend

# Vercel logs
# Via dashboard: Select deployment → Logs tab
```

### Troubleshooting

**Backend Issues**
1. Check Render logs for errors
2. Verify environment variables are set
3. Test API endpoints with curl
4. Check CORS settings
5. Restart service: Settings → Restart

**Frontend Issues**
1. Check Vercel logs for build errors
2. Check browser console for client errors
3. Verify API URL is correct in network requests
4. Check CORS headers from backend
5. Redeploy: Settings → Deployments → Redeploy

### Redeploying

**Manual Redeploy on Render**
```bash
# Via dashboard: Service → Manual Deploy
# Or push new commit to main branch
```

**Manual Redeploy on Vercel**
```bash
# Via dashboard: Deployments → Select deployment → Redeploy
# Or push new commit to main branch
```

---

## Environment Variables Summary

### For Render (Backend)
```
NODE_ENV=production
PORT=3000
GEMINI_API_KEY=<your_key>
JWT_SECRET=<32_char_min>
FRONTEND_URL=<vercel_url>
ALLOWED_ORIGINS=<vercel_url>
```

### For Vercel (Frontend)
```
VITE_API_URL=<render_backend_url>
VITE_NODE_ENV=production
```

---

## Security Checklist

- [ ] JWT_SECRET is minimum 32 characters
- [ ] GEMINI_API_KEY is set and kept private
- [ ] FRONTEND_URL matches your Vercel domain
- [ ] ALLOWED_ORIGINS is configured correctly
- [ ] No secrets in `.env.example` or README
- [ ] HTTPS is enabled (automatic with both platforms)
- [ ] Rate limiting is active on backend
- [ ] CORS is properly configured

---

## Troubleshooting Common Issues

### 1. CORS Errors
**Problem:** Browser console shows CORS errors

**Solution:**
1. Check backend `ALLOWED_ORIGINS` environment variable
2. Ensure frontend URL matches exactly
3. Verify CORS middleware in `server.ts`
4. Restart Render service

### 2. API Requests Fail (404)
**Problem:** 404 errors on API calls

**Solution:**
1. Verify backend is running: `curl https://riseher-backend.onrender.com/api/health`
2. Check frontend `VITE_API_URL` environment variable
3. Verify route paths in `server/routes/`
4. Check for typos in endpoint URLs

### 3. Build Fails on Vercel
**Problem:** Build fails with dependency errors

**Solution:**
1. Check `package-lock.json` is committed
2. Clear Vercel cache: Settings → Git → Clear Cache
3. Try manual redeploy
4. Check Node version compatibility

### 4. Render Service Goes to Sleep
**Problem:** First request takes 30+ seconds

**Solution:**
1. Use Render Starter or Paid plan (free tier sleeps after 15 min inactivity)
2. Or setup cron job to ping endpoint every 10 minutes
3. Ping URL: `https://riseher-backend.onrender.com/api/health`

### 5. Environment Variables Not Applied
**Problem:** Changes to env vars not reflecting

**Solution:**
1. Go to Render Service → Settings
2. Confirm variables are set
3. Manual redeploy required
4. Wait 2-3 minutes for changes to take effect

---

## Performance Optimization Tips

### Backend Optimization
- Enable gzip compression
- Use caching for API responses
- Optimize database queries
- Monitor and fix slow endpoints

### Frontend Optimization
- Enable Vercel analytics
- Optimize images
- Code splitting with React Router
- Minimize bundle size

---

## Next Steps

1. **Monitor deployments** for first 24 hours
2. **Test all features** in production
3. **Setup error tracking** (Sentry, LogRocket)
4. **Configure backup and recovery** procedures
5. **Plan scaling strategy** as user base grows

---

## Support & Additional Resources

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Express.js Docs: https://expressjs.com
- Vite Docs: https://vitejs.dev
- TypeScript Docs: https://www.typescriptlang.org/docs

---

**Last Updated:** April 2026
**Version:** 1.0.0

For questions or issues, contact the development team or open a GitHub issue.
