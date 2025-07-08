import {OAuth2Client} from 'google-auth-library';
import {generateOtp, generateToken} from "../../../utils/utils.js";
import sendEmail from "../../../service/email-service.js";
import { t } from "../../../i18n/index.js";


const client = new OAuth2Client()
const register = async (req, res) => {
  try {
    const email = req.body.email;
    const name = req.body.name;
    const phone = req.body.phone;
    const phoneObject = req.body.phoneObject || {}
    const {ip, userAgent} = req.clientInfo;
    const resultSave = await Parse.Cloud.run("saveOtp", {
      email,
      name,
      phone,
      ip,
      userAgent,
      phoneObject
    });
    const {conflict} = resultSave;
    if (conflict) {
      return res.status(409).send("Email already registered");
    }
    const code = generateOtp();
    await updateOtp(email, code);
    // change for middleware
    const acceptLanguage = req.headers['accept-language'] || '';
    const locale = acceptLanguage.includes('en') ? 'en' : 'pt-BR';
    await sendEmail(req.body.email, name, code, locale);
    res.send("OK");
  } catch (e) {
    console.log("Occurred error in register otp", e);
    res.status(500);
    res.send("Occurred error in register otp");
  }
};

const sendOtp = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await Parse.Cloud.run("getOtp", {email});
    if (userData.notFound) {
      return res.status(404).send("Email not found");
    }

    // Check if user is active
    if (userData.active === false) {
      const acceptLanguage = req.headers['accept-language'] || '';
      const locale = acceptLanguage.includes('en') ? 'en' : 'pt-BR';
      return res.status(406).json({
        error: 'inactive_account',
        message: t('auth.inactiveAccount', locale)
      });
    }

    const name = userData.name;
    const code = generateOtp();
    await updateOtp(email, code);
    const acceptLanguage = req.headers['accept-language'] || '';
    const locale = acceptLanguage.includes('en') ? 'en' : 'pt-BR';
    await sendEmail(req.body.email, name, code, locale);
    res.status(201).send();
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
    const {ip, userAgent} = req.clientInfo;
    const otpData = await Parse.Cloud.run("checkOtp", {
      email,
      code,
      ip,
      userAgent,
    });
    if (otpData) {
      await updateOtp(email, generateOtp(), true);
      const token = await generateToken({
        email: email,
        name: otpData.name,
        phone: otpData.phone,
        id: otpData.id,
        avatar: otpData.avatar || null,
      });
      res.json({isValid: true, token: token});
    } else {
      res.status(403);
      res.json({isValid: false});
    }
  } catch (e) {
    console.log("Occurred error in check otp", e);
    res.status(500);
    res.send("Occurred error in check otp");
  }
};


const authGoogle = async (req, res) => {

  const {token} = req.body
  const {ip, userAgent} = req.clientInfo;
  if (!token) return res.status(400).json({error: 'Without token'})

  try {
    client.setCredentials({access_token: token})
    const userinfo = await client.request({
      url: "https://www.googleapis.com/oauth2/v3/userinfo",
    });
    const payload = userinfo.data
    const {sub, email, name, picture} = payload
    console.log(sub, email, name, picture)

    const resultSave = await Parse.Cloud.run("saveOtp", {
      email,
      name,
      picture,
      ip,
      userAgent,
      isValid: true
    });

    // Check if user is active
    if (resultSave.active === false) {
      const acceptLanguage = req.headers['accept-language'] || '';
      const locale = acceptLanguage.includes('en') ? 'en' : 'pt-BR';
      return res.status(406).json({
        error: 'inactive_account',
        message: t('auth.inactiveAccount', locale)
      });
    }

    const jwtToken = await generateToken({
      email: email,
      name: name,
      id: resultSave.id,
      phone: resultSave.phone || null,
      avatar: picture,
    });


    console.log(resultSave)
    res.json({isValid: true, token: jwtToken});
  } catch (error) {
    console.error(error)
    res.status(401).json({error: 'Invalid token'})
  }
}


const updateOtp = async (email, code, isValid= false) => {
  const query = new Parse.Query("otp");
  query.equalTo("email", email)
  query.first().then((otp) => {
    otp.set('code', code)
    if (isValid) otp.set('isValid', isValid)
    otp.save();
  });
}

export {register, sendOtp, checkOtp, authGoogle};
