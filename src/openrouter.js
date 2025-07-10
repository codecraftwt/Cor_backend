// backend/openrouter.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function getOpenRouterCompletion(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const referer = process.env.OPENROUTER_REFERER; // e.g., "https://yoursite.com"
  const title = process.env.OPENROUTER_TITLE;     // e.g., "Your Site Name"

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": referer || "",
      "X-Title": title || "",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "deepseek/deepseek-r1-0528:free",
      "messages": [
        {
          "role": "user",
          "content": prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

module.exports = { getOpenRouterCompletion };