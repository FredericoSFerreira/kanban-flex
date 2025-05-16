async function getAIBoardSummary(payload) {
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
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: "Você é um assistente que resume quadros de tarefas kanban de forma clara e objetiva. Responda na mesmo idioma que o prompt do usuario foi fornecido. Responda somente em texto puro."
        },
        {
          role: "user",
          content: payload
        }
      ],
      temperature: 1
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

export {getAIBoardSummary};

