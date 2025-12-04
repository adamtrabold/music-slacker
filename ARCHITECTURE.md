# Music Slacker Bot - Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Slack Workspace                          │
│                                                                   │
│  User posts music link ──────────────────────────────────┐      │
│  (Spotify/Apple Music/Tidal/Qobuz)                       │      │
└───────────────────────────────────────────────────────────┼──────┘
                                                            │
                                                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Slack Events API                            │
│                                                                   │
│  • Captures message.channels events                              │
│  • Sends webhook to configured URL                               │
└───────────────────────────────────────────────────────────┬──────┘
                                                            │
                                                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Vercel Serverless Function                     │
│                   (api/slack-events.ts)                          │
│                                                                   │
│  1. Verify Slack signature (security)                            │
│  2. Handle URL verification challenge                            │
│  3. Process message event                                        │
│  4. Detect music links ──────────────────┐                       │
└───────────────────────────────────────────┼──────────────────────┘
                                            │
                ┌───────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│              src/services/musicLinkDetector.ts                   │
│                                                                   │
│  • Regex patterns for each service                               │
│  • Extract first music link                                      │
│  • Identify which service (Spotify/Apple/Tidal/Qobuz)           │
└───────────────────────────────────────────┬──────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────┐
│               src/services/songlinkClient.ts                     │
│                                                                   │
│  Call Songlink/Odesli API:                                       │
│  GET https://api.song.link/v1-alpha.1/links?url={musicUrl}      │
└───────────────────────────────────────────┬──────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Songlink/Odesli API                           │
│                                                                   │
│  Returns cross-platform links:                                   │
│  {                                                                │
│    spotify: "https://open.spotify.com/...",                      │
│    appleMusic: "https://music.apple.com/...",                    │
│    tidal: "https://tidal.com/...",                               │
│    qobuz: "https://open.qobuz.com/..."                           │
│  }                                                                │
└───────────────────────────────────────────┬──────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              src/utils/messageFormatter.ts                       │
│                                                                   │
│  • Filter out original service                                   │
│  • Format Slack markdown links                                   │
│  • Handle missing services                                       │
│  • Generate: "Also stream this on: [Service](url) | ..."        │
└───────────────────────────────────────────┬──────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────┐
│               src/services/slackClient.ts                        │
│                                                                   │
│  Post threaded reply via Slack Web API:                          │
│  chat.postMessage({                                              │
│    channel: channel_id,                                          │
│    thread_ts: original_message_timestamp,                        │
│    text: formatted_message                                       │
│  })                                                               │
└───────────────────────────────────────────┬──────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Slack Web API                               │
│                                                                   │
│  Posts threaded reply to original message                        │
└───────────────────────────────────────────┬──────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Slack Workspace                             │
│                                                                   │
│  User sees threaded reply with all streaming service links!     │
│  "Also stream this on: Apple Music | Spotify | Tidal"          │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Example

### Scenario: User posts Spotify link

```
INPUT:
  User: "Check this out! https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp"

STEP 1: Slack Events API
  Event type: message.channels
  Event data: { text: "Check this out! https://...", channel: "C123", ts: "1234.56" }

STEP 2: Vercel Function
  Verify signature: ✓
  Extract link: "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp"
  Identify service: "Spotify"

STEP 3: Songlink API
  Request: GET https://api.song.link/v1-alpha.1/links?url=https://open.spotify...
  Response: {
    spotify: "https://open.spotify.com/track/...",
    appleMusic: "https://music.apple.com/us/album/...",
    tidal: "https://tidal.com/browse/track/...",
    qobuz: "https://open.qobuz.com/album/..."
  }

STEP 4: Message Formatter
  Original service: "Spotify"
  Available services: ["Apple Music", "Tidal", "Qobuz"]
  Formatted message: "Also stream this on: <apple_url|Apple Music> | <tidal_url|Tidal> | <qobuz_url|Qobuz>"

STEP 5: Slack Web API
  Post threaded reply to message "1234.56" in channel "C123"

OUTPUT:
  Bot reply in thread:
  "Also stream this on: Apple Music | Tidal | Qobuz"
  (each is a clickable link)
```

## Component Responsibilities

### api/slack-events.ts
**Role:** Main entry point and orchestrator
- Handles HTTP requests from Slack
- Verifies request authenticity
- Coordinates between services
- Error handling and logging

