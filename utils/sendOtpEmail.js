const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOtpEmail = async (to, subject, otp) => {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM,
      subject,
      text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`,
      html: `<p>Your OTP code is: <strong>${otp}</strong>. It will expire in 5 minutes.</p>`,
    };
    await sgMail.send(msg);
    console.log('✅ OTP email sent via SendGrid');
  } catch (err) {
    console.error('❌ Error sending OTP email via SendGrid:', err);
    throw err; // throw error to handle in your controller
  }
};

module.exports = sendOtpEmail;
