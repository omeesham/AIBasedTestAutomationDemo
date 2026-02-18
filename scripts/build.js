#!/usr/bin/env node

/**
 * Enterprise Framework Build Script
 * 
 * Compiles TypeScript source to JavaScript in dist/ directory.
 * Part of the build pipeline: build → obfuscate → package
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SRC = path.join(ROOT, 'src');

console.log('╔══════════════════════════════════════════╗');
console.log('║  Enterprise Playwright Framework Build   ║');
console.log('╚══════════════════════════════════════════╝');
console.log('');

// Step 1: Clean dist directory
console.log('Step 1: Cleaning dist/ directory...');
if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true, force: true });
}
fs.mkdirSync(DIST, { recursive: true });
console.log('  ✅ dist/ cleaned');

// Step 2: Compile TypeScript
console.log('\nStep 2: Compiling TypeScript...');
try {
    execSync('npx tsc --project tsconfig.build.json', {
        cwd: ROOT,
        stdio: 'inherit'
    });
    console.log('  ✅ TypeScript compiled');
} catch (error) {
    console.error('  ❌ TypeScript compilation failed');
    process.exit(1);
}

// Step 3: Copy necessary non-TS files
console.log('\nStep 3: Copying assets...');

const filesToCopy = [
    { src: 'package.json', dest: 'package.json' },
    { src: 'playwright.config.ts', dest: 'playwright.config.ts' },
];

for (const file of filesToCopy) {
    const srcPath = path.join(ROOT, file.src);
    const destPath = path.join(DIST, file.dest);
    
    if (fs.existsSync(srcPath)) {
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(srcPath, destPath);
        console.log(`  ✅ Copied ${file.src}`);
    } else {
        console.log(`  ⚠️  Skipped ${file.src} (not found)`);
    }
}

// Step 4: Generate build info
console.log('\nStep 4: Generating build info...');
const buildInfo = {
    version: require(path.join(ROOT, 'package.json')).version,
    buildDate: new Date().toISOString(),
    buildNumber: process.env.BUILD_NUMBER || 'local',
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
};

fs.writeFileSync(
    path.join(DIST, 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
);
console.log('  ✅ Build info generated');

// Step 5: Summary
console.log('\n' + '─'.repeat(45));
console.log('Build completed successfully!');
console.log(`  Output:  ${DIST}`);
console.log(`  Version: ${buildInfo.version}`);
console.log(`  Date:    ${buildInfo.buildDate}`);

// List dist contents
const distFiles = [];
function walkDir(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkDir(fullPath, prefix + entry.name + '/');
        } else {
            distFiles.push(prefix + entry.name);
        }
    }
}
walkDir(DIST);

console.log(`\n  Files (${distFiles.length}):`);
for (const file of distFiles) {
    const size = fs.statSync(path.join(DIST, file)).size;
    const sizeStr = size > 1024 ? `${(size / 1024).toFixed(1)} KB` : `${size} B`;
    console.log(`    📄 ${file} (${sizeStr})`);
}
console.log('─'.repeat(45));
