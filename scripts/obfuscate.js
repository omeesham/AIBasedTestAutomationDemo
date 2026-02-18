#!/usr/bin/env node

/**
 * Enterprise Framework Obfuscation Script
 * 
 * Obfuscates compiled JavaScript in dist/ to protect source code.
 * Uses javascript-obfuscator to prevent reverse engineering.
 * 
 * Part of the build pipeline: build → obfuscate → package
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '..', 'dist');

console.log('╔══════════════════════════════════════════════╗');
console.log('║  Enterprise Framework — Code Obfuscation     ║');
console.log('╚══════════════════════════════════════════════╝');
console.log('');

// Obfuscation configuration
const obfuscationOptions = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 0.75,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 4,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
    unicodeEscapeSequence: false,
    target: 'node'
};

/**
 * Find all .js files in a directory recursively
 */
function findJsFiles(dir) {
    const results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...findJsFiles(fullPath));
        } else if (entry.name.endsWith('.js') && !entry.name.endsWith('.obf.js')) {
            results.push(fullPath);
        }
    }
    
    return results;
}

/**
 * Obfuscate a single file
 */
function obfuscateFile(filePath) {
    const fileName = path.relative(DIST, filePath);
    
    try {
        const code = fs.readFileSync(filePath, 'utf-8');
        const obfuscationResult = JavaScriptObfuscator.obfuscate(code, obfuscationOptions);
        
        // Save obfuscated version with .obf.js extension
        const obfuscatedPath = filePath.replace('.js', '.obf.js');
        fs.writeFileSync(obfuscatedPath, obfuscationResult.getObfuscatedCode());
        
        // Replace original with obfuscated
        fs.copyFileSync(obfuscatedPath, filePath);
        fs.unlinkSync(obfuscatedPath);
        
        const originalSize = Buffer.byteLength(code);
        const obfuscatedSize = Buffer.byteLength(obfuscationResult.getObfuscatedCode());
        const ratio = ((obfuscatedSize / originalSize) * 100).toFixed(0);
        
        console.log(`  ✅ ${fileName} (${ratio}% of original)`);
        return true;
    } catch (error) {
        console.error(`  ❌ ${fileName}: ${error.message}`);
        return false;
    }
}

// Main execution
if (!fs.existsSync(DIST)) {
    console.error('❌ dist/ directory not found. Run build first: node scripts/build.js');
    process.exit(1);
}

const jsFiles = findJsFiles(DIST);

if (jsFiles.length === 0) {
    console.log('No .js files found in dist/');
    process.exit(0);
}

console.log(`Found ${jsFiles.length} JavaScript file(s) to obfuscate:\n`);

let successCount = 0;
let failCount = 0;

for (const file of jsFiles) {
    if (obfuscateFile(file)) {
        successCount++;
    } else {
        failCount++;
    }
}

console.log('\n' + '─'.repeat(50));
console.log(`Obfuscation complete: ${successCount} succeeded, ${failCount} failed`);
console.log('─'.repeat(50));

if (failCount > 0) {
    process.exit(1);
}
