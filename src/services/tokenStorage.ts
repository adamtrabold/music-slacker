/**
 * Token Storage Service using Upstash Redis
 * Stores and retrieves Slack workspace tokens securely
 */

import { Redis } from '@upstash/redis';

// Check environment variables
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  console.error('❌ Missing Upstash Redis environment variables!');
  console.error('Required: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN');
}

// Initialize Redis client
const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL!,
  token: UPSTASH_REDIS_REST_TOKEN!,
});

export interface WorkspaceTokens {
  botToken: string;
  teamId: string;
  teamName: string;
  installedAt: string;
}

/**
 * Store tokens for a workspace
 */
export async function storeWorkspaceTokens(
  teamId: string,
  tokens: WorkspaceTokens
): Promise<void> {
  try {
    const key = `workspace:${teamId}`;
    await redis.set(key, JSON.stringify(tokens));
    console.log('✅ Stored tokens for workspace:', teamId);
  } catch (error: any) {
    console.error('❌ Failed to store tokens:', error.message);
    throw new Error(`Failed to store tokens: ${error.message}`);
  }
}

/**
 * Get tokens for a workspace
 */
export async function getWorkspaceTokens(
  teamId: string
): Promise<WorkspaceTokens | null> {
  const key = `workspace:${teamId}`;
  const data = await redis.get(key);
  
  if (!data) {
    console.log('❌ No tokens found for workspace:', teamId);
    return null;
  }
  
  return typeof data === 'string' ? JSON.parse(data) : data;
}

/**
 * Delete tokens for a workspace (when app is uninstalled)
 */
export async function deleteWorkspaceTokens(teamId: string): Promise<void> {
  const key = `workspace:${teamId}`;
  await redis.del(key);
  console.log('🗑️ Deleted tokens for workspace:', teamId);
}

/**
 * Check if workspace is installed
 */
export async function isWorkspaceInstalled(teamId: string): Promise<boolean> {
  const tokens = await getWorkspaceTokens(teamId);
  return tokens !== null;
}

