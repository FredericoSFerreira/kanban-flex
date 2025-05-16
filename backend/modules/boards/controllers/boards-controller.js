import {generateBoardSummaryPrompt, parseBoolean} from "../../../utils.js";
import{getAIBoardSummary} from "../../../service/groq-service.js";
import {getRedisClient} from "../../../service/redis-service.js";

const getMyBoards = async (req, res) => {
  try {
    const userData = await Parse.Cloud.run("getMyBoards", req.user);
    res.status(200);
    res.json(userData);
  } catch (e) {
    console.log("Occurred error in get my board", e);
    res.status(500);
    res.send("Occurred error in get my board");
  }
};


const getBoardStats = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).send("Invalid id");

    const boardStats = await Parse.Cloud.run("getBoardStats", req.params);
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
    const board = await Parse.Cloud.run("getBoardById", req.params);
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

export { getMyBoards, getBoardStats, getBoardSummary };
