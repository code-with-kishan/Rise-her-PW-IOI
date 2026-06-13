# RISEher Deployment Checklist

Quick reference checklist for deploying RISEher to production.

---

## Pre-Deployment (Local)

### Backend Configuration
- [ ] Install dependencies: `npm install`
- [ ] Copy `api.env.example` to `.env` or `.env.production`
- [ ] Set `GEMINI_API_KEY` in environment file
- [ ] Generate secure `JWT_SECRET` (min 32 chars)
- [ ] Test locally: `npm run dev`
- [ ] Test health endpoint: `curl http://localhost:3000/api/health`
- [ ] Verify all API routes respond correctly

### Frontend Configuration
- [ ] Ensure `VITE_API_URL` points to backend URL
- [ ] Run build locally: `npm run build`
- [ ] Test build: `npm run preview`
- [ ] Verify no build errors
- [ ] Check console for warnings

### Git Repository
- [ ] Commit all changes: `git add . && git commit -m "Deploy preparation"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Verify all files are pushed
- [ ] Confirm no uncommitted changes: `git status`

---

## Render Backend Deployment

### 1. Create Render Account
- [ ] Sign up at https://render.com
- [ ] Connect GitHub account
- [ ] Grant repository permissions

### 2. Create Web Service
- [ ] Click "New +"
- [ ] Select "Web Service"
- [ ] Select GitHub repository
- [ ] Choose branch: `main`

### 3. Configure Service
- [ ] Service Name: `riseher-backend`
- [ ] Environment: `Node`
- [ ] Region: Select closest to users
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Plan: Free/Starter

### 4. Environment Variables
Set the following in Render:
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3000`
- [ ] `GEMINI_API_KEY` = [Your API Key]
- [ ] `JWT_SECRET` = [Your Secret Key]
- [ ] `FRONTEND_URL` = [Vercel URL - set after frontend deploy]
- [ ] `ALLOWED_ORIGINS` = [Vercel URL - set after frontend deploy]

### 5. Deploy
- [ ] Review configuration
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (2-5 minutes)
- [ ] Check logs for errors
- [ ] Note the backend URL (e.g., `https://riseher-backend.onrender.com`)

### 6. Verify Backend
- [ ] Test health endpoint:
  ```bash
  curl https://riseher-backend.onrender.com/api/health
  ```
- [ ] Expected response: `{"status":"ok","timestamp":"..."}`
- [ ] Test AI endpoint:
  ```bash
  curl -X POST https://riseher-backend.onrender.com/api/ai/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"Hello"}'
  ```

---

## Vercel Frontend Deployment

### 1. Create Vercel Account
- [ ] Sign up at https://vercel.com
- [ ] Connect GitHub account
- [ ] Grant repository permissions

### 2. Import Project
- [ ] Click "Add New +"
- [ ] Select "Project"
- [ ] Select GitHub
- [ ] Search for "RISEher"
- [ ] Click "Import"

### 3. Configure Build
- [ ] Project Name: `riseher`
- [ ] Framework: `Vite`
- [ ] Root Directory: `./` or empty
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`

### 4. Environment Variables
Set in Vercel:
- [ ] `VITE_API_URL` = `https://riseher-backend.onrender.com/api`
- [ ] `VITE_NODE_ENV` = `production`

### 5. Deploy
- [ ] Review settings
- [ ] Click "Deploy"
- [ ] Wait for deployment (2-5 minutes)
- [ ] Check build logs for errors
- [ ] Note the Vercel URL (e.g., `https://riseher.vercel.app`)

### 6. Verify Frontend
- [ ] Visit Vercel URL in browser
- [ ] Check that page loads correctly
- [ ] Open browser DevTools → Network tab
- [ ] Verify API calls are going to backend
- [ ] Check for any CORS errors

---

## Post-Deployment Configuration

### 1. Update Backend CORS
- [ ] Go to Render Dashboard
- [ ] Select `riseher-backend` service
- [ ] Go to "Environment"
- [ ] Update `FRONTEND_URL`: `https://your-vercel-url.vercel.app`
- [ ] Update `ALLOWED_ORIGINS`: `https://your-vercel-url.vercel.app`
- [ ] Save changes (triggers redeploy)
- [ ] Wait for redeploy to complete

