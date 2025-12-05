/**
 * Minimal Slack Events Handler for debugging
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  console.log('Minimal slack handler invoked');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body;
  const { type, challenge } = body;

  if (type === 'url_verification') {
    console.log('URL verification received');
    return res.status(200).json({ challenge });
  }

  return res.status(200).json({ ok: true });
}

