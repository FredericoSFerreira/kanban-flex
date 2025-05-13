const getMyAccessLogs = async (req, res) => {
  try {
    console.log(req.user.id, "8898")
    const accessLogsData = await Parse.Cloud.run("getMyAccessLogs", req.user);
    res.status(200);
    res.json(accessLogsData);
  } catch (e) {
    console.log("Occurred error in get access log", e);
    res.status(500);
    res.send("Occurred error in get access log");
  }
};

export { getMyAccessLogs };
