# 🚀 Deploy to Render + Vercel

Complete guide to deploy your DSA Analytics Platform using **Render** (backend) and **Vercel** (frontend).

## 📋 Prerequisites

- GitHub account
- Render account (free at [render.com](https://render.com))
- Vercel account (free at [vercel.com](https://vercel.com))

---

## Step 1: Push Code to GitHub

```bash
cd "/Users/sudeshhnabehera/Desktop/dsa based project"

# Initialize git if not already done
git init
git add .
git commit -m "Prepare for Render + Vercel deployment"

# Add your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Render

### 2.1 Create PostgreSQL Database

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `dsa-analytics-db`
   - **Database:** `cp_analytics`
   - **Region:** Choose closest to you
   - **PostgreSQL Version:** 15
   - **Plan:** **Free** ✅
4. Click **"Create Database"**
5. Wait 2-3 minutes for database to provision
6. Once ready, copy the **"Internal Database URL"** (save it!)

### 2.2 Deploy Backend Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `dsa-analytics-backend`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** **Free** ✅
4. Click **"Advanced"** → Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<paste-internal-database-url-from-step-2.1>
   JWT_SECRET=<generate-random-secret>
   ```
   
   **Generate JWT_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
5. Click **"Create Web Service"**
6. Wait 3-5 minutes for deployment
7. Copy the service URL (e.g., `https://dsa-analytics-backend.onrender.com`)
   **Save this URL!** You'll need it for the frontend.

### 2.3 Initialize Database Schema

1. Go to your PostgreSQL database in Render
2. Click **"Connect"** tab
3. Use one of these methods:

   **Option A: Using Render Shell (if available)**
   - Click "Shell" button
   - Run the SQL from `backend/database/schema.postgresql.sql`

   **Option B: Using Local psql**
   ```bash
   psql "<internal-database-url>"
   ```
   Then paste the SQL from `backend/database/schema.postgresql.sql`

   **Quick SQL to run:**
   ```sql
   CREATE TABLE IF NOT EXISTS users (
       id SERIAL PRIMARY KEY,
       email VARCHAR(255) UNIQUE NOT NULL,
       password_hash VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   CREATE INDEX IF NOT EXISTS idx_email ON users(email);
   
   CREATE TABLE IF NOT EXISTS submissions (
       id SERIAL PRIMARY KEY,
       user_id INTEGER NOT NULL,
       problem_name VARCHAR(255) NOT NULL,
       difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
       topic VARCHAR(100) NOT NULL,
       time_taken INTEGER NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
   );
   
   CREATE INDEX IF NOT EXISTS idx_user_id ON submissions(user_id);
   CREATE INDEX IF NOT EXISTS idx_difficulty ON submissions(difficulty);
   CREATE INDEX IF NOT EXISTS idx_topic ON submissions(topic);
   ```

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 3.2 Add Environment Variables

1. In Vercel project settings, go to **"Environment Variables"**
2. Add:
   ```
   VITE_API_URL=https://dsa-analytics-backend.onrender.com
   ```
   (Use the backend URL from Step 2.2)

### 3.3 Deploy

1. Click **"Deploy"**
2. Wait 1-2 minutes for deployment
3. Your app will be live at: `https://your-project.vercel.app` 🎉

---

## Step 4: Configure CORS (Important!)

Your backend needs to allow requests from Vercel. Update your backend CORS settings:

**In `backend/src/server.js`, make sure CORS is configured:**

```javascript
import cors from 'cors';

// Allow Vercel domain
app.use(cors({
  origin: [
    'http://localhost:5173', // Local development
    'https://your-project.vercel.app', // Your Vercel URL
    /\.vercel\.app$/ // All Vercel preview deployments
  ],
  credentials: true
}));
```

Then redeploy the backend on Render.

---

## Step 5: Keep Backend Awake (Optional)

Render's free tier spins down after 15 minutes. To keep it awake:

1. Sign up at [uptimerobot.com](https://uptimerobot.com) (free)
2. Add a monitor:
   - **Type:** HTTP(s)
   - **URL:** `https://dsa-analytics-backend.onrender.com/health`
   - **Interval:** 5 minutes

---

## ✅ Deployment Complete!

Your app is now live:
- **Frontend:** `https://your-project.vercel.app`
- **Backend:** `https://dsa-analytics-backend.onrender.com`

---

## 🔧 Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify `DATABASE_URL` is set correctly
- Ensure `pg` package is in `package.json`

### Frontend can't connect to backend
- Verify `VITE_API_URL` matches backend URL exactly
- Check CORS settings in backend
- Ensure backend is awake (ping `/health` endpoint)

### Database connection fails
- Use **Internal Database URL** (not public)
- Ensure database is in same region as backend
- Check SSL is enabled (automatic on Render)

### Vercel build fails
- Check build logs in Vercel dashboard
- Ensure `VITE_API_URL` is set
- Verify `package.json` has correct build script

---

## 📊 What You Get for Free

**Render (Backend):**
- ✅ Web service (512MB RAM)
- ✅ PostgreSQL database (1GB storage)
- ✅ SSL certificates
- ✅ Auto-deploy on git push

**Vercel (Frontend):**
- ✅ Unlimited deployments
- ✅ SSL certificates
- ✅ Global CDN
- ✅ Preview deployments for PRs

**Limitations:**
- Render services spin down after 15 min (use UptimeRobot)
- Render has 512MB RAM limit
- Vercel has bandwidth limits on free tier (generous)

---

## 🚀 Next Steps

1. ✅ Test all features
2. ✅ Set up UptimeRobot to keep backend awake
3. ✅ (Optional) Add custom domains
4. ✅ Monitor usage in dashboards

**Congratulations! Your app is live! 🎉**

