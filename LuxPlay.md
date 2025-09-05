# LuxPlay Project Documentation

## 1. Overview

LuxPlay is a decentralized finance (DeFi) platform built on the blockchain, designed to offer users a variety of ways to earn rewards through staking, participating in prize programs, and engaging with a referral system. The platform has recently undergone a significant migration from its v1 (Destiny) to v2 (LuxPlay/Play Hub), which streamlined its architecture, removed the binary system, and introduced new features like a token swap.

### Key Features

- **Staking and Prize Program**: Users can stake PLAY tokens in different plans to earn rewards based on an Annual Percentage Yield (APY).
- **Referral Program**: Users can invite others to the platform and earn referral rewards.
- **Token Swap**: A dedicated page allows users to swap USDT for PLAY tokens.
- **Decentralized and Secure**: The platform is built on smart contracts, ensuring transparency and security.

## 2. Architecture and Technology Stack

### Frontend

- **Framework**: Next.js (with App Router)
- **Language**: TypeScript
- **UI Library**: shadcn/ui
- **Web3 Integration**: wagmi and viem
- **State Management**: Zustand
- **Validation**: Zod

### Smart Contracts

- **Language**: Solidity
- **Key Contracts**: ActivePool, User, PlaySwap, Oracle

## 3. Smart Contracts

The core logic of LuxPlay is encapsulated in a set of smart contracts. Here is an overview of the main contracts and their roles:

### ActivePool Contract

This is the central contract for managing staking, rewards, and referrals.

- **Key Functions**:
  - `deposit(stake, plan)`: Allows users to stake PLAY tokens into a specific plan.
  - `claimRewards(amount)`: Allows users to claim their earned rewards.
  - `claimReferralRewards(amount)`: Allows users to claim their referral rewards.
  - `moveWarmUpToActivePool()`: Activates staked tokens after a warmup period.
  - `secondsUntilNextEpoch()`: Provides the countdown to the next reward distribution.
  - `viewUserTotals(user)`: Returns key metrics for a user, such as active amount and warmup balance.
  - `userInfo(user)`: Returns information about a user's stake and rewards.

### User Contract

This contract manages user registration and the referral network.

- **Key Functions**:
  - `register(sponsor)`: Registers a new user with a sponsor.
  - `isRegistered(user)`: Checks if a user is registered.
  - `getUpline(user, level)`: Retrieves the upline of a user at a specific level.

### PlaySwap Contract

This contract facilitates the swapping of USDT for PLAY tokens.

- **Key Functions**:
  - `swapAndDonate(amountIn)`: Swaps USDT for PLAY tokens and donates a portion to the prize pool.
  - `previewBuyWithDonation(amountIn)`: Provides a preview of the swap, including the expected output and donation amount.
  - `getSwapConfig()`: Returns the configuration for the swap, including token addresses and fees.

### Oracle Contract

This contract provides the price feed for PLAY tokens in USD.

- **Key Functions**:
  - `getPrice()`: Returns the current price of the PLAY token.

### ABIs

The full ABIs for these contracts can be found in the `/abi` directory of the project.

## 4. Frontend

The frontend is a Next.js application with a clear and organized structure.

### Directory Structure

```
/app
  /connect/page.tsx
  /prize-program/page.tsx
  /invite/page.tsx
  /swap/page.tsx
  layout.tsx
  providers.tsx
/abi
  ...
/components/ui
  ...
/lib
  addresses.ts
  utils.ts
```

### Main Pages

- **`/connect`**: The landing page where users can connect their wallet and register.
- **`/prize-program`**: The main dashboard where users can stake, claim rewards, and see their stats.
- **`/invite`**: The page for the referral program, where users can see their network and claim referral rewards.
- **`/swap`**: The page for swapping USDT to PLAY tokens.

## 5. Data Flow and User Journeys

### User Registration

1.  User connects their wallet.
2.  The app checks if the user is registered using `User.isRegistered()`.
3.  If not registered, the user is prompted to enter a sponsor address.
4.  The user calls `User.register(sponsor)` to register.

### Staking and Claiming Rewards

1.  User navigates to the `/prize-program` page.
2.  User enters the amount to stake and selects a plan.
3.  The app calls `ActivePool.deposit(amount, plan)`.
4.  To claim rewards, the user calls `ActivePool.claimRewards(amount)`.

## 6. Migration from Destiny v1

The migration from Destiny v1 to LuxPlay involved several key changes:

- **Removal of the Binary Pool**: All logic related to the binary tree and associated caps has been removed and replaced with a more streamlined system in the ActivePool contract.
- **Token Consolidation**: The BITZ and LGNX tokens have been replaced by a single PLAY token.
- **New PlaySwap Contract**: A dedicated contract for swapping USDT to PLAY has been introduced.

## 7. Setup and Development

### Environment Setup

1.  Clone the repository.
2.  Install the dependencies: `npm install`
3.  Create a `.env.local` file in the root of the project and add the following environment variables:

```
NEXT_PUBLIC_RPC_URL=YOUR_ALCHEMY_RPC_URL
NEXT_PUBLIC_ACTIVE_POOL=0x5096e5b307aa42bb55286408eb23f4f3e0a8dec3
NEXT_PUBLIC_USER_CONTRACT=0x6401c5eC1cAB00bc5eb737D62cf5AE1D23d4F7A9
NEXT_PUBLIC_PLAY_TOKEN=0xCE133957d679C217EA7a6Aa3A6a7c349735a523D
NEXT_PUBLIC_USDT_TOKEN=0x6220350478F6A5f815D109f360cFE30581adB1b7
NEXT_PUBLIC_PLAYSWAP=0xd5af5a8a508aD6758B88960ECC8696934C38B690
NEXT_PUBLIC_ORACLE=0x892f173286f773AAD2700fa5703cbB0AF2f949c1
```

### Running the Project

```bash
npm run dev
```

## 8. Security Considerations

- **Secrets Management**: Never commit private keys or API keys to the repository. Use environment variables for all secrets.
- **Smart Contract Audits**: The smart contracts should be audited by a reputable third-party security firm before deployment to production.
- **Frontend Security**: Follow best practices for frontend security, including input validation and protection against common vulnerabilities like XSS.
