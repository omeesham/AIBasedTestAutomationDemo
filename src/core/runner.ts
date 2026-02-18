import { execSync, spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { Logger } from '../utils/logger';
import { config, FrameworkConfig } from '../utils/config';
import { checkLicense } from './license';
import { ensureDir } from '../utils/helpers';

const logger = new Logger('Runner');

/**
 * Enterprise Framework Runner
 * 
 * Orchestrates test execution with:
 * - License validation
 * - Configuration loading
 * - Pre-execution cleanup
 * - Playwright test execution
 * - Post-execution reporting (Allure, email)
 * 
 * This module is obfuscated in the distributed build.
 */

export interface RunOptions {
    configPath?: string;        // Path to client config JSON
    licensePath?: string;       // Path to license file
    testFile?: string;          // Specific test file to run
    grep?: string;              // Test name pattern to filter
    headed?: boolean;           // Run headed browser
    project?: string;           // Browser project to use
    workers?: number;           // Number of parallel workers
    retries?: number;           // Number of retries
    skipLicense?: boolean;      // Skip license check (dev mode only)
}

export class FrameworkRunner {
    private cfg: FrameworkConfig;
    private logger: Logger;

    constructor(clientConfigPath?: string) {
        this.cfg = config(clientConfigPath);
        this.logger = new Logger('FrameworkRunner');
    }

    /**
     * Pre-execution: validate license, clean previous results
     */
    async preExecution(options: RunOptions): Promise<boolean> {
        this.logger.separator();
        this.logger.info('Enterprise Playwright Framework');
        this.logger.info(`Project: ${this.cfg.projectName}`);
        this.logger.info(`Suite: ${this.cfg.suiteName}`);
        this.logger.separator();

        // License validation
        if (!options.skipLicense) {
            this.logger.info('Validating license...');
            const licenseResult = await checkLicense(options.licensePath);
            console.log(licenseResult.message);

            if (!licenseResult.valid) {
                this.logger.error('Framework execution blocked — invalid license');
                return false;
            }

            if (licenseResult.expiresIn && licenseResult.expiresIn <= 30) {
                this.logger.warn(`License expires in ${licenseResult.expiresIn} days — renew soon`);
            }
        } else {
            this.logger.warn('License check skipped (development mode)');
        }

        // Clean previous allure results
        this.cleanAllureResults();

        return true;
    }

    /**
     * Clean allure-results directory
     */
    private cleanAllureResults(): void {
        const allureResultsDir = path.join(process.cwd(), 'allure-results');
        if (fs.existsSync(allureResultsDir)) {
            fs.rmSync(allureResultsDir, { recursive: true, force: true });
            this.logger.info('Cleaned allure-results directory');
        }
    }

    /**
     * Build Playwright CLI command
     */
    private buildCommand(options: RunOptions): string {
        const args: string[] = ['npx', 'playwright', 'test'];

        if (options.testFile) {
            args.push(options.testFile);
        }

        if (options.grep) {
            args.push('--grep', `"${options.grep}"`);
        }

        if (options.headed || !this.cfg.headless) {
            args.push('--headed');
        }

        if (options.project) {
            args.push('--project', options.project);
        }

        if (options.workers) {
            args.push('--workers', options.workers.toString());
        } else if (this.cfg.workers) {
            args.push('--workers', this.cfg.workers.toString());
        }

        if (options.retries !== undefined) {
            args.push('--retries', options.retries.toString());
        }

        return args.join(' ');
    }

    /**
     * Execute tests
     */
    async execute(options: RunOptions): Promise<number> {
        const command = this.buildCommand(options);
        this.logger.info(`Executing: ${command}`);
        this.logger.separator();

        try {
            execSync(command, {
                stdio: 'inherit',
                cwd: process.cwd(),
                env: {
                    ...process.env,
                    PWG_ENV_PROJECT: this.cfg.projectName,
                    PWG_ENV_SUITE_NAME: this.cfg.suiteName,
                }
            });
            this.logger.info('Test execution completed successfully');
            return 0;
        } catch (error: any) {
            this.logger.error('Test execution completed with failures');
            return error.status || 1;
        }
    }

    /**
     * Post-execution: generate reports
     */
    async postExecution(): Promise<void> {
        this.logger.separator();
        this.logger.info('Post-execution: Generating reports...');

        // Generate Allure report
        if (this.cfg.allureEnabled) {
            await this.generateAllureReport();
        }

        this.logger.info('Post-execution complete');
        this.logger.separator();
    }

    /**
     * Generate Allure report
     */
    private async generateAllureReport(): Promise<void> {
        const allureResultsDir = path.join(process.cwd(), 'allure-results');

        if (!fs.existsSync(allureResultsDir)) {
            this.logger.warn('No allure-results found — skipping Allure report generation');
            return;
        }

        try {
            this.logger.info('Generating Allure report...');
            execSync('npx allure generate ./allure-results -o ./allure-report --clean', {
                stdio: 'inherit',
                cwd: process.cwd()
            });
            this.logger.info('Allure report generated at ./allure-report');
        } catch (error) {
            this.logger.error('Failed to generate Allure report', error);
        }
    }

    /**
     * Full run: pre-execution → execute → post-execution
     */
    async run(options: RunOptions = {}): Promise<number> {
        const canProceed = await this.preExecution(options);
        if (!canProceed) {
            return 1;
        }

        const exitCode = await this.execute(options);
        await this.postExecution();

        return exitCode;
    }
}
