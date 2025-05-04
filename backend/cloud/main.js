import {UAParser} from 'ua-parser-js';


async function saveLog(request, user, action = 'login') {
  const accessLog = Parse.Object.extend("accessLog");
  const log = new accessLog();
  const {browser, cpu, device, os} = UAParser(request.params.userAgent);
  log.save({
    id_user: user.id,
    ip: request.params.ip,
    browser: browser.name,
    device: {
      vendor: device.vendor,
      model: device.model,
      os: os.name,
      cpu: cpu.architecture
    },
    action: action,
  })
}

Parse.Cloud.define("getOtp", async (request) => {
  try {
    const query = new Parse.Query("otp");
    query.equalTo({'email': request.params.email})
    const otp = await query.first();
    if (!otp) {
      return {notFound: true}
    }
    console.log(otp.attributes)
    return otp.attributes;
  } catch (error) {
    console.log('Failed to getOtp, with error code: ' + error.message);
    throw error
  }
});


Parse.Cloud.define("saveOtp", async (request) => {
  try {
    const OTP = Parse.Object.extend("otp");
    const otp = new OTP();
    const otpQuery = new Parse.Query(OTP);
    otpQuery.equalTo({'email': request.params.email})
    const otpData = await otpQuery.first();
    if (otpData) {
      return {conflict: true}
    }
    const saveResult = await otp.save({
      name: request.params.name,
      email: request.params.email,
      phone: request.params.phone,
      isValid: false,
      active: true,
      code: null
    })

    await saveLog(request, saveResult, 'register')

    return {conflict: false}
  } catch (error) {
    console.log('Failed to getOtp, with error code: ' + error.message);
    throw error
  }
});


Parse.Cloud.define("updateOtp", async (request) => {
  const query = new Parse.Query("otp");

  query.equalTo("email", request.params.email)
  query.first().then((otp) => {
    otp.set('code', request.params.code)
    if (request.params.isValid) {
      otp.set('isValid', true)
    }
    return otp.save();
  });
});


Parse.Cloud.define("checkOtp", async (request) => {
  try {
    const query = new Parse.Query("otp");
    query.equalTo({'email': request.params.email, 'code': request.params.code})
    const otp = await query.first();
    if (otp) await saveLog(request, {id: otp.id})
    return {id: otp.id, ...otp.attributes};
  } catch (error) {
    console.log('Failed to checkOtp, with error code: ' + error.message);
  }
});


Parse.Cloud.define("getMyBoards", async (request) => {
  try {
    // const Boards = Parse.Object.extend("boards");
    const query = new Parse.Query("boards");
    console.log(request.params.email)
    query.equalTo({'owner_email': request.params.email})
    query.descending('_created_at')
    return await query.find();
  } catch (error) {
    console.log('Failed to getOtp, with error code: ' + error.message);
    throw error
  }
});
