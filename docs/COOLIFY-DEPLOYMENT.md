# f0 Coolify Deployment Guide

> **Definitive guide based on real deployment experience.** This guide addresses all the issues encountered during actual f0 deployments to Coolify, including memory constraints, health check configuration, and build optimization.

## Prerequisites

### Minimum Server Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| **RAM** | 1GB + 2GB swap | 2GB+ |
| **CPU** | 1 vCPU | 2 vCPU |
| **Storage** | 10GB | 20GB |
| **Node.js** | 18+ | 20+ |

> ⚠️ **Critical**: Nuxt builds require **1-2GB of memory**. Servers with less than 1GB available RAM will fail during the build phase.

---

## Step 1: Prepare Your Server

### 1.1 Check Available Memory

```bash
ssh user@your-server
free -h
```

If available memory is less than 1GB, **you must add swap space**:

### 1.2 Add Swap Space (Required for servers with < 2GB RAM)

```bash
# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent (survives reboot)
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
```

### 1.3 Clear Docker Resources

Free up memory before deploying:

```bash
# Remove unused containers, images, and build cache
docker system prune -af
docker builder prune -af
```

---

## Step 2: Configure Coolify Server Settings

### 2.1 Reduce Concurrent Builds

In Coolify Dashboard:
1. Go to **Servers** → Select your server
2. Click **Advanced** tab
3. Set **Concurrent Builds** to `1`
4. Click **Save**

> This prevents multiple builds from competing for limited memory.

### 2.2 Verify Build Timeout

Default is 3600 seconds (60 minutes), which is sufficient. If changed, ensure it's at least **1800 seconds** (30 minutes).

---

## Step 3: Create the Application in Coolify

### 3.1 Add New Resource

1. Go to **Projects** → Select or create a project
2. Click **+ New** → **Application**
3. Select **GitHub** (or your Git provider)
4. Select your repository

### 3.2 Configure Build Settings

| Setting | Value |
|---------|-------|
| **Build Pack** | Dockerfile |
| **Dockerfile Location** | `/Dockerfile` |
| **Port Exposes** | `3000` |
| **Port Mappings** | Leave empty (Coolify handles this) |

---

## Step 4: Configure Health Check (Critical!)

> ⚠️ **This is the #1 cause of deployment failures.** Incorrect health check settings will kill your container immediately after it starts.

### 4.1 Navigate to Health Check Settings

In your application → **Configuration** → **Health Check**

### 4.2 Set Correct Values

| Setting | Value | Notes |
|---------|-------|-------|
| **Enable Healthcheck** | ✅ Enabled | Click the purple button |
| **Method** | `GET` | |
| **Scheme** | `http` | ⚠️ NOT https! |
| **Host** | `localhost` | |
| **Port** | `3000` | ⚠️ NOT 80! |
| **Path** | `/` | |
| **Interval** | `30` | Seconds between checks |
| **Timeout** | `10` | Seconds to wait for response |
| **Retries** | `3` | Attempts before marking unhealthy |
| **Start Period** | `60` | ⚠️ Give app time to start |
| **Response Code** | `200` | |

### 4.3 Common Health Check Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Port set to `80` | Container killed immediately | Change to `3000` |
| Scheme set to `https` | Connection refused | Change to `http` |
| Start Period too low | Container killed during startup | Set to `60` or higher |
| Health check disabled but Dockerfile has HEALTHCHECK | Template error | Remove HEALTHCHECK from Dockerfile |

---

## Step 5: Configure Environment Variables

### 5.1 Add Required Variables

In your application → **Environment Variables**:

```env
# Required
AUTH_MODE=public

# Site Metadata
NUXT_PUBLIC_SITE_NAME=Your Site Name
NUXT_PUBLIC_SITE_DESCRIPTION=Your site description

# For private mode (optional)
# AUTH_MODE=private
# JWT_SECRET=your-super-secret-key-minimum-32-characters

# For email OTP (optional)
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=your-key
# AWS_SECRET_ACCESS_KEY=your-secret
# EMAIL_FROM=no-reply@yourdomain.com
```

### 5.2 Important Notes

- `JWT_SECRET` must be at least 32 characters for production
- AWS credentials are only needed if using email OTP authentication
- All environment variables are set at **build time** and **runtime**

---

## Step 6: Content Strategy

### Option A: Content in Git Repository (Recommended)

If your `content/` folder is committed to your repository:

- ✅ **No storage mounts needed**
- ✅ GitOps workflow - push to deploy
- ✅ Content versioned with code

```
your-repo/
├── content/          ← Committed to Git
│   ├── nav.md
│   ├── home.md
│   └── guides/
├── private/          ← Committed (or use env vars for allowlist)
│   └── allowlist.json
└── ... app files
```

**Workflow:**
1. Edit content locally
2. `git push origin main`
3. Coolify auto-deploys

### Option B: External Content (Directory Mounts)

Only use if content lives **outside** your repository:

