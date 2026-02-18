import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Enterprise Framework Configuration Manager
 * 
 * Manages environment variables, client configs, and runtime settings.
 * Supports multiple client configurations for enterprise distribution.
 */

// Load .env file
dotenv.config();

export interface FrameworkConfig {
    // Project
    projectName: string;
    suiteName: string;
    suiteDescription: string;

    // CRM
    crmUrl: string;
    crmUsername?: string;
    crmPassword?: string;

    // Email
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    gmailUser: string;
    gmailAppPassword: string;
    emailFrom: string;
    emailTo: string[];
    emailCc: string;

    // Execution
    headless: boolean;
    workers: number;
    retries: number;
    timeout: number;
    browsers: string[];

    // Reporting
    reporters: string[];
    allureEnabled: boolean;
    emailReportEnabled: boolean;

    // CI/CD
    isCI: boolean;
    buildUrl?: string;
    buildNumber?: string;
}

/**
 * Load client configuration from JSON file
 */
export function loadClientConfig(clientConfigPath?: string): Partial<FrameworkConfig> {
    if (!clientConfigPath) return {};

    const absolutePath = path.isAbsolute(clientConfigPath)
        ? clientConfigPath
        : path.join(process.cwd(), clientConfigPath);

    if (!fs.existsSync(absolutePath)) {
        console.warn(`⚠️  Client config not found: ${absolutePath}`);
        return {};
    }

    try {
        const content = fs.readFileSync(absolutePath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`❌ Failed to parse client config: ${absolutePath}`, error);
        return {};
    }
}

/**
 * Build the framework configuration from environment + client config
 */
export function getConfig(clientConfigPath?: string): FrameworkConfig {
    const clientOverrides = loadClientConfig(clientConfigPath);

    const config: FrameworkConfig = {
        // Project
        projectName: clientOverrides.projectName || process.env.PWG_ENV_PROJECT || 'Project',
        suiteName: clientOverrides.suiteName || process.env.PWG_ENV_SUITE_NAME || 'Test Suite',
        suiteDescription: clientOverrides.suiteDescription || process.env.PWG_ENV_SUITE_DESC || 'Regression Testing',

        // CRM
        crmUrl: clientOverrides.crmUrl || process.env.PWG_CRM_URL || 'https://demo.us.espocrm.com/',
        crmUsername: process.env.PWG_CRM_USERNAME,
        crmPassword: process.env.PWG_CRM_PASSWORD,

        // Email
        smtpHost: clientOverrides.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com',
        smtpPort: clientOverrides.smtpPort || parseInt(process.env.SMTP_PORT || '587'),
        smtpSecure: clientOverrides.smtpSecure || false,
        gmailUser: process.env.GMAIL_USER || '',
        gmailAppPassword: process.env.GMAIL_APP_PASSWORD || '',
        emailFrom: process.env.PWG_EMAIL_FROM || '',
        emailTo: (process.env.PWG_EMAIL_ID || '').split(',').map(e => e.trim()).filter(Boolean),
        emailCc: process.env.PWG_EMAIL_CC || '',

        // Execution
        headless: clientOverrides.headless ?? (process.env.HEADLESS === 'true' || !!process.env.CI),
        workers: clientOverrides.workers || parseInt(process.env.WORKERS || '1'),
        retries: clientOverrides.retries ?? (process.env.CI ? 2 : 0),
        timeout: clientOverrides.timeout || parseInt(process.env.TEST_TIMEOUT || '300000'),
        browsers: clientOverrides.browsers || ['chromium'],

        // Reporting
        reporters: clientOverrides.reporters || ['line', 'html', 'allure-playwright'],
        allureEnabled: clientOverrides.allureEnabled ?? true,
        emailReportEnabled: clientOverrides.emailReportEnabled ?? true,

        // CI/CD
        isCI: !!process.env.CI,
        buildUrl: process.env.BUILD_URL,
        buildNumber: process.env.BUILD_NUMBER,
    };

    return config;
}

/**
 * Get the singleton config instance
 */
let _config: FrameworkConfig | null = null;

export function config(clientConfigPath?: string): FrameworkConfig {
    if (!_config) {
        _config = getConfig(clientConfigPath);
    }
    return _config;
}

/**
 * Reset config (useful for testing)
 */
export function resetConfig(): void {
    _config = null;
}
