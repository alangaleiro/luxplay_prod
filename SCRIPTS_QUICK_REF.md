# Quick Reference: Development Scripts

## Newly Added Diagnostic Scripts

| Script Name | Command | Purpose |
|-------------|---------|---------|
| Preflight Check | `npm run preflight` | Basic environment and connection verification |
| Environment Check | `npm run env-check` | Detailed environment variable validation |
| Wallet Test | `npm run wallet-test` | WalletConnect and wallet detection testing |
| MetaMask Diagnosis | `npm run metamask-diag` | Specific MetaMask connection issue diagnosis |
| Dependency Check | `npm run dep-check` | Check for outdated critical dependencies |
| Full Test Suite | `npm run full-test` | Run all diagnostic scripts sequentially |

## Quick Troubleshooting Commands

```bash
# Run before starting development
npm run preflight

# Diagnose MetaMask connection issues
npm run metamask-diag

# Check environment configuration
npm run env-check

# Verify wallet connectivity
npm run wallet-test

# Check for dependency updates
npm run dep-check

# Run complete diagnostic suite
npm run full-test
```

## Development Commands

```bash
# Standard development (with preflight checks)
npm run dev

# Quick development (skip checks)
npm run dev:quick

# Production build
npm run build

# Code linting
npm run lint
```

## File Locations

All diagnostic scripts are located in:
```
/scripts/
  ├── preflight-check.js
  ├── environment-check.js
  ├── wallet-test.js
  ├── metamask-diagnosis.js
  ├── dependency-check.js
  ├── full-test.js
  ├── README.md
  └── USAGE_GUIDE.md
```

## Common Issues These Scripts Help Diagnose

1. **WalletConnect Configuration Problems**
   - Invalid Project IDs
   - Missing domain registrations
   - Incorrect RPC URLs

2. **MetaMask Connection Issues**
   - "Lost connection" errors
   - Authorization failures (code 4100)
   - Permission problems

3. **Environment Misconfiguration**
   - Missing environment variables
   - Incorrect contract addresses
   - Malformed Ethereum addresses

4. **Dependency Version Conflicts**
   - Outdated critical packages
   - Breaking changes in major versions
   - Peer dependency conflicts

These scripts provide automated verification to catch configuration issues early in the development process.