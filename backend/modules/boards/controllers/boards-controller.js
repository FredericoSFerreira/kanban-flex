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

export { getMyBoards, getBoardStats };