### src/services/musicLinkDetector.ts
**Role:** URL detection and classification
- Regex patterns for each music service (Spotify, Apple Music, Tidal, Qobuz, YouTube Music)
- Extracts URLs from message text
- Identifies which service a URL belongs to

### src/services/songlinkClient.ts
**Role:** External API integration
- Calls Songlink/Odesli API
- Parses API responses
- Handles API errors and rate limits
- Returns normalized link data

### src/services/slackClient.ts
**Role:** Slack API wrapper
- Initializes Slack Web API client
- Posts threaded messages
- Adds reactions (for future use)
- Handles Slack API errors

### src/utils/messageFormatter.ts
**Role:** Message composition
- Filters out original service
- Formats Slack markdown
- Handles partial results
- Generates user-friendly messages

## Security Model

```
┌──────────────────────┐
│  Incoming Request    │
│  from Slack          │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Verify Request Signature            │
│                                      │
│  1. Extract X-Slack-Signature header │
│  2. Extract X-Slack-Request-Timestamp│
│  3. Compute HMAC-SHA256              │
│  4. Compare signatures               │
│  5. Check timestamp (< 5 min old)    │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────┐         ┌──────────────────────┐
│  Signature Valid     │         │  Signature Invalid   │
│  Continue Processing │         │  Return 401 Error    │
└──────────────────────┘         └──────────────────────┘
```

## Error Handling Flow

```
┌────────────────────────┐
│  Process Music Link    │
└───────────┬────────────┘
            │
            ▼
     ┌──────────────┐
     │  Try Block   │
     └──────┬───────┘
            │
    ┌───────┴───────────────────────────────┐
    │                                       │
    ▼                                       ▼
┌─────────────────┐              ┌──────────────────────┐
│  Success Path   │              │   Error Path         │
│                 │              │                      │
│  1. Get links   │              │  1. Log error        │
│  2. Format msg  │              │  2. Format error msg │
│  3. Post reply  │              │  3. Post error reply │
└─────────────────┘              └──────────────────────┘
```

## Environment Configuration

```
┌─────────────────────────────────────────────────────────┐
│                    Environment Variables                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  SLACK_BOT_TOKEN                                         │
│  ├─ Used by: slackClient.ts                             │
│  ├─ Purpose: Authenticate with Slack Web API            │
│  └─ Format: xoxb-xxxxxxxxxxxxx-xxxxxxxxxxxxx            │
│                                                          │
│  SLACK_SIGNING_SECRET                                    │
│  ├─ Used by: slack-events.ts                            │
│  ├─ Purpose: Verify requests are from Slack             │
│  └─ Format: 32-character hex string                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
│                  (source code)                           │
└───────────────────────────┬─────────────────────────────┘
                            │
                            │ git push
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Vercel Platform                       │
│                                                          │
│  1. Detect push                                          │
│  2. Install dependencies (npm install)                   │
│  3. Build TypeScript (tsc)                              │
│  4. Deploy serverless function                          │
│  5. Generate URL: https://music-slacker.vercel.app      │
└───────────────────────────┬─────────────────────────────┘
                            │
                            │ Webhook URL
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Slack App Settings                    │
│                                                          │
│  Event Subscriptions:                                    │
│  Request URL: https://music-slacker.vercel.app/api/...  │
└─────────────────────────────────────────────────────────┘
```

## Scalability

The bot is designed to scale automatically:

- **Serverless Functions:** Auto-scale based on demand
- **No State:** Each request is independent
- **Rate Limits:**
  - Songlink API: 10 req/sec (free tier)
  - Slack API: 1+ req/sec per workspace
  - Vercel: 100GB bandwidth/month (free tier)

For high-volume workspaces:
- Consider Songlink API premium tier
- Monitor Vercel usage
- Add request queuing if needed

## Monitoring Points

```
┌──────────────────────┐
│  Vercel Dashboard    │ ← Monitor function invocations, errors, duration
└──────────────────────┘

┌──────────────────────┐
│  Vercel Logs         │ ← View console.log() output, errors
│  $ vercel logs       │
└──────────────────────┘

┌──────────────────────┐
│  Slack Event Logs    │ ← View incoming events, failed deliveries
│  api.slack.com/apps  │
└──────────────────────┘
```

---

**This architecture provides a robust, scalable, and maintainable solution for cross-platform music link sharing!**

