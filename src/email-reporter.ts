import { Reporter, FullConfig, Suite, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { sendEmailWithReport } from './email-util';

class EmailReporter implements Reporter {
    private startTime: Date = new Date();
    private passCount: number = 0;
    private failCount: number = 0;
    private skipCount: number = 0;
    private totalTests: number = 0;

    onBegin(config: FullConfig, suite: Suite) {
        this.startTime = new Date();
        this.passCount = 0;
        this.failCount = 0;
        this.skipCount = 0;
        this.totalTests = 0;
        console.log(`\n📧 Email Reporter: Starting test execution at ${this.startTime.toLocaleString()}`);
    }

    onTestEnd(test: TestCase, result: TestResult) {
        this.totalTests++;
        
        if (result.status === 'passed') {
            this.passCount++;
        } else if (result.status === 'failed' || result.status === 'timedOut') {
            this.failCount++;
        } else if (result.status === 'skipped') {
            this.skipCount++;
        }
    }

    async onEnd(result: FullResult) {
        const endTime = new Date();
        const durationMs = endTime.getTime() - this.startTime.getTime();
        
        // Format duration
        const hours = Math.floor(durationMs / 3600000);
        const minutes = Math.floor((durationMs % 3600000) / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        const duration = hours > 0 
            ? `${hours}h ${minutes}m ${seconds}s`
            : minutes > 0 
                ? `${minutes}m ${seconds}s`
                : `${seconds}s`;

        // Calculate pass rate
        const passRate = this.totalTests > 0 
            ? `${((this.passCount / this.totalTests) * 100).toFixed(1)}%`
            : '0%';

        // Find the playwright report
        const reportPath = path.join(process.cwd(), 'playwright-report', 'index.html');
        const reportExists = fs.existsSync(reportPath);

        console.log(`\n📧 Email Reporter: Test execution completed`);
        console.log(`   Total: ${this.totalTests} | Pass: ${this.passCount} | Fail: ${this.failCount} | Skip: ${this.skipCount}`);
        console.log(`   Pass Rate: ${passRate} | Duration: ${duration}`);
        console.log(`   Report Path: ${reportExists ? reportPath : 'Not found'}`);
        console.log(`   Sending email notification...`);

        try {
            await sendEmailWithReport(
                reportPath,
                this.startTime.toLocaleString(),
                endTime.toLocaleString(),
                duration,
                this.totalTests,
                this.passCount,
                this.failCount,
                this.skipCount,
                passRate
            );
            console.log(`✅ Email Reporter: Email sent successfully!`);
        } catch (error) {
            console.error(`❌ Email Reporter: Failed to send email:`, error);
        }
    }
}

export default EmailReporter;
