# Music Slacker - Deployment Checklist

## ✅ Step-by-Step Deployment Guide

### Step 1: Create Slack App ⏱️ 10 minutes

1. Go to https://api.slack.com/apps
2. Click **"Create New App"** → **"From scratch"**
3. App Name: `Music Slacker` (or whatever you want)
4. Choose your workspace
5. Click **"Create App"**

**Status:** [ ] Complete

---

### Step 2: Configure OAuth Scopes ⏱️ 2 minutes

1. In your app settings, click **"OAuth & Permissions"** (left sidebar)
2. Scroll to **"Bot Token Scopes"**
3. Click **"Add an OAuth Scope"** and add these three:
   - ✅ `chat:write`
   - ✅ `channels:history`
   - ✅ `groups:history`

**Status:** [ ] Complete

---

### Step 3: Install App to Workspace ⏱️ 1 minute

1. Still on the OAuth & Permissions page
2. Scroll to top and click **"Install to Workspace"**
3. Click **"Allow"**
4. **COPY YOUR BOT TOKEN** (starts with `xoxb-`)
   - Paste it somewhere safe - you'll need it in Step 6

**Bot Token:** `xoxb-_________________________________`

**Status:** [ ] Complete

---

### Step 4: Get Signing Secret ⏱️ 1 minute

1. Click **"Basic Information"** (left sidebar)
2. Scroll to **"App Credentials"**
3. Find **"Signing Secret"**
4. Click **"Show"** and **COPY IT**
   - Paste it somewhere safe - you'll need it in Step 6

**Signing Secret:** `________________________________`

**Status:** [ ] Complete

---

### Step 5: Deploy to Vercel ⏱️ 5 minutes

Open your terminal:

```bash
cd "/Users/adam.trabold/Cursor Projects/Music Slacker"

# Install dependencies
npm install

# Deploy to Vercel
vercel --prod
```

When prompted:
- Set up and deploy? **Y**
- Which scope? **(your choice)**
- Link to existing project? **N**
- Project name? **music-slacker** (or press Enter)
- Directory? **. (press Enter)**
- Override settings? **N**

**Your Vercel URL:** `https://_____________________.vercel.app`

**Status:** [ ] Complete

---

### Step 6: Add Environment Variables to Vercel ⏱️ 2 minutes

In your terminal (same location):

```bash
# Add your Slack Bot Token
vercel env add SLACK_BOT_TOKEN production

# When prompted, paste your bot token from Step 3

# Add your Signing Secret
vercel env add SLACK_SIGNING_SECRET production

# When prompted, paste your signing secret from Step 4
```

**Redeploy with the environment variables:**
```bash
vercel --prod
```

**Status:** [ ] Complete

---

### Step 7: Configure Slack Event Subscriptions ⏱️ 3 minutes

Back to https://api.slack.com/apps → Your App

1. Click **"Event Subscriptions"** (left sidebar)
2. Toggle **"Enable Events"** to **ON**
3. In **"Request URL"** field, paste:
   ```
   https://YOUR-VERCEL-URL.vercel.app/api/slack-events
   ```
   (Replace with your actual Vercel URL from Step 5)

4. Wait for the **green checkmark ✓ Verified**

5. Scroll to **"Subscribe to bot events"**
6. Click **"Add Bot User Event"** and add:
   - ✅ `message.channels`
   - ✅ `message.groups`

7. Click **"Save Changes"** (bottom right)

**Status:** [ ] Complete

---

### Step 8: Invite Bot to Channel ⏱️ 1 minute

1. Go to your Slack workspace
2. Open the channel where you want the bot
3. Type: `/invite @Music Slacker`
4. Press Enter

**Status:** [ ] Complete

---

### Step 9: Test It! ⏱️ 1 minute

In your Slack channel, post a music link:

```
https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp
```

**Expected Result:**
- Bot replies in a thread within ~5 seconds
- Thread contains links to other services
- Original service (Spotify) is NOT in the reply

**Status:** [ ] Complete

---

## 🎉 Success Criteria

- [ ] Bot responds to music links
- [ ] Reply is in a thread (not channel message)
- [ ] Links to all other services are included
- [ ] Original service is excluded
- [ ] All 6 services work (Spotify, Apple Music, Tidal, Qobuz, YouTube Music, Bandcamp)

---

## 🆘 Troubleshooting

### Bot doesn't respond
```bash
# Check Vercel logs
vercel logs --prod
```

Look for errors. Common issues:
- Environment variables not set correctly
- Event Subscriptions URL not verified
- Bot not invited to channel

### "Verification failed" on Event Subscriptions
- Make sure you deployed to Vercel first
- Make sure URL is exactly: `https://your-url.vercel.app/api/slack-events`
- Check Vercel logs for errors

### Environment variable issues
```bash
# List current env vars
vercel env ls

# Remove and re-add if needed
vercel env rm SLACK_BOT_TOKEN production
vercel env add SLACK_BOT_TOKEN production
```

---

## 📝 Quick Reference

**Your URLs:**
- Slack App: https://api.slack.com/apps/YOUR_APP_ID
- GitHub Repo: https://github.com/adamtrabold/music-slacker
- Vercel Project: https://vercel.com/dashboard

**Total Time:** ~25 minutes

**You're ready to rock!** 🎸

