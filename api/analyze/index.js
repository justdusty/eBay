module.exports = async function (context, req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    context.res = {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: 'Server configuration error: ANTHROPIC_API_KEY is not set.' } })
    };
    return;
  }

  const { images, prompt } = req.body || {};

  if (!Array.isArray(images) || images.length === 0 || !prompt) {
    context.res = {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: 'Request must include images (array) and prompt (string).' } })
    };
    return;
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [...images, { type: 'text', text: prompt }]
        }]
      })
    });

    const data = await upstream.json();

    context.res = {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };

  } catch (err) {
    context.res = {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: `Upstream error: ${err.message}` } })
    };
  }
};
