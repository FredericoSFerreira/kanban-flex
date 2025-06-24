import {generateBoardSummaryPrompt, parseBoolean} from "../../../utils/utils.js";
import{getAIBoardSummary} from "../../../service/groq-service.js";
import {getRedisClient} from "../../../service/redis-service.js";
import {callFunction} from "../../../utils/parse-utils.js";

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
    const params = { userId: req.user.id };
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
    console.log("Occurred error in get my board", e);
    res.status(500);
    res.send("Occurred error in get my board");
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
    const aiResponse = await getAIBoardSummary(prompt)

    const summary = {'summary': aiResponse}
    await client.set(cacheKey, JSON.stringify(summary));
    res.status(200).json(summary);
  } catch (e) {
    console.log("Occurred error in get board summary", e);
    res.status(500);
    res.send("Occurred error in get board summary");
  }
}

export { getMyBoards, getParticipatingBoards, getBoardStats, getBoardSummary };
