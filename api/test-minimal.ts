/**
 * Minimal test handler to check if Vercel functions work at all
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  console.log('Minimal handler invoked');
  return res.status(200).json({ message: 'Hello from minimal handler', method: req.method });
}

