/**
 * Slack Events Handler (Vercel Serverless Function)
 * Handles incoming Slack events and processes music links
 * 
 * Uses @slack/bolt's AwsLambdaReceiver which works perfectly with Vercel
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { App, AwsLambdaReceiver } from '@slack/bolt';
import { IncomingMessage } from 'http';
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

// Disable automatic body parsing to get raw body for signature verification
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

// Initialize the Bolt receiver for AWS Lambda (works with Vercel too)
// This handles signature verification correctly
const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: SLACK_SIGNING_SECRET,
});

// Initialize the Bolt app
const app = new App({
  token: SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,
});

// Listen for messages with music links
app.message(async ({ message }) => {
  try {
    // Only process regular messages
    if (message.subtype || !('text' in message)) {
      return;
    }

    const { text, channel, ts } = message;

    // Type guard: ensure we have required fields
    if (!text || !channel || !ts) {
      console.warn('Message missing text, channel, or ts');
      return;
    }

    // After type guard, we know all fields are defined
    const channelId: string = channel;
    const messageTs: string = ts;
    const messageText: string = text;

    // Check if message contains a music link
    const musicLink = extractMusicLink(messageText);
    if (!musicLink) {
      return; // No music link found
    }

    console.log('Found music link:', { musicLink, channel: channelId });

    // Identify which service the link is from
    const originalService = identifyMusicService(musicLink);
    if (originalService === MusicService.UNKNOWN) {
      console.warn('Unknown music service:', musicLink);
      return;
    }

    // Fetch cross-platform links from Songlink
    const result = await getCrossPlatformLinks(musicLink);
    const { links, metadata } = result;

    // Generate search URLs for Qobuz and Bandcamp if not provided by Songlink
    const sanitizedMetadata = sanitizeMetadata(metadata);
    const searchUrls = generateSearchUrls(sanitizedMetadata);

    // Merge Songlink links with generated search URLs
    const allLinks = {
      ...links,
      qobuz: links.qobuz || searchUrls.qobuz,
      bandcamp: links.bandcamp || searchUrls.bandcamp,
    };

    // Format the message
    const formattedMessage = formatMusicLinksMessage(allLinks, originalService);

    // Post threaded reply
    await postThreadedReply(channelId, messageTs, formattedMessage);

    console.log('Successfully posted cross-platform links', {
      channel: channelId,
      originalService,
      linksFound: Object.keys(allLinks).filter(k => allLinks[k as keyof typeof allLinks]).length,
    });
  } catch (error: any) {
    console.error('Error processing music link:', {
      error: error.message,
      stack: error.stack,
    });

    // Post error message to thread
    if ('channel' in message && 'ts' in message && message.channel && message.ts) {
      try {
        const errorMessage = formatErrorMessage(error);
        await postThreadedReply(message.channel, message.ts, errorMessage);
      } catch (postError) {
        console.error('Failed to post error message:', postError);
      }
    }
  }
});

/**
 * Get raw body as buffer from the request
 * Using event-based approach that's more reliable in Vercel
 */
function getRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    req.on('data', (chunk) => {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    });
    
    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    
    req.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Main handler for Vercel - converts Vercel request to Lambda-style event
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

    // Get raw body as string for signature verification
    const rawBodyBuffer = await getRawBody(req);
    const rawBodyString = rawBodyBuffer.toString('utf-8');

    console.log('Request received:', {
      bodyLength: rawBodyString.length,
      hasSignature: !!req.headers['x-slack-signature'],
      hasTimestamp: !!req.headers['x-slack-request-timestamp'],
    });

    // Convert Vercel request to AWS Lambda event format
    // The AwsLambdaReceiver expects a complete AWS API Gateway event
    const lambdaEvent = {
      body: rawBodyString,
      headers: req.headers as any,
      multiValueHeaders: {},
      httpMethod: req.method || 'POST',
      isBase64Encoded: false,
      path: '/api/slack-events',
      pathParameters: null,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {
        accountId: '',
        apiId: '',
        protocol: 'HTTP/1.1',
        httpMethod: req.method || 'POST',
        path: '/api/slack-events',
        stage: 'prod',
        requestId: '',
        requestTime: '',
        requestTimeEpoch: Date.now(),
        identity: {
          sourceIp: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '',
          userAgent: req.headers['user-agent'] || '',
        },
      },
      resource: '/api/slack-events',
    };

    // Use the Bolt receiver to handle the request
    // This properly verifies the signature using the raw body
    const response = await awsLambdaReceiver.start();
    const result = await response(lambdaEvent, {} as any, () => {});

    console.log('Response:', {
      statusCode: result.statusCode,
      bodyPreview: result.body?.substring(0, 100),
    });

    // Return the response
    res.status(result.statusCode);
    
    // Set headers if any
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        res.setHeader(key, value as string);
      });
    }
    
    // Send the body
    if (result.body) {
      res.send(result.body);
    } else {
      res.end();
    }
  } catch (error: any) {
    console.error('Handler error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}

