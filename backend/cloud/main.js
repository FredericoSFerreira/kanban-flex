Parse.Cloud.define("getOtp", async (request) => {
  try {
    const query = new Parse.Query("otp");
    query.equalTo({'email': request.params.email})
    const otp = await query.first();
    console.log(otp, "HERER")
    console.log(otp.attributes)
    return otp.attributes;
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
    return otp.save();
  });
});


Parse.Cloud.define("checkOtp", async (request) => {
  try {
    const query = new Parse.Query("otp");
    query.equalTo({'email': request.params.email, 'code': request.params.code})
    const otp = await query.first();
    return otp.attributes;
  } catch (error) {
    console.log('Failed to checkOtp, with error code: ' + error.message);
  }
});

