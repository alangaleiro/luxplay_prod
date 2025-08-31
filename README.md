# LuxPlay Frontend

A Next.js-based DeFi frontend for the LuxPlay ecosystem, featuring prize pools, referral systems, and token swapping.

## 🚀 Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **UI Components**: shadcn/ui + Radix UI
- **Web3**: wagmi + viem
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Type Safety**: TypeScript + Zod
- **Development Tools**: Custom diagnostic scripts

## 🏗️ Project Architecture

### Core Features
- **Prize Program**: Stake PLAY tokens with different APY plans (400%, 750%, 1400%)
- **Invite System**: Multi-level referral program with caps and rewards
- **Token Swap**: PlaySwap integration for USDT ↔ PLAY trading
- **Wallet Integration**: Multi-wallet support via wagmi

### Smart Contracts (Play Hub v2)
- **ActivePool**: Main staking and rewards contract
- **UserContract**: Registration and referral management  
- **PlaySwap**: Token swapping with donation mechanism
- **Oracle**: Price feeds for USD conversions

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd destiny-frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your contract addresses and RPC URL

# Run development server
npm run dev
```

## 🔧 Environment Configuration

Create `.env.local` with:

```bash
# RPC Configuration
NEXT_PUBLIC_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Contract Addresses
NEXT_PUBLIC_ACTIVE_POOL=0x5096e5b307aa42bb55286408eb23f4f3e0a8dec3
NEXT_PUBLIC_USER_CONTRACT=0x6401c5eC1cAB00bc5eb737D62cf5AE1D23d4F7A9
NEXT_PUBLIC_PLAY_TOKEN=0xCE133957d679C217EA7a6Aa3A6a7c349735a523D
NEXT_PUBLIC_USDT_TOKEN=0x6220350478F6A5f815D109f360cFE30581adB1b7
NEXT_PUBLIC_PLAYSWAP=0xd5af5a8a508aD6758B88960ECC8696934C38B690
NEXT_PUBLIC_ORACLE=0x892f173286f773AAD2700fa5703cbB0AF2f949c1
```

## 📱 Application Routes

- `/` - Home page with wallet connection
- `/connect` - Wallet connection and user registration
- `/prize-program` - Staking interface with APY plans
- `/invite` - Referral program dashboard

## 🔑 Key Migration Notes

⚠️ **Breaking Changes from Destiny v1:**

1. **Binary Pool Removed**: All functionality migrated to ActivePool
2. **Token Changes**: BITZ/LGNX → PLAY token (18 decimals)
3. **New Functions**: 
   - `viewRemainingReferralCapPct()` replaces `getRemainingCap()`
   - `viewUserTotals.cap2xMax` replaces binary cap logic
4. **PlaySwap Integration**: New token swapping mechanism

## 🛠️ Development

```bash
# Start development server with preflight checks
npm run dev

# Start development server quickly (no checks)
npm run dev:quick

# Run preflight environment check
npm run preflight

# Check environment variables and contracts
npm run env-check

# Test wallet connections
npm run wallet-test

# Diagnose MetaMask connection issues
npm run metamask-diag

# Check for dependency updates
npm run dep-check

# Run full system test
npm run full-test

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Development Scripts

This project includes several helpful scripts for development and debugging:

- **Preflight Checks**: Automatically run before starting the dev server to verify environment
- **Environment Validation**: Comprehensive check of all environment variables and contract addresses
- **Wallet Testing**: Verify WalletConnect configuration and wallet detection
- **MetaMask Diagnosis**: Specific troubleshooting for MetaMask connection issues
- **Dependency Checking**: Verify if critical dependencies need updating
- **Full System Test**: Run all checks in sequence for comprehensive validation

See [`scripts/README.md`](scripts/README.md) and [`scripts/USAGE_GUIDE.md`](scripts/USAGE_GUIDE.md) for detailed usage instructions.

## 📖 Documentation

For detailed implementation guides, see:
- [`/Context/new scope_no binary.md`](/Context/new%20scope_no%20binary.md) - Complete migration guide
- [`/Context/env.md`](/Context/env.md) - Contract addresses and environment setup
- [`/Context/alchemy.md`](/Context/alchemy.md) - RPC configuration guide
- [`DOCUMENTATION_INDEX.md`](DOCUMENTATION_INDEX.md) - Complete documentation index
- [`MIGRATION_GUIDE.md`](MIGRATION_GUIDE.md) - Migration guide and new features
- [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) - Known issues and solutions
- [`scripts/README.md`](scripts/README.md) - Development scripts documentation
- [`scripts/USAGE_GUIDE.md`](scripts/USAGE_GUIDE.md) - Detailed usage guide

## 🚀 Deployment

The app can be deployed on Vercel, Netlify, or any platform supporting Next.js:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/luxplay-frontend)

## 🤝 Contributing

1. Follow the existing code structure
2. Update documentation for any changes
3. Test with both mainnet and testnet configurations
4. Ensure proper error handling for all smart contract interactions
