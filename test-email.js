const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    console.log('From:', process.env.PWG_EMAIL_FROM);
    console.log('Sending to:', process.env.PWG_EMAIL_ID);
    
    try {
        const info = await transporter.sendMail({
            from: `"Test" <${process.env.PWG_EMAIL_FROM}>`,
            to: process.env.PWG_EMAIL_ID,
            subject: 'Email Test - ' + new Date().toISOString(),
            text: 'This is a test email to verify delivery to both addresses.',
            html: '<h1>Test Email</h1><p>Sent to: ' + process.env.PWG_EMAIL_ID + '</p><p>Time: ' + new Date().toISOString() + '</p>'
        });

        console.log('\n✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Accepted:', info.accepted);
        console.log('Rejected:', info.rejected);
        console.log('Response:', info.response);
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

testEmail();
