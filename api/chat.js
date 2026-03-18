module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, system, max_tokens } = req.body;

    const formattedMessages = system 
      ? [{ role: 'system', content: system }, ...messages]
      : messages;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://devbot-vert.vercel.app',
        'X-Title': 'DevBot'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: formattedMessages,
        max_tokens: max_tokens || 1000
      })
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data));
    const text = data.choices?.[0]?.message?.content || 'حدث خطأ';
    res.status(200).json({ content: [{ text }] });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
