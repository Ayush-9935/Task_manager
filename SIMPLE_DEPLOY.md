# 🚀 Simple Deployment Guide

## Backend Deployment (Render)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub

### Step 2: Connect GitHub Repository
1. Click **New +** → **Web Service**
2. Select your GitHub repo: `Task_manager`
3. Choose the root directory: `backend`

### Step 3: Configure Environment
1. **Name:** task-manager-api
2. **Runtime:** Node
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`

### Step 4: Add Environment Variables
In the "Environment" section, add:
```
PORT=5000
MONGODB_URI=mongodb+srv://ayush_0099:Ayush_99@cluster0.6gbj9ut.mongodb.net/
JWT_SECRET=this_is_a_super_secret_jwt_key_for_development
NODE_ENV=production
FRONTEND_URL=https://task-manager99.vercel.app
```

### Step 5: Deploy
Click **Create Web Service** and wait for deployment ✅

---

## Frontend Deployment (Vercel)

### Step 1: Connect GitHub to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub

### Step 2: Import Project
1. Click **Add New** → **Project**
2. Select your GitHub repo: `Task_manager`
3. Set **Root Directory** to `frontend`
4. Click **Deploy**

### Step 3: Add Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Add this:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://task-manager-c5e6.onrender.com/api`
   - **Environments:** Production
3. Click **Add**

### Step 4: Redeploy
1. Go to **Deployments** tab
2. Click the 3-dots menu on latest deployment
3. Click **Redeploy** ✅

---

## Done! 

Your app is now live:
- **Backend:** https://task-manager-c5e6.onrender.com
- **Frontend:** https://task-manager99.vercel.app

### After Making Changes

1. **Commit and push to GitHub:**
   ```
   git add .
   git commit -m "Your message"
   git push origin main
   ```

2. **Both services auto-deploy automatically!** ✅

---

## Quick Redeploy (if needed)

**Backend:**
- Render dashboard → Services → task-manager-api → Manual Deploy

**Frontend:**
- Vercel dashboard → Deployments → Click Redeploy

Done! 🎉
