# THE WOO — Deploy to Railway via GitHub

## Prerequisites

- [GitHub](https://github.com) account
- [Railway](https://railway.app) account (free tier works)
- Git installed locally

---

## Step 1: Create GitHub Repository

### Option A: GitHub Web UI
1. Go to https://github.com/new
2. Repository name: `thewoo-white-city`
3. Visibility: **Private** (recommended)
4. Do NOT initialize with README (we have our own)
5. Click **Create repository**
6. Copy the repository URL: `https://github.com/YOUR_USERNAME/thewoo-white-city.git`

### Option B: GitHub CLI (if installed)
```bash
gh auth login
gh repo create thewoo-white-city --private --source=. --push
# Skip to Step 3 if this succeeds
```

---

## Step 2: Push Code to GitHub

From the project directory (`/mnt/agents/output/app/`):

```bash
# Add the remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/thewoo-white-city.git

# Push
git branch -M main
git push -u origin main
```

**Note:** This is a large repo (~30MB with photos). First push may take 1-2 minutes.

---

## Step 3: Connect Railway to GitHub

1. Go to https://railway.app/new
2. Click **Deploy from GitHub repo**
3. Select `thewoo-white-city` repository
4. Railway auto-detects the Node.js project
5. Click **Deploy**

**Add MySQL Database:**
1. In Railway dashboard, click **New** → **Database** → **Add MySQL**
2. Railway auto-creates `DATABASE_URL` environment variable
3. MySQL connection is ready — no manual setup needed

---

## Step 4: Set Environment Variables

In Railway dashboard → your project → **Variables** tab, add:

| Variable | Value | How to Generate |
|----------|-------|-----------------|
| `APP_ID` | `thewoo_prod_2026` | Any unique string |
| `APP_SECRET` | `GENERATE` | `openssl rand -hex 32` |
| `ADMIN_SECRET_KEY` | `GENERATE` | `openssl rand -hex 16` |
| `NODE_ENV` | `production` | Fixed |
| `PORT` | `3000` | Fixed (Railway overrides this) |

Railway auto-provides `DATABASE_URL` from the MySQL addon.

**Generate secrets:**
```bash
openssl rand -hex 32   # APP_SECRET
openssl rand -hex 16   # ADMIN_SECRET_KEY
```

---

## Step 5: Deploy

Railway auto-deploys on every push to `main`. First deploy happens after Step 3.

### Verify deployment:
1. Check **Deployments** tab in Railway
2. Wait for status = **Success** (takes 2-3 minutes)
3. Railway provides a URL: `https://thewoo-white-city.up.railway.app`

### Set custom domain (optional):
1. Railway dashboard → **Settings** → **Domains**
2. Add your domain (e.g., `thewoo.az`)
3. Railway provides DNS records — add them at your domain registrar
4. SSL is automatic

---

## Step 6: Run Database Migrations

First deploy won't have tables yet. Run migrations:

### Option A: Railway CLI
```bash
npm install -g @railway/cli
railway login
railway link  # select your project
cd thewoo-white-city
railway run -- npm run db:migrate
```

### Option B: Railway dashboard console
1. Railway dashboard → your service → **Console** tab
2. Run:
```bash
npm run db:migrate
```

---

## Step 7: Verify Live Site

| Check | URL | Expected |
|-------|-----|----------|
| Homepage | `https://your-app.railway.app` | Loads, no errors |
| QR Menu | `/#/qr-menu/white-city` | Shows menu with categories |
| Admin | `/#/admin` | Prompts for admin key |
| Sitemap | `/sitemap.xml` | Valid XML |
| Robots | `/robots.txt` | Shows allow rules |
| HTTPS | Check browser lock icon | Certificate valid |

---

## Troubleshooting

### Build fails
- Check **Build Logs** in Railway dashboard
- Common issue: missing `DATABASE_URL` → add MySQL addon

### Admin key doesn't work
- Verify `ADMIN_SECRET_KEY` is set in Railway Variables
- Key must match exactly (copy-paste from Railway to admin prompt)

### QR menu shows no photos
- Photos are in `public/food-photos/` (committed to git)
- Verify files exist: check Railway deployment file list

### Database errors
- Run migrations: `railway run -- npm run db:migrate`
- Check MySQL addon is provisioned (green dot in Railway)

---

## Updating After Launch

```bash
# Make changes locally
git add -A
git commit -m "Update: description of changes"
git push origin main
# Railway auto-deploys in 1-2 minutes
```

---

## Local Development

```bash
npm install
# Create .env from template
cp .env.example .env
# Edit .env with your local MySQL credentials
npm run dev          # Frontend + backend on :3000
npm run db:migrate   # Create tables
```
