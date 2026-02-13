const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendPipelineEmail() {
    const status = process.argv[2] || 'UNKNOWN';
    const buildUrl = process.argv[3] || 'N/A';
    const buildNumber = process.argv[4] || 'N/A';

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const statusColor = status === 'SUCCESS' ? 'green' : status === 'FAILURE' ? 'red' : 'orange';

    const mailOptions = {
        from: `"Jenkins Automation" <${process.env.GMAIL_USER}>`,
        to: process.env.PWG_EMAIL_ID,
        cc: process.env.PWG_EMAIL_CC || '',
        subject: `Playwright Automation - ${status} - Build #${buildNumber}`,
        html: `
        <html>
        <body>
        <h2>Playwright Test Execution Report</h2>
        
        <table border="1" cellpadding="8" cellspacing="0">
            <tr>
                <td><b>Status</b></td>
                <td style="color: ${statusColor}; font-weight: bold;">${status}</td>
            </tr>
            <tr>
                <td><b>Build Number</b></td>
                <td>#${buildNumber}</td>
            </tr>
            <tr>
                <td><b>Build URL</b></td>
                <td><a href="${buildUrl}">${buildUrl}</a></td>
            </tr>
            <tr>
                <td><b>Project</b></td>
                <td>${process.env.PWG_ENV_PROJECT || 'DemoProject'}</td>
            </tr>
            <tr>
                <td><b>Timestamp</b></td>
                <td>${new Date().toLocaleString()}</td>
            </tr>
        </table>

        <br/>
        <p><i>This is an auto-generated email from Jenkins Pipeline.</i></p>
        <p>Regards,<br/>Automation Team</p>
        </body>
        </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Pipeline email sent:', info.messageId);
        console.log('📧 Recipients:', process.env.PWG_EMAIL_ID);
    } catch (error) {
        console.error('❌ Email failed:', error.message);
        process.exit(1);
    }
}

sendPipelineEmail();
