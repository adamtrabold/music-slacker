# Local Testing Guide

## Overview

Test your bot locally before deploying to Vercel. This allows faster iteration and easier debugging.

## Prerequisites

- Node.js installed ✅ (you have this)
- Slack workspace access ✅ (you have this)
- ngrok (we'll install)

## Step-by-Step Local Testing

### Step 1: Install Dependencies

```bash
cd "/Users/adam.trabold/Cursor Projects/Music Slacker"
npm install
```

### Step 2: Install ngrok

ngrok creates a temporary public URL that forwards to your local server.

```bash
# Install ngrok
brew install ngrok

# Or download from: https://ngrok.com/download
```

### Step 3: Create Local Environment File

Create a `.env` file (this is gitignored, so it's safe):

```bash
cp .env.example .env
```

Then edit `.env` and add placeholder values for now:
```
SLACK_BOT_TOKEN=xoxb-will-add-after-creating-app
SLACK_SIGNING_SECRET=will-add-after-creating-app
```

### Step 4: Set Up Slack App (Same as Production)

1. Go to https://api.slack.com/apps
2. Create new app "Music Slacker (Test)" 
3. Add OAuth scopes: `chat:write`, `channels:history`, `groups:history`
4. Install to workspace
5. **Copy Bot Token** → paste into `.env` as `SLACK_BOT_TOKEN`
6. Go to Basic Information → **Copy Signing Secret** → paste into `.env` as `SLACK_SIGNING_SECRET`

### Step 5: Start Local Server

In one terminal window:

```bash
cd "/Users/adam.trabold/Cursor Projects/Music Slacker"
npm run dev
```

You should see:
```
> Dev server running
```

**Keep this terminal open!**

### Step 6: Start ngrok Tunnel

In a **new terminal window**:

```bash
ngrok http 3000
```

You'll see something like:
```
Forwarding  https://abc123def456.ngrok.io -> http://localhost:3000
```

**Copy the https:// URL** - this is your temporary public URL.

**Keep this terminal open too!**

### Step 7: Configure Slack Event Subscriptions

1. Go to your Slack app: https://api.slack.com/apps
2. Click **"Event Subscriptions"**
3. Toggle **"Enable Events"** to ON
4. In **"Request URL"**, paste:
   ```
   https://YOUR-NGROK-URL.ngrok.io/api/slack-events
   ```
   
5. Wait for **green checkmark ✓**
6. Subscribe to bot events:
   - `message.channels`
   - `message.groups`
7. Click **"Save Changes"**

### Step 8: Invite Bot and Test

1. In Slack: `/invite @Music Slacker (Test)`
2. Post a music link:
   ```
   https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp
   ```

### Step 9: Watch the Logs!

In your first terminal (where `npm run dev` is running), you'll see:
- Incoming requests from Slack
- Music link detection
- Songlink API calls
- Any errors

This is **much better for debugging** than Vercel logs!

## Testing Workflow

```
┌─────────────────────┐
│  Change Code        │
│                     │
│  Server auto-reloads│  (thanks to npm run dev)
│                     │
│  Test in Slack      │
│                     │
│  Check terminal     │
│  for logs           │
│                     │
│  Repeat! 🔄         │
└─────────────────────┘
```

## What You Can Test Locally

✅ Music link detection (all 6 services)
✅ Songlink API integration
✅ Slack message formatting
✅ Error handling
✅ Threaded replies
✅ Service exclusion logic
✅ Partial results handling

## Advantages of Local Testing

1. **See logs in real-time** - no need to check Vercel logs
2. **Faster iteration** - just save file, server reloads
3. **Easy debugging** - add `console.log()` anywhere
4. **Test with real Slack** - not just unit tests
5. **Free** - no Vercel deployment needed yet

## Common Issues

### ngrok URL expired
ngrok free tier gives you a new URL each time. If it changes:
1. Copy new ngrok URL
2. Update Slack Event Subscriptions Request URL
3. Wait for verification ✓

### Port 3000 already in use
```bash
# Find what's using port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)

# Or use a different port
PORT=3001 npm run dev
# Then: ngrok http 3001
```

### Bot not responding
1. Check terminal logs for errors
2. Verify ngrok is running
3. Verify Event Subscriptions is verified ✓
4. Verify bot is invited to channel

### "Invalid signature" error
- Make sure `.env` has correct `SLACK_SIGNING_SECRET`
- Restart dev server after changing `.env`

## When You're Ready for Production

Once everything works locally:

1. Stop ngrok (Ctrl+C)
2. Deploy to Vercel: `vercel --prod`
3. Update Slack Event Subscriptions URL to Vercel URL
4. Done! 🎉

## Testing Checklist

- [ ] Dev server running (`npm run dev`)
- [ ] ngrok running and URL copied
- [ ] `.env` file has real tokens
- [ ] Slack Event Subscriptions verified ✓
- [ ] Bot invited to test channel
- [ ] Spotify link works
- [ ] Apple Music link works
- [ ] Tidal link works
- [ ] Qobuz link works
- [ ] YouTube Music link works
- [ ] Bandcamp link works
- [ ] Bot excludes original service
- [ ] Replies are threaded
- [ ] Partial results work
- [ ] Error handling works

---

**Tip:** Keep the ngrok terminal visible so you can see when requests come in!

