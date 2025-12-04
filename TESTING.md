# Testing Guide for Music Slacker Bot

## Pre-Deployment Testing (Local with ngrok)

### Setup Local Testing Environment

1. Install ngrok:
```bash
npm install -g ngrok
```

2. Start local dev server:
```bash
npm run dev
```

3. In another terminal, start ngrok:
```bash
ngrok http 3000
```

4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

5. Update Slack Event Subscriptions Request URL:
   - Go to your Slack App settings
   - Navigate to Event Subscriptions
   - Update Request URL to: `https://abc123.ngrok.io/api/slack-events`
   - Wait for verification checkmark

### Test Cases

#### Test 1: Spotify Link Detection
**Input:** Post this in Slack channel:
```
https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp
```

**Expected:**
- Bot posts threaded reply
- Reply contains: Apple Music, Tidal, Qobuz links
- Reply DOES NOT contain Spotify (original service)

---

#### Test 2: Apple Music Link Detection
**Input:**
```
https://music.apple.com/us/album/mr-brightside/1440650428?i=1440650685
```

**Expected:**
- Bot posts threaded reply
- Reply contains: Spotify, Tidal, Qobuz links
- Reply DOES NOT contain Apple Music

---

#### Test 3: Tidal Link Detection
**Input:**
```
https://tidal.com/browse/track/25472499
```

**Expected:**
- Bot posts threaded reply
- Reply contains: Spotify, Apple Music, Qobuz links
- Reply DOES NOT contain Tidal

---

#### Test 4: Qobuz Link Detection
**Input:**
```
https://open.qobuz.com/album/0060253736107
```

**Expected:**
- Bot posts threaded reply
- Reply contains: Spotify, Apple Music, Tidal, YouTube Music links
- Reply DOES NOT contain Qobuz

---

#### Test 5: YouTube Music Link Detection
**Input:**
```
https://music.youtube.com/watch?v=rfUYuIVaZjY
```

**Expected:**
- Bot posts threaded reply
- Reply contains: Spotify, Apple Music, Tidal, Qobuz, Bandcamp links
- Reply DOES NOT contain YouTube Music

---

#### Test 6: Bandcamp Link Detection
**Input:**
```
https://artistname.bandcamp.com/album/album-name
```

**Expected:**
- Bot posts threaded reply
- Reply contains: Spotify, Apple Music, Tidal, Qobuz, YouTube Music links
- Reply DOES NOT contain Bandcamp

---

#### Test 7: Message with Text and Link
**Input:**
```
Check out this awesome track! https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp
Really loving it!
```

**Expected:**
- Bot still detects and processes the link
- Reply works as expected

---

#### Test 8: Multiple Links (First Link Processing)
**Input:**
```
https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp
https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
```

**Expected:**
- Bot processes ONLY the first link
- Only one threaded reply posted

---

#### Test 9: Non-Music Link (Should Ignore)
**Input:**
```
Check out this website: https://google.com
```

**Expected:**
- Bot does NOT respond
- No threaded reply

---

#### Test 10: Track Not Available on All Services
**Input:** Find an obscure track only on one service (if possible)
```
[Obscure track link]
```

**Expected:**
- Bot posts available links
- Shows message: "_Could not find this on: [missing services]_"

---

#### Test 11: Invalid/Broken Music Link
**Input:**
```
https://open.spotify.com/track/invalidtrackid123456789
```

**Expected:**
- Bot either posts error message in thread, OR
- Bot doesn't respond (fails gracefully)
- Check Vercel logs for error handling

---

#### Test 12: Bot Doesn't Reply to Itself
**Input:**
- Let bot post a reply with music links
- Observe if bot tries to process its own links

**Expected:**
- Bot should NOT respond to its own messages
- No infinite loop

---

## Post-Deployment Testing (Vercel Production)

After deploying to Vercel, repeat all the above tests to ensure:

1. Environment variables are set correctly in Vercel
2. Slack Event Subscriptions URL points to production
3. Bot works identically in production

## Monitoring

### Check Vercel Logs
```bash
vercel logs
```

Look for:
- Successful event processing
- Music link detection
- Songlink API responses
- Any errors or warnings

### Check Slack App Logs
1. Go to api.slack.com/apps/YOUR_APP_ID
2. Navigate to "Event Subscriptions"
3. View "Recent Events" to see incoming events

## Performance Testing

### Response Time
- Bot should respond within 5-10 seconds
- Songlink API typically responds in 1-2 seconds
- Slack posting adds 1-2 seconds

### Rate Limiting
- Songlink free tier: 10 requests/second
- For shared channels with heavy traffic, monitor for rate limit errors

## Edge Cases to Test

- [ ] Empty messages
- [ ] Messages with only whitespace
- [ ] Very long messages with music link buried in text
- [ ] Music links with query parameters
- [ ] Shortened URLs (bit.ly, etc.) - may not work, that's OK
- [ ] Bot in multiple channels simultaneously
- [ ] Multiple people posting links at same time

## Troubleshooting Test Failures

### Bot doesn't respond at all
1. Check Vercel logs for errors
2. Verify Slack Event Subscriptions URL is correct and verified
3. Ensure bot is invited to channel: `/invite @Music Slacker`
4. Check environment variables in Vercel

### "Invalid signature" errors
1. Verify `SLACK_SIGNING_SECRET` in Vercel matches Slack App
2. Redeploy: `vercel --prod`

### Bot responds but with errors
1. Check Vercel logs for specific error
2. Test Songlink API manually:
   ```bash
   curl "https://api.song.link/v1-alpha.1/links?url=https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp"
   ```
3. Verify `SLACK_BOT_TOKEN` is correct

### Links not unfurling in Slack
- This is normal - Slack unfurls links based on user interaction
- The important part is that links are clickable

## Success Criteria

✅ Bot detects all 6 music services correctly (Spotify, Apple Music, Tidal, Qobuz, YouTube Music, Bandcamp)  
✅ Bot posts threaded replies (not channel messages)  
✅ Bot excludes original service from reply  
✅ Bot handles partial results gracefully  
✅ Bot ignores non-music messages  
✅ Bot doesn't respond to its own messages  
✅ No errors in Vercel logs for normal operations  
✅ Response time < 10 seconds  

## Reporting Issues

If you find bugs:
1. Note exact input that caused the issue
2. Copy error from Vercel logs
3. Check Slack Event Subscriptions for failed requests
4. Document expected vs actual behavior

---

**Ready to test! Start with Tests 1-6 to verify basic functionality.** 🧪