1. Add **Directory Mount** for content:
   - Source: `/data/coolify/applications/{app-id}/content`
   - Destination: `/app/content`

2. Add **Directory Mount** for private:
   - Source: `/data/coolify/applications/{app-id}/private`
   - Destination: `/app/private`

3. Copy content to server after first deploy:
   ```bash
   ssh user@your-server
   cd /data/coolify/applications/{app-id}/
   # Upload your content here
   ```

---

## Step 7: Deploy

### 7.1 Initial Deployment

Click **Deploy** in Coolify.

### 7.2 Expected Timeline

| Phase | Duration | Notes |
|-------|----------|-------|
| Clone repository | 10-30s | Depends on repo size |
| Install dependencies | 1-5 min | First deploy is slowest |
| Build client | 15-30s | Vite builds frontend |
| Build server | 60-120s | Nitro builds backend |
| Start container | 10-30s | |
| Health check passes | 30-60s | After start period |
| **Total** | **3-8 minutes** | First deploy |

### 7.3 Watching the Build

If Coolify UI shows **504 Gateway Timeout**:
- This is normal - the UI timed out, but **build continues in background**
- Wait a few minutes and refresh
- Check via SSH: `docker ps -a` and `docker logs -f <container_id>`

---

## Step 8: Verify Deployment

### 8.1 Check Application Status

In Coolify, your application should show:
- Status: **Running**
- Health: **Healthy**

### 8.2 Test Your Site

Visit your domain and verify:
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Content renders correctly
- [ ] Theme toggle works
- [ ] Search works (⌘K)

### 8.3 Test API Endpoints

```bash
# Health check
curl https://your-domain.com/

# LLM endpoint
curl https://your-domain.com/llms.txt

# Navigation API
curl https://your-domain.com/api/navigation
```

---

## Troubleshooting

### Build Fails During "transforming..."

**Cause**: Out of memory

**Solution**:
1. Add swap space (see Step 1.2)
2. Reduce concurrent builds to 1 (see Step 2.1)
3. Clear Docker cache: `docker builder prune -af`

### Container Starts Then Immediately Stops

**Cause**: Health check misconfiguration

**Solution**:
1. Verify Port is `3000` (not 80)
2. Verify Scheme is `http` (not https)
3. Increase Start Period to `60` or higher
4. Check container logs: `docker logs <container_id>`

### "Custom healthcheck found in Dockerfile" Error

**Cause**: Conflicting HEALTHCHECK instructions

**Solution**:
1. Remove or comment out any HEALTHCHECK in your Dockerfile
2. Use Coolify's built-in health check configuration instead

### npm Install Takes Forever (10+ minutes)

**Cause**: Low memory causing swap thrashing

**Solution**:
1. Add more swap space
2. Upgrade server RAM
3. Pre-build locally as workaround (see Appendix A)

### 504 Gateway Timeout in Coolify UI

**Cause**: UI timeout (build still running)

**Solution**:
1. Wait 5-10 minutes
2. Refresh Coolify page
3. Check build status via SSH: `docker ps -a`

---

## Appendix A: Pre-build Locally (Low-Memory Workaround)

If your server cannot handle the build, build locally and deploy the output:

### 1. Build Locally

```bash
# On your local machine
npm run build
```

### 2. Commit Build Output

```bash
git add -f .output/
git commit -m "Pre-built for deployment"
git push
```

### 3. Use Simplified Dockerfile

Create `Dockerfile.prebuild`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy pre-built output
COPY .output .output
COPY content content
COPY private private

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

Update Coolify to use this Dockerfile.

---

## Appendix B: Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                 f0 COOLIFY DEPLOYMENT                       │
├─────────────────────────────────────────────────────────────┤
│ BEFORE DEPLOY                                               │
│   □ Server has 1GB+ RAM (or 2GB swap added)                │
│   □ Concurrent builds set to 1                              │
│   □ Docker cache cleared                                    │
├─────────────────────────────────────────────────────────────┤
│ HEALTH CHECK SETTINGS (Critical!)                           │
│   □ Scheme: http (NOT https)                               │
│   □ Port: 3000 (NOT 80)                                    │
│   □ Start Period: 60+ seconds                              │
│   □ Enable Healthcheck: ON                                 │
├─────────────────────────────────────────────────────────────┤
│ ENVIRONMENT VARIABLES                                       │
│   □ AUTH_MODE=public                                       │
│   □ NUXT_PUBLIC_SITE_NAME=Your Site                        │
├─────────────────────────────────────────────────────────────┤
│ AFTER DEPLOY                                                │
│   □ Status shows "Running"                                 │
│   □ Health shows "Healthy"                                 │
│   □ Site loads correctly                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Appendix C: Dockerfile Reference

The default Dockerfile included with f0:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", ".output/server/index.mjs"]
```

> **Note**: No HEALTHCHECK instruction - use Coolify's built-in health check instead.

---

## Version History

| Date | Changes |
|------|---------|
| 2026-02-07 | Initial guide based on deployment troubleshooting |
