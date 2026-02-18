#!/usr/bin/env node

/**
 * Enterprise Playwright Framework — CLI Entry Point
 * 
 * Usage:
 *   npx epf run                              # Run all tests
 *   npx epf run --config configs/client1.json # Run with client config
 *   npx epf run --test lead.spec.ts           # Run specific test file
 *   npx epf run --grep "TC01"                 # Run tests matching pattern
 *   npx epf run --headed                      # Run in headed mode
 *   npx epf run --project chromium            # Run specific browser
 *   npx epf license --generate                # Generate license key
 *   npx epf license --validate                # Validate current license
 *   npx epf report                            # Generate Allure report
 *   npx epf version                           # Show framework version
 * 
 * This file is compiled and obfuscated in dist/ for client distribution.
 */

import { FrameworkRunner, RunOptions } from './core/runner';
import { checkLicense, generateLicenseKey, getMachineId } from './core/license';
import { Logger } from './utils/logger';

const logger = new Logger('CLI');
const VERSION = '1.0.0';

interface CliArgs {
    command: string;
    options: Record<string, string | boolean>;
}

/**
 * Parse CLI arguments
 */
function parseArgs(argv: string[]): CliArgs {
    const args = argv.slice(2); // remove node + script path
    const command = args[0] || 'help';
    const options: Record<string, string | boolean> = {};

    for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const key = arg.replace('--', '');
            const nextArg = args[i + 1];
            if (nextArg && !nextArg.startsWith('--')) {
                options[key] = nextArg;
                i++;
            } else {
                options[key] = true;
            }
        }
    }

    return { command, options };
}

/**
 * Show help text
 */
function showHelp(): void {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║       Enterprise Playwright Framework v${VERSION}            ║
╚══════════════════════════════════════════════════════════╝

USAGE:
  npx epf <command> [options]

COMMANDS:
  run         Execute test suite
  license     License management
  report      Generate Allure report
  version     Show version
  help        Show this help

RUN OPTIONS:
  --config <path>     Client configuration file (JSON)
  --license <path>    License file path
  --test <file>       Specific test file to run
  --grep <pattern>    Filter tests by name pattern
  --headed            Run browsers in headed mode
  --project <name>    Browser project (chromium/firefox/webkit)
  --workers <n>       Parallel workers count
  --retries <n>       Retry count for failed tests
  --skip-license      Skip license check (dev only)

LICENSE OPTIONS:
  --generate          Generate license key
  --validate          Validate current license
  --machine-id        Show machine ID

EXAMPLES:
  npx epf run
  npx epf run --config configs/client1.json --headed
  npx epf run --test lead.spec.ts --grep "TC01"
  npx epf license --validate
  npx epf report
`);
}

/**
 * Handle 'run' command
 */
async function handleRun(options: Record<string, string | boolean>): Promise<number> {
    const runOptions: RunOptions = {
        configPath: options.config as string,
        licensePath: options.license as string,
        testFile: options.test as string,
        grep: options.grep as string,
        headed: !!options.headed,
        project: options.project as string,
        workers: options.workers ? parseInt(options.workers as string) : undefined,
        retries: options.retries ? parseInt(options.retries as string) : undefined,
        skipLicense: !!options['skip-license'],
    };

    const runner = new FrameworkRunner(runOptions.configPath);
    return await runner.run(runOptions);
}

/**
 * Handle 'license' command
 */
async function handleLicense(options: Record<string, string | boolean>): Promise<void> {
    if (options['machine-id']) {
        console.log(`Machine ID: ${getMachineId()}`);
        return;
    }

    if (options.generate) {
        const clientId = (options['client-id'] as string) || 'CLIENT001';
        const clientName = (options['client-name'] as string) || 'Demo Client';
        const expiresAt = (options['expires'] as string) || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const key = generateLicenseKey(clientId, clientName, expiresAt);
        console.log(`\nGenerated License Key:`);
        console.log(`  Client ID:    ${clientId}`);
        console.log(`  Client Name:  ${clientName}`);
        console.log(`  Expires At:   ${expiresAt}`);
        console.log(`  License Key:  ${key}`);
        console.log(`  Machine ID:   ${getMachineId()}`);
        console.log(`\nPlace this in your license.json file.`);
        return;
    }

    if (options.validate) {
        const result = await checkLicense(options.path as string);
        console.log(result.message);
        if (result.features) {
            console.log(`Licensed features: ${result.features.join(', ')}`);
        }
        return;
    }

    console.log('Use --generate, --validate, or --machine-id');
}

/**
 * Handle 'report' command
 */
async function handleReport(): Promise<void> {
    const runner = new FrameworkRunner();
    await runner['generateAllureReport']();
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
    const { command, options } = parseArgs(process.argv);

    switch (command) {
        case 'run':
            const exitCode = await handleRun(options);
            process.exit(exitCode);
            break;

        case 'license':
            await handleLicense(options);
            break;

        case 'report':
            await handleReport();
            break;

        case 'version':
            console.log(`Enterprise Playwright Framework v${VERSION}`);
            break;

        case 'help':
        default:
            showHelp();
            break;
    }
}

// Execute
main().catch(error => {
    logger.error('Fatal error:', error);
    process.exit(1);
});
