const getMyBoards = async (req, res) => {
  try {
    const userData = await Parse.Cloud.run("getMyBoards", req.user);
    res.status(200);
    res.json(userData);
  } catch (e) {
    console.log("Occurred error in send otp", e);
    res.status(500);
    res.send("Occurred error in send otp");
  }
};

export { getMyBoards };