### 2. Enable Auto-Deploy
- [ ] **Render:**
  - [ ] Go to Service Settings
  - [ ] Enable "Auto-Deploy"
  - [ ] Select "Yes" for auto-deploy on main branch
  
- [ ] **Vercel:**
  - [ ] Already enabled by default
  - [ ] Verify in Settings → Git

### 3. Setup Custom Domain (Optional)
- [ ] Purchase domain
- [ ] **For Vercel:**
  - [ ] Add domain in Settings → Domains
  - [ ] Add DNS records as instructed
  
- [ ] **For Render:**
  - [ ] Add domain in Service Settings
  - [ ] Add DNS records as instructed

### 4. Update Environment URLs (if using custom domain)
- [ ] Update `FRONTEND_URL` on Render
- [ ] Update `VITE_API_URL` on Vercel
- [ ] Redeploy both services

---

## Testing

### API Testing
- [ ] Health check: `curl https://backend-url.onrender.com/api/health`
- [ ] Auth endpoint: `POST /api/auth/login`
- [ ] Marketplace: `GET /api/marketplace/products`
- [ ] Health routes: `GET /api/health/status`
- [ ] Safety routes: `POST /api/safety/alert`
- [ ] Services: `GET /api/services`

### Frontend Testing
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Login/authentication works
- [ ] API calls complete without CORS errors
- [ ] Forms submit successfully
- [ ] Images load properly
- [ ] 3D models load (if applicable)
- [ ] Mobile responsiveness verified

### Performance Testing
- [ ] Check Vercel Analytics
- [ ] Monitor Render CPU/Memory
- [ ] Test with slow network (DevTools)
- [ ] Verify page load time < 3s
- [ ] Check Lighthouse score > 80

---

## Monitoring Setup

### Render Monitoring
- [ ] Set up email alerts for service failures
- [ ] Check logs regularly
- [ ] Monitor memory usage
- [ ] Setup CPU usage alerts

### Vercel Monitoring
- [ ] Enable Web Analytics
- [ ] Monitor deploy frequency
- [ ] Watch for build failures
- [ ] Review error logs

### Error Tracking (Optional)
- [ ] Consider Sentry for error tracking
- [ ] Setup LogRocket for session replay
- [ ] Configure email notifications

---

## Troubleshooting

### Common Issues

**CORS Errors**
- [ ] Verify `ALLOWED_ORIGINS` in Render
- [ ] Check frontend URL matches exactly
- [ ] Restart Render service
- [ ] Check browser console for exact error

**API 404 Errors**
- [ ] Verify backend is running
- [ ] Check route paths match
- [ ] Verify `VITE_API_URL` is correct
- [ ] Test endpoint with curl

**Build Failures**
- [ ] Check Node version compatibility
- [ ] Verify `package-lock.json` is committed
- [ ] Clear build cache
- [ ] Check for missing dependencies

**Service Won't Stay Awake**
- [ ] Use Render Starter or paid plan
- [ ] Setup cron job to ping endpoint
- [ ] Configure auto-wake URL

---

## Security Checklist

- [ ] JWT_SECRET is 32+ characters
- [ ] GEMINI_API_KEY is secure and not in code
- [ ] No secrets in `.env.example`
- [ ] No secrets in repository
- [ ] HTTPS is enabled (automatic)
- [ ] CORS is properly configured
- [ ] Rate limiting is active
- [ ] No API keys in frontend code

---

## Rollback Procedure

### If Issues Occur

**Render Backend**
1. Go to Service → Deployments
2. Select previous working deployment
3. Click "Redeploy"
4. Verify service health

**Vercel Frontend**
1. Go to Deployments
2. Select previous working deployment
3. Click "Redeploy"
4. Verify site loads

---

## Final Checklist

- [ ] Backend is running and responding
- [ ] Frontend loads without errors
- [ ] API communication works
- [ ] No console errors
- [ ] No CORS errors
- [ ] All features tested
- [ ] Performance acceptable
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team notified

---

## Support & Escalation

| Issue | Support |
|-------|---------|
| Render issues | https://render.com/docs |
| Vercel issues | https://vercel.com/support |
| Code issues | GitHub Issues |
| API issues | Server logs / DevTools |

---

**Deployment Date:** ___________
**Deployed By:** ___________
**Status:** ___________

For questions, refer to [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
