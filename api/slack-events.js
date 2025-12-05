/**
 * Super minimal JavaScript handler
 */

module.exports = async (req, res) => {
  console.log('JS handler invoked');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body;
  const { type, challenge } = body ||  {};

  if (type === 'url_verification') {
    console.log('URL verification');
    return res.status(200).json({ challenge });
  }

  return res.status(200).json({ ok: true, received: true });
};

