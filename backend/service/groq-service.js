async function getAIBoardSummary(messages, model = 'llama-3.1-8b-instant') {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Using insecure connection to GROQ API');
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
  }
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
  return data.choices?.[0]?.message?.content;
}

export {getAIBoardSummary};

