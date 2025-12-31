const sgMail = require('@sendgrid/mail');

// Function to send OTP email
const sendEmail = async(to, otp) => {
    try {
        // Set SendGrid API key
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        // Send email
        const msg = {
            to,
            from: 'noreply@truthvsnoise.com', // Replace with your verified sender
            subject: 'Your Verification Code',
            html: `
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>This code is valid for 5 minutes.</p>
      `,
        };

        const response = await sgMail.send(msg);
        console.log(`Email sent: ${response[0].statusCode}`);
        return { success: true, messageId: response[0].headers['x-message-id'] };

    } catch (error) {
        console.error('EMAIL ERROR:', error);
        return { success: false, error };
    }
};

module.exports = sendEmail;