const nodemailer = require("nodemailer");

// Function to send OTP email
const sendEmail = async (to, otp) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail
        pass: process.env.EMAIL_PASS  // Gmail App Password
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection configuration
    await transporter.verify();
    console.log("Email server is ready to send messages");

    // Send email
    const info = await transporter.sendMail({
      from: `"Truth vs Noise" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your Verification Code",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>This code is valid for 5 minutes.</p>
      `
    });

    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error("EMAIL ERROR:", error);
    return { success: false, error };
  }
};

module.exports = sendEmail;
