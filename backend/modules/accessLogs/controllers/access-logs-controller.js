import {callFunction} from "../../../utils/parse-utils.js";

const getMyAccessLogs = async (req, res) => {
  try {
    const accessLogsData = await callFunction("getMyAccessLogs", req.user, req.token);
    res.status(200);
    res.json(accessLogsData);
  } catch (e) {
    console.log("Occurred error in get access log", e);
    res.status(500);
    res.send("Occurred error in get access log");
  }
};

export { getMyAccessLogs };
