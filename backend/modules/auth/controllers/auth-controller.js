import { generateOtp, generateToken } from "../../../utils.js";
import sendEmail from "../../../email.js";

const register = async (req, res) => {
  try {
    const email = req.body.email;
    const name = req.body.name;
    const phone = req.body.phone;
    const { ip, userAgent } = req.clientInfo;
    const resultSave = await Parse.Cloud.run("saveOtp", {
      email,
      name,
      phone,
      ip,
      userAgent,
    });
    const { conflict } = resultSave;
    if (conflict) {
      return res.status(409).send("Email already registered");
    }
    const code = generateOtp();
    await Parse.Cloud.run("updateOtp", { email, code });
    await sendEmail(req.body.email, name, code);
    res.send("OK");
  } catch (e) {
    console.log("Occurred error in send otp", e);
    res.status(500);
    res.send("Occurred error in send otp");
  }
};

const sendOtp = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await Parse.Cloud.run("getOtp", { email });
    if (userData.notFound) {
      return res.status(404).send("Email not found");
    }
    const name = userData.name;
    const code = generateOtp();
    await Parse.Cloud.run("updateOtp", { email, code });
    await sendEmail(req.body.email, name, code);
    res.send("OK");
  } catch (e) {
    console.log("Occurred error in send otp", e);
    res.status(500);
    res.send("Occurred error in send otp");
  }
};

const checkOtp = async (req, res) => {
  try {
    const email = req.body.email;
    const code = req.body.code;
    const { ip, userAgent } = req.clientInfo;
    const otpData = await Parse.Cloud.run("checkOtp", {
      email,
      code,
      ip,
      userAgent,
    });
    if (otpData) {
      await Parse.Cloud.run("updateOtp", {
        email,
        code: generateOtp(),
        isValid: true,
      });
      const token = await generateToken({
        email: email,
        name: otpData.name,
        id: otpData.id,
      });
      res.json({ isValid: true, token: token });
    } else {
      res.status(403);
      res.json({ isValid: false });
    }
  } catch (e) {
    console.log("Occurred error in send otp", e);
    res.status(500);
    res.send("Occurred error in send otp");
  }
};

export { register, sendOtp, checkOtp };
