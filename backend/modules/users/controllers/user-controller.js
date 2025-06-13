import {callFunction} from "../../../utils/parse-utils.js";
const updateUser = async (req, res) => {
  try {
    const email = req.body.email;
    const name = req.body.name;
    const phone = req.body.phone;
    const active = req.body.active;
    await callFunction("updateUserOtp", {
      name,
      phone,
      email,
      active,
      id: req.user.id,
    }, req.token);
    res.status(201);
    res.send("OK");
  } catch (e) {
    console.log("Occurred error in update otp", e);
    res.status(500);
    res.send("Occurred error in update otp");
  }
};

export { updateUser };
