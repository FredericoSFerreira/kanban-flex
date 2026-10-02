async function getAIBoardSummary(messages, model = process.env.GROQ_SUMMARY_MODEL || 'openai/gpt-oss-20b') {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages,
      temperature: 1
    })
  });

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!response.ok || !content) {
    console.log('GROQ API error', response.status, data.error);
    throw new Error(`GROQ API error: ${data.error?.message || response.status}`);
  }
  return content;
}

export {getAIBoardSummary};

