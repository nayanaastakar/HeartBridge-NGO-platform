const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (options) => {
    console.log(`[EMAIL-UTIL] Attempting to send email to: ${options.email}`);
    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // Define email options
    const mailOptions = {
        from: `"HeartBridge Platform" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL-UTIL] ✅ Email sent successfully: ${info.messageId}`);
};

module.exports = sendEmail;
