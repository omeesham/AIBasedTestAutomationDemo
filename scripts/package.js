#!/usr/bin/env node

/**
 * Enterprise Framework Package Script
 * 
 * Creates a distributable package for clients.
 * The package contains only compiled/obfuscated code — no source.
 * 
 * Output: dist/enterprise-playwright-framework-v{version}.zip
 * 
 * Part of the build pipeline: build → obfuscate → package
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PKG = require(path.join(ROOT, 'package.json'));
const VERSION = PKG.version || '1.0.0';

console.log('╔══════════════════════════════════════════════╗');
console.log('║  Enterprise Framework — Package for Client   ║');
console.log('╚══════════════════════════════════════════════╝');
console.log('');

// Step 1: Verify dist exists
if (!fs.existsSync(DIST)) {
    console.error('❌ dist/ not found. Run build + obfuscate first.');
    process.exit(1);
}

// Step 2: Create package directory structure
const PACKAGE_DIR = path.join(DIST, 'package');
const PACKAGE_NAME = `enterprise-playwright-framework-v${VERSION}`;

console.log(`Packaging: ${PACKAGE_NAME}`);
console.log('');

if (fs.existsSync(PACKAGE_DIR)) {
    fs.rmSync(PACKAGE_DIR, { recursive: true, force: true });
}
fs.mkdirSync(PACKAGE_DIR, { recursive: true });

// Step 3: Create client-facing package.json (sanitized)
console.log('Step 1: Creating client package.json...');
const clientPkg = {
    name: 'enterprise-playwright-framework',
    version: VERSION,
    description: 'Enterprise Playwright Test Automation Framework',
    main: 'cli.js',
    bin: {
        epf: './cli.js'
    },
    scripts: {
        test: 'node cli.js run',
        'test:headed': 'node cli.js run --headed',
        'test:ci': 'node cli.js run --skip-license',
        report: 'node cli.js report',
        'license:validate': 'node cli.js license --validate'
    },
    dependencies: PKG.dependencies || {},
    devDependencies: {
        '@playwright/test': PKG.devDependencies['@playwright/test'] || '^1.58.1',
        'allure-commandline': PKG.devDependencies['allure-commandline'] || '^2.36.0',
        'allure-playwright': PKG.devDependencies['allure-playwright'] || '^3.4.5',
    },
    engines: {
        node: '>=18.0.0'
    },
    private: true
};

fs.writeFileSync(
    path.join(PACKAGE_DIR, 'package.json'),
    JSON.stringify(clientPkg, null, 2)
);
console.log('  ✅ Client package.json created');

// Step 4: Copy compiled/obfuscated JS files
console.log('\nStep 2: Copying compiled framework files...');

function copyDirRecursive(src, dest, exclude = []) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        if (exclude.includes(entry.name)) continue;
        if (entry.name === 'package') continue; // Skip package dir itself
        
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDirRecursive(srcPath, destPath, exclude);
        } else {
            fs.copyFileSync(srcPath, destPath);
            console.log(`  📄 ${path.relative(DIST, srcPath)}`);
        }
    }
}

copyDirRecursive(DIST, PACKAGE_DIR, ['package', `${PACKAGE_NAME}.zip`]);

// Step 5: Copy playwright.config.ts
console.log('\nStep 3: Copying config files...');
const configFiles = [
    { src: 'playwright.config.ts', dest: 'playwright.config.ts' },
];

for (const file of configFiles) {
    const srcPath = path.join(ROOT, file.src);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, path.join(PACKAGE_DIR, file.dest));
        console.log(`  ✅ ${file.src}`);
    }
}

// Step 6: Create sample configs
console.log('\nStep 4: Creating sample configs...');
const configsDir = path.join(PACKAGE_DIR, 'configs');
fs.mkdirSync(configsDir, { recursive: true });

const sampleConfig = {
    projectName: 'Client Project',
    suiteName: 'UI Test Suite',
    suiteDescription: 'Regression Testing',
    crmUrl: 'https://your-crm-instance.com/',
    headless: true,
    workers: 1,
    retries: 2,
    timeout: 300000,
    browsers: ['chromium'],
    reporters: ['line', 'html', 'allure-playwright'],
    allureEnabled: true,
    emailReportEnabled: true
};

fs.writeFileSync(
    path.join(configsDir, 'sample-config.json'),
    JSON.stringify(sampleConfig, null, 2)
);
console.log('  ✅ Sample config created');

// Step 7: Create client README
console.log('\nStep 5: Creating client README...');
const clientReadme = `# Enterprise Playwright Framework v${VERSION}

## Quick Start

1. Install dependencies:
   \`\`\`bash
   npm install
   npx playwright install chromium
   \`\`\`

2. Place your \`license.json\` in the project root

3. Configure your settings:
   - Copy \`configs/sample-config.json\` to \`configs/my-config.json\`
   - Update with your environment details

4. Run tests:
   \`\`\`bash
   npm test
   # or
   node cli.js run --config configs/my-config.json
   \`\`\`

## CLI Commands

| Command | Description |
|---------|-------------|
| \`node cli.js run\` | Run all tests |
| \`node cli.js run --config <path>\` | Run with client config |
| \`node cli.js run --headed\` | Run in headed mode |
| \`node cli.js run --test <file>\` | Run specific test file |
| \`node cli.js run --grep "pattern"\` | Filter tests by name |
| \`node cli.js report\` | Generate Allure report |
| \`node cli.js license --validate\` | Validate license |
| \`node cli.js version\` | Show version |

## Environment Variables

Create a \`.env\` file in the project root:

\`\`\`
PWG_ENV_PROJECT=YourProject
PWG_ENV_SUITE_NAME=Your Test Suite
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
PWG_EMAIL_FROM=your-email@gmail.com
PWG_EMAIL_ID=recipient@email.com
PWG_EMAIL_CC=cc@email.com
\`\`\`

## Reports

- **Playwright Report**: \`playwright-report/index.html\`
- **Allure Report**: Run \`node cli.js report\` then open \`allure-report/index.html\`

## Support

Contact your framework provider for license renewal or technical support.
`;

fs.writeFileSync(path.join(PACKAGE_DIR, 'README.md'), clientReadme);
console.log('  ✅ Client README created');

// Step 8: Create .env.example
const envExample = `# Project Configuration
PWG_ENV_PROJECT=YourProject
PWG_ENV_SUITE_NAME=Your Test Suite
PWG_ENV_SUITE_DESC=Regression Testing

# CRM Configuration
PWG_CRM_URL=https://your-crm-instance.com/

# Email Configuration
GMAIL_USER=
GMAIL_APP_PASSWORD=
PWG_EMAIL_FROM=
PWG_EMAIL_ID=
PWG_EMAIL_CC=
`;

fs.writeFileSync(path.join(PACKAGE_DIR, '.env.example'), envExample);
console.log('  ✅ .env.example created');

// Step 9: Create ZIP archive
console.log('\nStep 6: Creating ZIP archive...');
const zipPath = path.join(DIST, `${PACKAGE_NAME}.zip`);
try {
    if (process.platform === 'win32') {
        execSync(`powershell -Command "Compress-Archive -Path '${PACKAGE_DIR}\\*' -DestinationPath '${zipPath}' -Force"`, { stdio: 'inherit' });
    } else {
        execSync(`cd "${PACKAGE_DIR}" && zip -r "${zipPath}" .`, { stdio: 'inherit' });
    }
    
    const zipSize = fs.statSync(zipPath).size;
    const zipSizeStr = zipSize > 1024 * 1024 
        ? `${(zipSize / (1024 * 1024)).toFixed(1)} MB` 
        : `${(zipSize / 1024).toFixed(1)} KB`;
    
    console.log(`  ✅ Package created: ${zipPath} (${zipSizeStr})`);
} catch (error) {
    console.error('  ❌ ZIP creation failed:', error.message);
    console.log('  Package directory is still available at: ' + PACKAGE_DIR);
}

// Summary
console.log('\n' + '═'.repeat(50));
console.log('Package ready for distribution!');
console.log(`  📦 ${PACKAGE_NAME}`);
console.log(`  📁 ${PACKAGE_DIR}`);
if (fs.existsSync(zipPath)) {
    console.log(`  📨 ${zipPath}`);
}
console.log('═'.repeat(50));
