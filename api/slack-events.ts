/**
 * Slack Events Handler (Vercel Serverless Function)
 * Handles incoming Slack events and processes music links
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { buffer } from 'micro';
import {
  extractMusicLink,
  identifyMusicService,
  MusicService,
} from '../src/services/musicLinkDetector';
import { getCrossPlatformLinks } from '../src/services/songlinkClient';
import {
  initializeSlackClient,
  postThreadedReply,
} from '../src/services/slackClient';
import {
  formatMusicLinksMessage,
  formatErrorMessage,
} from '../src/utils/messageFormatter';
import {
  generateSearchUrls,
  sanitizeMetadata,
} from '../src/services/searchUrlGenerator';

// Disable body parser to get raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Slack client with bot token
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN!;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET!;

if (SLACK_BOT_TOKEN) {
  initializeSlackClient(SLACK_BOT_TOKEN);
}

/**
 * Verifies that the request came from Slack
 * Using crypto.timingSafeEqual to prevent timing attacks
 */
function verifySlackRequest(
  signature: string | undefined,
  timestamp: string | undefined,
  body: string
): boolean {
  // Skip signature verification in local development
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️  Skipping signature verification (development mode)');
    return true;
  }

  if (!signature || !timestamp) {
    console.error('Missing Slack signature or timestamp headers');
    return false;
  }

  // Prevent replay attacks (request older than 5 minutes)
  const time = Math.floor(new Date().getTime() / 1000);
  if (Math.abs(time - parseInt(timestamp)) > 300) {
    console.warn('Slack request timestamp too old');
    return false;
  }

  // Verify signature
  const sigBasestring = `v0:${timestamp}:${body}`;
  const mySignature =
    'v0=' +
    crypto
      .createHmac('sha256', SLACK_SIGNING_SECRET)
      .update(sigBasestring, 'utf8')
      .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(mySignature, 'utf8'),
      Buffer.from(signature, 'utf8')
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Main handler for Slack events
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get raw body using micro's buffer function
    const rawBodyBuffer = await buffer(req);
    const rawBodyString = rawBodyBuffer.toString('utf8');
    
    // Parse the JSON
    const body = JSON.parse(rawBodyString);
    const { type, challenge, event } = body;

    console.log('Request received:', { type });

    // Handle URL verification challenge (no signature verification needed for initial setup)
    // This is a one-time Slack setup request
    if (type === 'url_verification') {
      console.log('✅ URL verification challenge received, responding with challenge');
      return res.status(200).json({ challenge });
    }

    // For all other requests, verify signature for security
    const signature = req.headers['x-slack-signature'] as string | undefined;
    const timestamp = req.headers['x-slack-request-timestamp'] as string | undefined;
    
    if (!verifySlackRequest(signature, timestamp, rawBodyString)) {
      console.error('Invalid Slack signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Handle event callbacks
    if (type === 'event_callback') {
      // Process the event BEFORE responding
      // Vercel kills background tasks after response is sent
      try {
        await processEvent(event);
      } catch (error) {
        console.error('Error processing event:', error);
      }

      // Respond to Slack after processing completes
      return res.status(200).json({ ok: true });
    }

    // Unknown event type
    console.log('Unknown event type:', type);
    return res.status(400).json({ error: 'Unknown event type' });
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Processes a Slack message event
 */
async function processEvent(event: any): Promise<void> {
  const startTime = Date.now();
  const timing: Record<string, number> = {};
  
  // Only process message events
  if (event.type !== 'message') {
    return;
  }

  // Ignore bot messages (including our own)
  if (event.bot_id || event.subtype === 'bot_message') {
    return;
  }

  // Ignore message edits, deletions, etc.
  if (event.subtype && event.subtype !== 'file_share') {
    return;
  }

  const { text, channel, ts } = event;

  // Check if message contains a music link
  const musicLink = extractMusicLink(text);
  if (!musicLink) {
    return; // No music link found
  }

  timing.linkDetection = Date.now() - startTime;
  console.log(`⏱️ Link detection: ${timing.linkDetection}ms`);
  console.log('Found music link:', { musicLink, channel });

  // Identify which service the link is from
  const originalService = identifyMusicService(musicLink);
  if (originalService === MusicService.UNKNOWN) {
    console.warn('Unknown music service:', musicLink);
    return;
  }

  timing.serviceIdentification = Date.now() - startTime - timing.linkDetection;
  console.log(`⏱️ Service identification: ${timing.serviceIdentification}ms`);

  try {
    // Fetch cross-platform links from Songlink
    const songlinkStart = Date.now();
    const result = await getCrossPlatformLinks(musicLink);
    timing.songlinkApi = Date.now() - songlinkStart;
    console.log(`⏱️ Songlink API call: ${timing.songlinkApi}ms`);
    
    const { links, metadata } = result;

    // Generate search URLs for Qobuz and Bandcamp if not provided by Songlink
    const searchUrlStart = Date.now();
    const sanitizedMetadata = sanitizeMetadata(metadata);
    const searchUrls = generateSearchUrls(sanitizedMetadata);
    timing.searchUrlGeneration = Date.now() - searchUrlStart;
    console.log(`⏱️ Search URL generation: ${timing.searchUrlGeneration}ms`);

    // Merge Songlink links with generated search URLs
    // Only add search URLs if Songlink didn't provide them
    const allLinks = {
      ...links,
      qobuz: links.qobuz || searchUrls.qobuz,
      bandcamp: links.bandcamp || searchUrls.bandcamp,
    };

    // Format the message
    const formatStart = Date.now();
    const message = formatMusicLinksMessage(allLinks, originalService);
    timing.messageFormatting = Date.now() - formatStart;
    console.log(`⏱️ Message formatting: ${timing.messageFormatting}ms`);

    // Post threaded reply
    const slackPostStart = Date.now();
    await postThreadedReply(channel, ts, message);
    timing.slackPost = Date.now() - slackPostStart;
    console.log(`⏱️ Slack post: ${timing.slackPost}ms`);

    timing.total = Date.now() - startTime;
    
    console.log('✅ Successfully posted cross-platform links', {
      channel,
      originalService,
      linksFound: Object.keys(allLinks).filter(k => allLinks[k as keyof typeof allLinks]).length,
      timingBreakdown: timing,
      totalTime: `${timing.total}ms`,
    });
  } catch (error: any) {
    timing.total = Date.now() - startTime;
    console.error('❌ Error processing music link:', {
      error: error.message,
      musicLink,
      timingBeforeError: timing,
      totalTime: `${timing.total}ms`,
    });

    // Post error message to thread
    try {
      const errorMessage = formatErrorMessage(error);
      await postThreadedReply(channel, ts, errorMessage);
    } catch (postError) {
      console.error('Failed to post error message:', postError);
    }
  }
}

