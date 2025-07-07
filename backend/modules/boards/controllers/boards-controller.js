import {generateBoardSummaryPrompt, parseBoolean} from "../../../utils/utils.js";
import {getAIBoardSummary} from "../../../service/groq-service.js";
import {getRedisClient} from "../../../service/redis-service.js";
import {callFunction} from "../../../utils/parse-utils.js";
import {response} from "express";

const getMyBoards = async (req, res) => {
  try {
    const userData = await callFunction("getMyBoards", req.user, req.token);
    res.status(200);
    res.json(userData);
  } catch (e) {
    console.log("Occurred error in get my board", e);
    res.status(500);
    res.send("Occurred error in get my board");
  }
};

const getParticipatingBoards = async (req, res) => {
  try {
    const params = {userId: req.user.id};
    const boardsData = await callFunction("getParticipatingBoards", params, req.token);
    res.status(200);
    res.json(boardsData);
  } catch (e) {
    console.log("Occurred error in get participating boards", e);
    res.status(500);
    res.send("Occurred error in get participating boards");
  }
};


const getBoardStats = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).send("Invalid id");

    const boardStats = await callFunction("getBoardStats", req.params, req.token);
    res.status(200);
    res.json(boardStats);
  } catch (e) {
    console.log("Occurred error in get stats board", e);
    res.status(500);
    res.send("Occurred error in get stats board");
  }
};


const getBoardSummary = async (req, res) => {
  try {
    const id = req.params.id;
    const retry = parseBoolean(req.query.retry);
    if (!id) return res.status(400).send("Invalid id");

    const client = await getRedisClient();
    const cacheKey = `summary_board_${id}`;

    if (!retry) {
      const valor = await client.get(cacheKey);
      if (valor) {
        console.log('searched in cache');
        return res.status(200).json(JSON.parse(valor));
      }
    }

    console.log('did not search in cache');
    const board = await callFunction("getBoardById", req.params, req.token);
    const prompt = generateBoardSummaryPrompt(board.attributes);
    const aiResponse = await getAIBoardSummary([
      {
        role: "system",
        content: "Você é um assistente que resume quadros de tarefas kanban de forma clara e objetiva. Responda na mesmo idioma que o prompt do usuario foi fornecido. Responda somente em texto puro."
      },
      {
        role: "user",
        content: prompt
      }
    ])

    const summary = {'summary': aiResponse}
    await client.set(cacheKey, JSON.stringify(summary));
    res.status(200).json(summary);
  } catch (e) {
    console.log("Occurred error in get board summary", e);
    res.status(500);
    res.send("Occurred error in get board summary");
  }
}


const getBoardQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    const question = req.body.question
    if (!id) return res.status(400).send("Invalid id");
    if (!question) return res.status(400).send("Invalid question");

    const board = await callFunction("getBoardById", req.params, req.token);
    const context = generateBoardSummaryPrompt(board.attributes, true, true);
    const aiResponse = await getAIBoardSummary([
      {
        role: "system",
        content: "Você é um chat bot especialista em boards kanban. Responda com base no contexto fornecido. Mas sem falar que essa informação e do contexto." +
          " Responda no mesmo idioma que a Pergunta do usuario foi fornecida. Tente responder de forma mais breve é resumida."
      },
      {role: 'user', content: `Contexto: ${context}\n\nPergunta: ${question}`}
    ], 'llama-3.3-70b-versatile')
    res.status(200).json({reply: aiResponse});
  } catch (e) {
    console.log("Occurred error in get board summary", e);
    res.status(500);
    res.send("Occurred error in get board summary");
  }
}

export {getMyBoards, getParticipatingBoards, getBoardStats, getBoardSummary, getBoardQuestion};
