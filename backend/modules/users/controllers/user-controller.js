import {callFunction} from "../../../utils/parse-utils.js";
import sendEmail from "../../../service/email-service.js";

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

    // If account is being deactivated, send an email notification
    if (active === false) {
      const acceptLanguage = req.headers['accept-language'] || '';
      const locale = acceptLanguage.includes('en') ? 'en' : 'pt-BR';
      await sendEmail(email, name, "ACCOUNT_DELETED", locale);
    }

    res.status(201);
    res.send("OK");
  } catch (e) {
    console.log("Occurred error in update otp", e);
    res.status(500);
    res.send("Occurred error in update otp");
  }
};

export { updateUser };
