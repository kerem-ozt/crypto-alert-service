const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
});

async function sendNotification(user, message) {
  try {
    // await sendEmail(user.email, message);
    logger.info(`Email sent to ${user.email}`);
  
  } catch (err) {
    logger.error('Failed to send notification:', err);
  }
}


async function sendEmail(toEmail, message) {
  const mailOptions = {
    from: '',
    // to: toEmail,
    to: '',
    subject: 'Crypto Alert',
    text: message
  };
  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendNotification,
};
