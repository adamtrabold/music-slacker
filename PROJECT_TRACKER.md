# Music Slacker Bot - Project Tracker

## Overview
Building a Slack bot that automatically finds and posts music links across all streaming services (Spotify, Apple Music, Tidal, Qobuz, YouTube Music, Bandcamp) in a threaded reply when someone shares a music link.

**Tech Stack:** Node.js/TypeScript, Vercel Serverless Functions, Songlink API, Search URL Generation, Slack Events API

---

## Implementation Checklist

### Phase 1: Project Setup
- [x] Initialize Node.js project with package.json
- [x] Install dependencies (@slack/web-api, @slack/bolt, axios, typescript)
- [x] Create TypeScript configuration (tsconfig.json)
- [x] Create environment variable template (.env.example)
- [x] Create .gitignore file
- [x] Create Vercel configuration (vercel.json)

### Phase 2: Documentation
- [x] Create Slack app setup guide (docs/slack-setup.md)
- [x] Document required Slack scopes and permissions
- [x] Document Event Subscriptions setup
- [x] Write comprehensive README.md
- [x] Add deployment instructions
- [x] Add troubleshooting guide
- [x] Create QUICKSTART.md for rapid deployment

### Phase 3: Core Services
- [x] Build music link detector (src/services/musicLinkDetector.ts)
  - [x] Spotify URL regex
  - [x] Apple Music URL regex
  - [x] Tidal URL regex
  - [x] Qobuz URL regex
  - [x] YouTube Music URL regex
  - [x] Bandcamp URL regex
  - [x] Extract first music link function
  - [x] Identify service function
  
- [x] Build Songlink API client (src/services/songlinkClient.ts)
  - [x] API request function
  - [x] Response parser with metadata extraction
  - [x] Error handling
  - [x] Rate limit handling
  
- [x] Build search URL generator (src/services/searchUrlGenerator.ts)
  - [x] Qobuz search URL generation (ISRC-based)
  - [x] Bandcamp search URL generation (artist+title)
  - [x] Metadata sanitization
  - [x] URL encoding
  
- [x] Build Slack client (src/services/slackClient.ts)
  - [x] Initialize Web API client
  - [x] Post threaded reply function
  - [x] Error handling

### Phase 4: Utilities
- [x] Create message formatter (src/utils/messageFormatter.ts)
  - [x] Build link list (exclude original service)
  - [x] Format Slack markdown links
  - [x] Handle partial results
  - [x] Generate "not found" message

### Phase 5: Main Handler
- [x] Build Vercel serverless function (api/slack-events.ts)
  - [x] Verify Slack request signatures
  - [x] Handle URL verification challenge
  - [x] Process message events
  - [x] Detect music links
  - [x] Call Songlink API
  - [x] Generate search URLs for Qobuz/Bandcamp
  - [x] Merge Songlink and search URL results
  - [x] Format and post reply
  - [x] Error handling and logging

### Phase 6: Testing & Deployment
- [x] Test locally with ngrok
- [x] Test music link detection for all services
- [x] Test Songlink API integration
- [x] Test Slack threaded replies
- [x] Test edge cases (no matches, partial matches)
- [ ] Deploy to Vercel
- [ ] Configure Slack app with production URL
- [ ] Test in live Slack channel (production)
- [ ] Monitor for errors

---

## Testing Checklist

### Functional Tests
- [x] Bot detects Spotify links
- [x] Bot detects Apple Music links
- [x] Bot detects Tidal links
- [x] Bot detects Qobuz links
- [x] Bot detects YouTube Music links
- [x] Bot detects Bandcamp links
- [x] Bot excludes original service from reply
- [x] Bot posts threaded reply (not channel message)
- [x] Bot handles partial results correctly
- [x] Bot handles no results gracefully

### Edge Cases
- [x] Multiple links in one message (processes first only)
- [x] Bot ignores its own messages
- [x] Bot handles invalid/broken music links
- [x] Bot handles Songlink API errors
- [x] Bot handles Slack API errors
- [x] Bot works in public channels
- [ ] Bot works in private channels (if invited)

---

## Configuration Required

### Slack App Setup
- [x] Create Slack App at api.slack.com/apps
- [x] Add Bot Token Scopes:
  - [x] chat:write
  - [x] reactions:read
  - [x] channels:history
  - [x] groups:history
- [x] Subscribe to Events:
  - [x] message.channels
  - [x] message.groups
- [x] Set Request URL (ngrok URL for local testing)
- [x] Install app to workspace
- [x] Copy Bot Token to .env
- [x] Copy Signing Secret to .env

### Vercel Setup
- [x] Install Vercel CLI (`npm i -g vercel`)
- [x] Create Vercel account
- [ ] Link project to Vercel
- [ ] Set environment variables in Vercel dashboard
- [ ] Deploy to production

---

## Progress Tracking

**Started:** December 4, 2025  
**Current Phase:** Local Testing Complete - Ready for Production  
**Completion:** 10/10 major tasks ✓

### Completed Tasks

- [x] Phase 1: Project Setup - Dec 4, 2025
- [x] Phase 2: Documentation - Dec 4, 2025
- [x] Phase 3: Core Services - Dec 4, 2025
- [x] Phase 4: Utilities - Dec 4, 2025
- [x] Phase 5: Main Handler - Dec 4, 2025
- [x] Phase 6: Testing & Deployment - Local testing complete Dec 4, 2025
  - Production deployment pending

---

## Notes & Issues

### Testing Results (Dec 4, 2025)
- ✅ **Local Testing with ngrok:** Successful
- ✅ **Apple Music Links:** Tested and working perfectly
- ✅ **Threaded Replies:** Working as expected
- ✅ **Cross-platform Links:** Songlink API returning links for most services
- ✅ **Search URL Generation:** Qobuz and Bandcamp search links working
- ✅ **Error Handling:** Gracefully handles API timeouts and errors

### Known Issues
- Slack signature verification doesn't work with ngrok (bypassed in dev mode)
- Initial Songlink API timeout was too short (fixed: 8s → 15s)
- URL extraction was capturing Slack's trailing `>` (fixed)
- Qobuz and Bandcamp: Search URLs instead of direct links (by design - API limitation)

### Resolved Issues
- ✅ URL extraction now removes trailing `>` from Slack-wrapped URLs
- ✅ Increased API timeout for better reliability
- ✅ Added development mode for local testing

### Future Enhancements
- **Musicfetch API Integration** (Priority: Medium)
  - Replace search URLs with direct Qobuz/Bandcamp links
  - Paid service but provides better user experience
  - Cost: Subscription-based pricing
  - Implementation: Swap searchUrlGenerator calls with Musicfetch API
  
- Support for Deezer, SoundCloud (already in Songlink)
- Allow users to configure which services they want
- Analytics on which services are most popular
- Support for multiple links in one message
- Admin commands to enable/disable bot per channel

---

## Resources

- [Slack API Documentation](https://api.slack.com/)
- [Songlink/Odesli API](https://www.notion.so/API-d0ebe08a5e304a55928405eb682f6741)
- [Vercel Functions Documentation](https://vercel.com/docs/functions)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

