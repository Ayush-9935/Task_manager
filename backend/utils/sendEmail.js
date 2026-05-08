const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let testAccount;
  if (!process.env.SMTP_EMAIL) {
    testAccount = await nodemailer.createTestAccount();
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_EMAIL || testAccount.user,
      pass: process.env.SMTP_PASSWORD || testAccount.pass,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'TaskFlow'} <${process.env.FROM_EMAIL || 'noreply@taskflow.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  console.log('=========================================');
  console.log('📧 PASSWORD RESET REQUEST');
  console.log(`Recipient: ${options.email}`);
  console.log(`Reset URL: ${options.resetUrl}`);
  console.log('=========================================');

  try {
    const info = await transporter.sendMail(message);
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Email sent successfully');
      console.log('🔗 Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('❌ Email delivery failed. Manual link usage required.');
  }
};

module.exports = sendEmail;
