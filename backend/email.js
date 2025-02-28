const nodemailer = require("nodemailer");
const fs = require('node:fs');
const path = require('node:path');
const {compile} = require("handlebars");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465', 10),
  secure: JSON.parse(process.env.EMAIL_SECURE || 'true'),
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendEmail(emailTo, name, otpCode) {
  const filePath = path.join(__dirname, './templates/emails/index.html');
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = compile(source);
  const replacements = {
    code: otpCode,
    host: process.env.FRONT_HOST,
    name: name
  };
  const htmlToSend = template(replacements);
  const info = await transporter.sendMail({
      from: `Open sprint retro <${process.env.EMAIL_FROM}>`, // sender address
      to: emailTo, // list of receivers
      subject: "Código de acesso - Open Sprint Retro", // Subject line
      html: htmlToSend,
      });

      console.log("Message sent: %s", info.messageId);
      }


module.exports = sendEmail
