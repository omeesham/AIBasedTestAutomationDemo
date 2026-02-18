import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Logger } from '../utils/logger';

const logger = new Logger('License');

/**
 * Enterprise License Validation Module
 * 
 * Validates client licenses before allowing framework execution.
 * This module is obfuscated in the distributed build to prevent tampering.
 * 
 * License Model:
 * - Each client receives a unique license key tied to their org
 * - License keys are validated against a hash before execution
 * - Expired or invalid licenses block framework execution
 * - License can be tied to machine ID for additional security
 */

export interface LicenseInfo {
    clientId: string;
    clientName: string;
    licenseKey: string;
    expiresAt: string;       // ISO date string
    maxUsers: number;
    features: string[];      // e.g., ['lead-tests', 'opportunity-tests', 'email-reports']
    machineId?: string;      // Optional: lock to specific machine
}

export interface LicenseValidationResult {
    valid: boolean;
    message: string;
    expiresIn?: number;      // days remaining
    features?: string[];
}

// Secret key for HMAC validation (obfuscated in dist build)
const LICENSE_SECRET = process.env.LICENSE_SECRET || 'enterprise-playwright-framework-2026';

/**
 * Generate a license key for a client
 * (Used internally by your company — never distributed)
 */
export function generateLicenseKey(clientId: string, clientName: string, expiresAt: string): string {
    const payload = `${clientId}:${clientName}:${expiresAt}`;
    const hmac = crypto.createHmac('sha256', LICENSE_SECRET);
    hmac.update(payload);
    return hmac.digest('hex');
}

/**
 * Get machine identifier for machine-locked licenses
 */
export function getMachineId(): string {
    const hostname = os.hostname();
    const platform = os.platform();
    const cpus = os.cpus().map(c => c.model).join(',');
    const raw = `${hostname}:${platform}:${cpus}`;
    return crypto.createHash('md5').update(raw).digest('hex');
}

/**
 * Validate a license
 */
export function validateLicense(license: LicenseInfo): LicenseValidationResult {
    logger.info(`Validating license for client: ${license.clientName}`);

    // 1. Check if license key matches expected hash
    const expectedKey = generateLicenseKey(license.clientId, license.clientName, license.expiresAt);
    if (license.licenseKey !== expectedKey) {
        logger.error('Invalid license key');
        return {
            valid: false,
            message: '❌ Invalid license key. Contact your framework provider.'
        };
    }

    // 2. Check expiration
    const expiresAt = new Date(license.expiresAt);
    const now = new Date();
    if (now > expiresAt) {
        logger.error(`License expired on ${license.expiresAt}`);
        return {
            valid: false,
            message: `❌ License expired on ${license.expiresAt}. Please renew.`
        };
    }

    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // 3. Check machine ID if specified
    if (license.machineId) {
        const currentMachineId = getMachineId();
        if (license.machineId !== currentMachineId) {
            logger.error('Machine ID mismatch — license is locked to a different machine');
            return {
                valid: false,
                message: '❌ License is locked to a different machine. Contact support.'
            };
        }
    }

    // 4. Warn if expiring soon
    if (daysRemaining <= 30) {
        logger.warn(`License expiring in ${daysRemaining} days`);
    }

    logger.info(`License valid — ${daysRemaining} days remaining`);
    return {
        valid: true,
        message: `✅ License valid. Expires in ${daysRemaining} days.`,
        expiresIn: daysRemaining,
        features: license.features
    };
}

/**
 * Load license from file
 */
export function loadLicense(licensePath?: string): LicenseInfo | null {
    const filePath = licensePath || path.join(process.cwd(), 'license.json');

    if (!fs.existsSync(filePath)) {
        logger.warn(`License file not found: ${filePath}`);
        return null;
    }

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content) as LicenseInfo;
    } catch (error) {
        logger.error('Failed to parse license file', error);
        return null;
    }
}

/**
 * Check if a specific feature is licensed
 */
export function isFeatureLicensed(license: LicenseInfo, feature: string): boolean {
    return license.features.includes(feature) || license.features.includes('*');
}

/**
 * Full license check — load + validate
 * Returns true if license is valid, false otherwise
 */
export async function checkLicense(licensePath?: string): Promise<LicenseValidationResult> {
    const license = loadLicense(licensePath);

    if (!license) {
        return {
            valid: false,
            message: '❌ No license file found. Place license.json in the project root.'
        };
    }

    return validateLicense(license);
}
