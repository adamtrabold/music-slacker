# Music Slacker

A Slack bot that automatically finds and posts music links across all streaming services when someone shares a music link in your channel.

## What It Does

When someone posts a link to a song, album, or playlist from Spotify, Apple Music, Tidal, Qobuz, YouTube Music, or Bandcamp, the bot:

1. Detects the music link
2. Finds the same content on all other streaming services
3. Posts a threaded reply with links to all available platforms

**Example:**

Someone posts: `https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp`

Bot replies in thread:
> Also stream this on: Apple Music | Bandcamp | Qobuz | Tidal | YouTube Music
>
> (Each service name is a clickable link)

## Features

- **Automatic detection** - Works with Spotify, Apple Music, Tidal, Qobuz, YouTube Music, and Bandcamp
- **Threaded replies** - Keeps channels clean
- **Context-aware** - Excludes the original service from replies
- **Graceful handling** - Shows partial results if some services don't have the track
- **Serverless** - Runs on Vercel, no server to maintain

## Prerequisites

- Node.js 18+ and npm
- A Slack workspace where you can install apps (or admin approval)
- A Vercel account (free tier is sufficient)

## Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd music-slacker
npm install
```

### 2. Configure Slack App

Follow the detailed guide in [`docs/slack-setup.md`](docs/slack-setup.md) to:

1. Create a Slack App
2. Configure OAuth scopes
3. Enable Event Subscriptions
4. Get your Bot Token and Signing Secret

### 3. Set Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

Edit `.env` and add your Slack credentials:

```
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
```

### 4. Deploy to Vercel

Install Vercel CLI:

```bash
npm install -g vercel
```

Deploy:

```bash
vercel --prod
```

This will output a URL like: `https://music-slacker.vercel.app`

### 5. Configure Slack Event Subscriptions

1. Go to your Slack App settings at [api.slack.com/apps](https://api.slack.com/apps)
2. Navigate to **Event Subscriptions**
3. Set the **Request URL** to: `https://your-vercel-url.vercel.app/api/slack-events`
4. Slack will verify the URL (check mark should appear)
5. Save changes

### 6. Add Environment Variables to Vercel

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add:
   - `SLACK_BOT_TOKEN` = your bot token
   - `SLACK_SIGNING_SECRET` = your signing secret
4. Redeploy: `vercel --prod`

### 7. Invite Bot to Channel

In your Slack channel:

```
/invite @Music Slacker
```

## Testing

Post a music link from any supported service:

- Spotify: `https://open.spotify.com/track/...`
- Apple Music: `https://music.apple.com/us/album/...`
- Tidal: `https://tidal.com/browse/track/...`
- Qobuz: `https://open.qobuz.com/album/...`
- YouTube Music: `https://music.youtube.com/watch?v=...`
- Bandcamp: `https://artistname.bandcamp.com/album/...`

The bot should reply in a thread with links to other services!

## Local Development

For local testing with ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok
ngrok http 3000

# In another terminal, start local dev server
npm run dev
```

Update your Slack Event Subscriptions Request URL to your ngrok URL (e.g., `https://abc123.ngrok.io/api/slack-events`)

## How It Works

1. **Slack sends events** to your Vercel function when messages are posted
2. **Bot detects music links** using regex patterns for each service
3. **Songlink/Odesli API** finds the track on all platforms
4. **Bot posts threaded reply** with formatted links

## Architecture

```
Slack Channel
    ↓ (message posted)
Slack Events API
    ↓ (webhook)
Vercel Serverless Function (api/slack-events.ts)
    ↓ (music link detected)
Songlink/Odesli API
    ↓ (cross-platform links)
Slack Web API
    ↓ (post threaded reply)
Slack Channel (thread)
```

## Troubleshooting

### Bot doesn't respond

- Check Vercel logs: `vercel logs`
- Verify bot is in the channel: `/invite @Music Slacker`
- Verify Event Subscriptions URL is correct and verified
- Check that bot has correct OAuth scopes

### "Invalid signature" errors

- Verify `SLACK_SIGNING_SECRET` is correct
- Check that environment variables are set in Vercel

### "Not in channel" errors

- Invite the bot: `/invite @Music Slacker`

### Rate limiting

- Songlink API has generous limits (10 req/sec)
- If you hit limits, wait a moment and try again

### Links not found

- Some tracks may not be available on all services
- Bot will show partial results and list missing services

## Project Structure

```
music-slacker/
├── api/
│   └── slack-events.ts          # Main Vercel serverless function
├── src/
│   ├── services/
│   │   ├── musicLinkDetector.ts # Detects music service URLs
│   │   ├── songlinkClient.ts    # Fetches cross-platform links
│   │   └── slackClient.ts       # Slack Web API wrapper
│   └── utils/
│       └── messageFormatter.ts  # Formats Slack messages
├── docs/
│   └── slack-setup.md          # Slack app setup guide
├── package.json                # Dependencies
├── tsconfig.json              # TypeScript config
├── vercel.json                # Vercel configuration
└── PROJECT_TRACKER.md         # Development progress tracker
```

## Technologies

- **Node.js + TypeScript** - Core language
- **Vercel** - Serverless hosting
- **Slack Events API** - Receive messages
- **Slack Web API** - Post replies
- **Songlink/Odesli API** - Cross-platform music matching

## API Usage

### Songlink/Odesli

- **Free tier:** 10 requests/second, no API key required
- **API Docs:** [Notion API Documentation](https://www.notion.so/API-d0ebe08a5e304a55928405eb682f6741)
- **Rate limits:** Generous for personal use

## Future Enhancements

- Support for Deezer, SoundCloud
- User preferences for which services to show
- Analytics on popular tracks/services
- Handle multiple links per message
- Admin commands to control bot behavior

## Contributing

Contributions welcome! Please open an issue or PR.

## License

MIT

## Support

For issues or questions:
1. Check the [troubleshooting section](#troubleshooting)
2. Review Vercel logs: `vercel logs`
3. Check Slack app Event Subscriptions status
4. Open an issue on GitHub

---

**Enjoy seamless music sharing across all platforms!** 🎵

