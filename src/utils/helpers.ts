import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Logger } from './logger';

const logger = new Logger('Helpers');

/**
 * Enterprise Framework Helpers
 * 
 * Generic utility functions used across the framework.
 * Protected in distribution builds.
 */

/**
 * Ensure a directory exists, creating it recursively if needed
 */
export function ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        logger.debug(`Created directory: ${dirPath}`);
    }
}

/**
 * Save content to a file, creating parent directories if needed
 */
export function saveFile(filePath: string, content: string): void {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content, 'utf-8');
    logger.info(`File saved: ${filePath}`);
}

/**
 * Read JSON file safely
 */
export function readJson<T = any>(filePath: string): T | null {
    try {
        if (!fs.existsSync(filePath)) {
            logger.warn(`JSON file not found: ${filePath}`);
            return null;
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content) as T;
    } catch (error) {
        logger.error(`Failed to read JSON: ${filePath}`, error);
        return null;
    }
}

/**
 * Get current username from environment
 */
export function getUsername(): string {
    return process.env.USER || process.env.USERNAME || 'Automation User';
}

/**
 * Get hostname
 */
export function getHostname(): string {
    return os.hostname();
}

/**
 * Format duration from milliseconds to human-readable string
 */
export function formatDuration(durationMs: number): string {
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}

/**
 * Calculate pass rate percentage
 */
export function calculatePassRate(passed: number, total: number): string {
    if (total === 0) return '0%';
    return `${((passed / total) * 100).toFixed(1)}%`;
}

/**
 * Format console table for lead data
 */
export function formatLeadsConsoleTable(newLeadsData: Array<any>): string {
    let output = '\n';
    output += '='.repeat(120) + '\n';
    output += '                              NEW LEADS - LAST 7 DAYS\n';
    output += '='.repeat(120) + '\n';
    output += `${'Name'.padEnd(25)} | ${'Status'.padEnd(15)} | ${'Email'.padEnd(30)} | ${'Phone'.padEnd(18)} | ${'Assigned User'.padEnd(20)}\n`;
    output += '-'.repeat(120) + '\n';

    if (newLeadsData.length > 0) {
        for (const lead of newLeadsData) {
            output += `${(lead.name || '').padEnd(25)} | ${(lead.status || '').padEnd(15)} | ${(lead.email || '').padEnd(30)} | ${(lead.phone || '').padEnd(18)} | ${(lead.assignedUser || '').padEnd(20)}\n`;
        }
    } else {
        output += 'No new leads found in the last 7 days.\n';
    }

    output += '='.repeat(120) + '\n';
    output += `Total New Leads: ${newLeadsData.length}\n`;
    output += '='.repeat(120) + '\n';
    return output;
}

/**
 * Get the latest subfolder in a directory (by modification time)
 */
export async function getLatestFolder(baseFolder: string): Promise<string | null> {
    try {
        if (!fs.existsSync(baseFolder)) {
            logger.error(`Folder not found: ${baseFolder}`);
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
    } catch (error) {
        logger.error('Error reading latest folder:', error);
        return null;
    }
}

/**
 * Wait utility (replacement for page.waitForTimeout in non-page contexts)
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get project root directory
 */
export function getProjectRoot(): string {
    return process.cwd();
}

/**
 * Get report paths
 */
export function getReportPaths() {
    const root = getProjectRoot();
    return {
        playwrightReport: path.join(root, 'playwright-report', 'index.html'),
        allureResults: path.join(root, 'allure-results'),
        allureReport: path.join(root, 'allure-report'),
        outputDir: path.join(root, 'output'),
        dataDir: path.join(root, 'Data'),
    };
}
