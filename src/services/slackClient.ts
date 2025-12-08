/**
 * Slack Client Service
 * Handles interactions with the Slack Web API
 */

import { WebClient } from '@slack/web-api';

let slackClient: WebClient | null = null;
let currentToken: string | null = null;

/**
 * Initializes the Slack Web API client
 * Always creates a new client when token changes to ensure fresh credentials
 * @param token - Slack bot token
 * @returns Initialized Slack WebClient
 */
export function initializeSlackClient(token: string): WebClient {
  // Always create new client if token changed (handles token refresh)
  if (!slackClient || currentToken !== token) {
    slackClient = new WebClient(token);
    currentToken = token;
    console.log('🔄 Slack client initialized with', token === currentToken && slackClient ? 'existing' : 'new', 'token');
  }
  return slackClient;
}

/**
 * Gets the initialized Slack client
 * @throws Error if client not initialized
 */
export function getSlackClient(): WebClient {
  if (!slackClient) {
    throw new Error('Slack client not initialized. Call initializeSlackClient first.');
  }
  return slackClient;
}

/**
 * Posts a threaded reply to a message
 * @param channel - Channel ID where the original message was posted
 * @param threadTs - Timestamp of the message to reply to
 * @param text - The message text to post
 * @returns Slack API response
 */
export async function postThreadedReply(
  channel: string,
  threadTs: string,
  text: string
): Promise<void> {
  const client = getSlackClient();

  try {
    await client.chat.postMessage({
      channel,
      thread_ts: threadTs,
      text,
      unfurl_links: false, // Disable link previews to keep response compact
      unfurl_media: false,
    });
    console.log('Successfully posted threaded reply', { channel, threadTs });
  } catch (error: any) {
    console.error('Error posting threaded reply:', {
      error: error.message,
      channel,
      threadTs,
    });
    throw error;
  }
}

/**
 * Adds an emoji reaction to a message
 * @param channel - Channel ID
 * @param timestamp - Message timestamp
 * @param emoji - Emoji name (without colons)
 */
export async function addReaction(
  channel: string,
  timestamp: string,
  emoji: string
): Promise<void> {
  const client = getSlackClient();

  try {
    await client.reactions.add({
      channel,
      timestamp,
      name: emoji,
    });
  } catch (error: any) {
    // Ignore if reaction already exists
    if (error.data?.error !== 'already_reacted') {
      console.error('Error adding reaction:', error.message);
    }
  }
}

