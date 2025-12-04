# Music Slacker Bot - Project Tracker

## Overview
Building a Slack bot that automatically finds and posts music links across all streaming services (Spotify, Apple Music, Tidal, Qobuz) in a threaded reply when someone shares a music link.

**Tech Stack:** Node.js/TypeScript, Vercel Serverless Functions, Songlink API, Slack Events API

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
  - [x] Extract first music link function
  - [x] Identify service function
  
- [x] Build Songlink API client (src/services/songlinkClient.ts)
  - [x] API request function
  - [x] Response parser
  - [x] Error handling
  - [x] Rate limit handling
  
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
  - [x] Format and post reply
  - [x] Error handling and logging

### Phase 6: Testing & Deployment
- [ ] Test locally with ngrok
- [ ] Test music link detection for all services
- [ ] Test Songlink API integration
- [ ] Test Slack threaded replies
- [ ] Test edge cases (no matches, partial matches)
- [ ] Deploy to Vercel
- [ ] Configure Slack app with production URL
- [ ] Test in live Slack channel
- [ ] Monitor for errors

---

## Testing Checklist

### Functional Tests
- [ ] Bot detects Spotify links
- [ ] Bot detects Apple Music links
- [ ] Bot detects Tidal links
- [ ] Bot detects Qobuz links
- [ ] Bot excludes original service from reply
- [ ] Bot posts threaded reply (not channel message)
- [ ] Bot handles partial results correctly
- [ ] Bot handles no results gracefully

### Edge Cases
- [ ] Multiple links in one message (processes first only)
- [ ] Bot ignores its own messages
- [ ] Bot handles invalid/broken music links
- [ ] Bot handles Songlink API errors
- [ ] Bot handles Slack API errors
- [ ] Bot works in public channels
- [ ] Bot works in private channels (if invited)

---

## Configuration Required

### Slack App Setup
- [ ] Create Slack App at api.slack.com/apps
- [ ] Add Bot Token Scopes:
  - [ ] chat:write
  - [ ] reactions:read
  - [ ] channels:history
  - [ ] groups:history
- [ ] Subscribe to Events:
  - [ ] message.channels
  - [ ] message.groups
- [ ] Set Request URL (Vercel function URL)
- [ ] Install app to workspace
- [ ] Copy Bot Token to .env
- [ ] Copy Signing Secret to .env

### Vercel Setup
- [ ] Install Vercel CLI (`npm i -g vercel`)
- [ ] Create Vercel account
- [ ] Link project to Vercel
- [ ] Set environment variables in Vercel dashboard
- [ ] Deploy to production

---

## Progress Tracking

**Started:** December 4, 2025  
**Current Phase:** Ready for Deployment  
**Completion:** 10/10 major tasks ✓

### Completed Tasks

- [x] Phase 1: Project Setup - Dec 4, 2025
- [x] Phase 2: Documentation - Dec 4, 2025
- [x] Phase 3: Core Services - Dec 4, 2025
- [x] Phase 4: Utilities - Dec 4, 2025
- [x] Phase 5: Main Handler - Dec 4, 2025
- [ ] Phase 6: Testing & Deployment - Pending user action

---

## Notes & Issues

### Known Issues
_(Track bugs and issues here)_

### Future Enhancements
- Support for YouTube Music, Deezer, SoundCloud
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

