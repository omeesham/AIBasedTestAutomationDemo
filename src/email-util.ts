import * as nodemailer from 'nodemailer';
import os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();
let userName: string = process.env.USER || process.env.USERNAME || 'Automation User';
const transporter = nodemailer.createTransport({

    host: "smtp.gmail.com",

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


transporter.verify((error, success) => {

    if (error) {

        console.error("❌ Gmail SMTP connection failed:", error);

    } else {

        console.log("✅ Gmail SMTP ready");

    }

});
/**
 * Send Playwright Execution Report Email
 */
export async function sendEmailWithReport(
    reportPath: string,
    startTime: string,
    endTime: string,
    duration: string,
    totalTests: number,
    passCount: number,
    failCount: number,
    skipCount: number,
    passRate: string
) {

    try {

        const toEmails = process.env.PWG_EMAIL_ID?.split(',').map(e => e.trim());

        if (!toEmails || toEmails.length === 0) {
            console.error('❌ No recipient email addresses provided.');
            return;
        }

        const fromEmail =
            process.env.PWG_EMAIL_FROM ||
            `automation@${os.hostname()}`;

        const attachmentExists = reportPath && fs.existsSync(reportPath);

        const mailOptions = {

            from: `"Playwright Automation" <${fromEmail}>`,

            to: toEmails.join(','),

            cc: process.env.PWG_EMAIL_CC || '',

            subject:
                `${process.env.PWG_ENV_PROJECT || 'Project'} - Test Execution Completed | Pass: ${passCount} Fail: ${failCount}`,

            html: `
            <html>
            <body>
            <h2>${process.env.PWG_ENV_SUITE_NAME || 'Test Suite'} Execution Summary</h2>

            <table border="1" cellpadding="6" cellspacing="0">

            <tr><td><b>Project</b></td><td>${process.env.PWG_ENV_PROJECT || ''}</td></tr>

            <tr><td><b>Suite</b></td><td>${process.env.PWG_ENV_SUITE_NAME || ''}</td></tr>

            <tr><td><b>Execution Host</b></td><td>${os.hostname()}</td></tr>

            <tr><td><b>Executed By</b></td><td>${userName}</td></tr>

            <tr><td><b>Start Time</b></td><td>${startTime}</td></tr>

            <tr><td><b>End Time</b></td><td>${endTime}</td></tr>

            <tr><td><b>Duration</b></td><td>${duration}</td></tr>

            <tr><td><b>Total Tests</b></td><td>${totalTests}</td></tr>

            <tr><td><b>Passed</b></td><td style="color:green">${passCount}</td></tr>

            <tr><td><b>Failed</b></td><td style="color:red">${failCount}</td></tr>

            <tr><td><b>Skipped</b></td><td>${skipCount}</td></tr>

            <tr><td><b>Pass Rate</b></td><td>${passRate}</td></tr>

            ${
                process.env.CI
                    ? `<tr>
                       <td><b>Build</b></td>
                       <td>
                       <a href="${process.env.BUILD_URL}">
                       #${process.env.BUILD_NUMBER}
                       </a>
                       </td>
                       </tr>`
                    : ''
            }

            <tr><td><b>Tool</b></td><td>Playwright</td></tr>

            </table>

            <br/>

            <p>Please find attached execution report.</p>

            <p><i>This is an auto-generated email.</i></p>

            <p>Regards,<br/>Automation Team</p>

            </body>
            </html>
            `,

            attachments: attachmentExists
                ? [{
                    filename: 'playwright-report.html',
                    path: reportPath
                }]
                : []
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('✅ Email sent successfully');
        console.log('Message ID:', info.messageId);

    }
    catch (error) {

        console.error('❌ Email sending failed:', error);

    }
}


/**
 * Get latest report folder
 */
export async function getLatestFolder(baseFolder: string): Promise<string | null> {

    try {

        if (!fs.existsSync(baseFolder)) {

            console.error('Folder not found:', baseFolder);

            return null;
        }

        const folders = fs.readdirSync(baseFolder)

            .map(file => path.join(baseFolder, file))

            .filter(file => fs.statSync(file).isDirectory())

            .map(folder => ({
                folder,
                mtime: fs.statSync(folder).mtime.getTime()
            }))

            .sort((a, b) => b.mtime - a.mtime);

        return folders.length > 0 ? folders[0].folder : null;

    }
    catch (error) {

        console.error('Error reading latest folder:', error);

        return null;
    }
}


/**
 * Send Daily Statistics Email
 */
export async function sendDailyStatisticsEmail(
    newLeadsFilePath: string,
    reportFilePath: string
) {

    try {

        const toEmail =
            process.env.PWG_EMAIL_ID ||
            'Omeesha019@gmail.com';

        const fromEmail =
            process.env.PWG_EMAIL_FROM ||
            `automation@${os.hostname()}`;

        let emailBody = '';
        let cssStyles = '';

        if (fs.existsSync(newLeadsFilePath)) {

            const htmlContent =
                fs.readFileSync(newLeadsFilePath, 'utf8');

            // Extract CSS styles
            const styleMatch =
                htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
            
            cssStyles = styleMatch
                ? styleMatch[1]
                : '';

            // Extract body content
            const bodyMatch =
                htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

            emailBody = bodyMatch
                ? bodyMatch[1]
                : htmlContent;
        }
        else {

            emailBody =
                '<p style="color:red">New leads file not found</p>';
        }

        const mailOptions = {

            from: `"CRM Automation" <${fromEmail}>`,

            to: toEmail,

            subject: 'Daily Statistics or Updates',

            html: `
            <html>
            <head>
            <style>
            ${cssStyles}
            </style>
            </head>
            <body>
            <h2>Daily Statistics</h2>

            ${emailBody}

            <br/>

            <p>Attached: Full Report</p>

            <p><i>Auto-generated email</i></p>
            </body>
            </html>
            `,

            attachments: fs.existsSync(reportFilePath)
                ? [{
                    filename: 'LeadsReport.xlsx',
                    path: reportFilePath
                }]
                : []
        };

        const info =
            await transporter.sendMail(mailOptions);

        console.log('✅ Daily email sent:', info.messageId);

    }
    catch (error) {

        console.error('❌ Daily email failed:', error);

    }
}
