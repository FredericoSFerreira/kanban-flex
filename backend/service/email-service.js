import nodemailer from "nodemailer";
import fs from 'node:fs';
import path from 'node:path';
import pkg from 'handlebars';
const { compile } = pkg;

import { fileURLToPath } from 'url';
import { t } from '../i18n/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465', 10),
  secure: JSON.parse(process.env.EMAIL_SECURE || 'true'),
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send an email to the user
 * @param {string} emailTo - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} code - OTP code or email type (e.g., "ACCOUNT_DELETED")
 * @param {string} locale - Locale for translations
 * @param {object} options - Additional options
 */
async function sendEmail(emailTo, name, code, locale = 'pt-BR', options = {}) {
  // Determine email type
  const isAccountDeletion = code === "ACCOUNT_DELETED";

  // Select the appropriate template and subject
  let filePath, subject;

  if (isAccountDeletion) {
    filePath = path.join(__dirname, '../templates/emails/account-deletion.html');
    subject = t('email.accountDeletionSubject', locale) || 'Your account has been deactivated';
  } else {
    filePath = path.join(__dirname, '../templates/emails/index.html');
    subject = t('email.subject', locale);
  }

  // If template file doesn't exist, fall back to the default template
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, '../templates/emails/index.html');
  }

  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = compile(source);

  const replacements = {
    code: isAccountDeletion ? null : code,
    host: process.env.FRONT_HOST,
    name: name,
    locale: locale,
    isAccountDeletion: isAccountDeletion,
    ...options,
    t: function(key) {
      return t(key, locale);
    }
  };

  const htmlToSend = template(replacements);
  const info = await transporter.sendMail({
    from: `${t('email.appName', locale)} <${process.env.EMAIL_FROM}>`,
    to: emailTo,
    subject: subject,
    html: htmlToSend,
  });

  console.log("Message sent: %s", info.messageId);
}

export default sendEmail;
