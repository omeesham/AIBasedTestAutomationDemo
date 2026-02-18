# Enterprise Playwright Framework

Protected automation framework for enterprise distribution. Clients receive compiled/obfuscated builds — source code remains private.

## Architecture

```
YOUR COMPANY (Owner)
     │
     │  Private GitHub Repo (Source Code)
     │
     ▼  GitHub Actions Pipeline
     │
     │  Build + Minify + Obfuscate + Package
     │
     ▼  Private Artifact Storage
     │  (AWS S3 / Azure Blob / GitHub Releases)
     │
     ▼  CLIENT ENVIRONMENT
     │  Jenkins / GitHub Actions Pipeline
     │
     ▼  Run Protected Framework → Generate Reports
```

## Project Structure

```
enterprise-playwright-framework/
│
├── src/                            # SOURCE CODE (PRIVATE)
│   ├── tests/
│   │   ├── login.spec.ts           # Login test suite (POM)
│   │   └── lead.spec.ts            # Lead management tests (POM)
│   │
│   ├── pages/
│   │   ├── LoginPage.ts            # Login page object
│   │   └── LeadPage.ts             # Lead page object
│   │
│   ├── utils/
│   │   ├── config.ts               # Configuration manager
│   │   ├── logger.ts               # Structured logger
│   │   └── helpers.ts              # Generic utilities
│   │
│   ├── core/
│   │   ├── license.ts              # License validation
│   │   └── runner.ts               # Framework runner
│   │
│   ├── cli.ts                      # CLI entry point
│   ├── email-reporter.ts           # Playwright email reporter
│   └── email-util.ts               # Email utility
│
├── dist/                           # AUTO GENERATED (protected build)
│
├── configs/                        # Client configurations
│   ├── client1.json
│   └── client2.json
│
├── scripts/
│   ├── build.js                    # TypeScript compiler
│   ├── obfuscate.js                # Code obfuscation
│   └── package.js                  # Client package creator
│
├── .github/workflows/
│   └── build.yml                   # CI/CD pipeline
│
├── tests/                          # Legacy tests (kept for reference)
├── Common/                         # Legacy common methods
├── Data/                           # Test data
│
├── playwright.config.ts
├── tsconfig.json
├── tsconfig.build.json
├── package.json
└── .gitignore
```

## Quick Start

### Development (Source Code)

```bash
# Install dependencies
npm install
npx playwright install chromium

# Run enterprise tests (POM-based)
npm test

# Run specific suites
npm run test:login
npm run test:lead

# Run legacy tests
npm run test:legacy

# Run headed
npm run test:headed
```

### CLI Usage

```bash
# Run all tests
npx ts-node src/cli.ts run --skip-license

# Run with client config
npx ts-node src/cli.ts run --config configs/client1.json --skip-license

# Run specific test
npx ts-node src/cli.ts run --test lead.spec.ts --skip-license

# Filter by test name
npx ts-node src/cli.ts run --grep "TC01" --skip-license

# License management
npx ts-node src/cli.ts license --generate --client-id CLIENT001 --client-name "Acme Corp"
npx ts-node src/cli.ts license --validate
npx ts-node src/cli.ts license --machine-id

# Show version
npx ts-node src/cli.ts version
```

### Build & Distribute

```bash
# Full pipeline: build → obfuscate → package
npm run build:package

# Individual steps
npm run build              # Compile TypeScript
npm run build:obfuscate    # Build + obfuscate
npm run build:package      # Build + obfuscate + package ZIP
```

Output: `dist/enterprise-playwright-framework-v1.0.0.zip`

## Enterprise Model

| Capability | Client | Owner |
|---|---|---|
| Run tests | ✅ | ✅ |
| Get reports | ✅ | ✅ |
| See source code | ❌ | ✅ |
| Modify framework logic | ❌ | ✅ |
| Access Playwright scripts | ❌ | ✅ |

## Reports

```bash
# Allure
npm run allure:generate
npm run allure:open

# Playwright HTML report is auto-generated in playwright-report/
```

## License System

Generate a license for each client:

```bash
npx ts-node src/cli.ts license --generate \
  --client-id CLIENT001 \
  --client-name "Acme Corp" \
  --expires 2027-12-31
```

Client places the resulting `license.json` in their project root. The framework validates the license before every run.

## CI/CD

GitHub Actions workflow (`.github/workflows/build.yml`) runs on:
- Push to `main` or `release/*`
- Tags matching `v*` → creates GitHub Release
- Manual trigger via `workflow_dispatch`

Pipeline: **Checkout → Install → Build → Obfuscate → Test → Report → Package → Release**
