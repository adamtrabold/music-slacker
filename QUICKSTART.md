# Quick Start Guide

This is a condensed guide to get Music Slacker up and running quickly.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Vercel account created ([vercel.com](https://vercel.com))
- [ ] Access to install Slack apps in your workspace

## Setup Steps (15 minutes)

### 1. Install Dependencies (2 min)

```bash
npm install
```

### 2. Create Slack App (5 min)

Go to [api.slack.com/apps](https://api.slack.com/apps) and click **Create New App** > **From scratch**

**App Name:** `Music Slacker`  
**Workspace:** Your workspace

#### Add OAuth Scopes
Navigate to **OAuth & Permissions** > **Bot Token Scopes** and add:
- `chat:write`
- `channels:history`
- `groups:history`

Click **Install to Workspace** and copy the **Bot User OAuth Token** (starts with `xoxb-`)

#### Get Signing Secret
Navigate to **Basic Information** > **App Credentials** and copy the **Signing Secret**

### 3. Configure Environment (1 min)

```bash
cp .env.example .env
```

Edit `.env`:
```
SLACK_BOT_TOKEN=xoxb-your-actual-token
SLACK_SIGNING_SECRET=your-actual-secret
```

### 4. Deploy to Vercel (3 min)

```bash
npm install -g vercel
vercel --prod
```

Copy the deployment URL (e.g., `https://music-slacker.vercel.app`)

Add environment variables in Vercel:
```bash
vercel env add SLACK_BOT_TOKEN
vercel env add SLACK_SIGNING_SECRET
```

Redeploy:
```bash
vercel --prod
```

### 5. Configure Slack Events (2 min)

Back in your Slack App settings:

1. Navigate to **Event Subscriptions**
2. Toggle **Enable Events** to ON
3. **Request URL:** `https://your-vercel-url.vercel.app/api/slack-events`
4. Under **Subscribe to bot events**, add:
   - `message.channels`
   - `message.groups`
5. **Save Changes**

### 6. Test It! (2 min)

In your Slack channel:
```
/invite @Music Slacker
```

Post a music link:
```
https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp
```

The bot should reply in a thread with links to other services! 🎉

**Supported Services:**
- Spotify
- Apple Music
- Tidal
- Qobuz
- YouTube Music
- Bandcamp

## Troubleshooting

**Bot doesn't respond?**
- Check Vercel logs: `vercel logs`
- Verify bot is invited: `/invite @Music Slacker`
- Check Event Subscriptions shows green checkmark

**"Invalid signature" error?**
- Verify `SLACK_SIGNING_SECRET` is correct in Vercel
- Redeploy: `vercel --prod`

**Need help?**
- Full documentation: [README.md](README.md)
- Slack setup details: [docs/slack-setup.md](docs/slack-setup.md)
- Project tracker: [PROJECT_TRACKER.md](PROJECT_TRACKER.md)

