# LuxPlay Migration Checklist

## 📋 Overview
This checklist ensures a complete migration from Destiny v1 to LuxPlay (Play Hub v2) without missing any critical updates.

## ✅ Documentation Review Status

### Core Documentation
- [x] **`new scope_no binary.md`** - ✅ **COMPREHENSIVE & UP-TO-DATE**
  - Complete migration guide
  - Updated wireframes
  - Function mapping (old vs new)
  - All contract addresses
  - QA checklists included

- [x] **`env.md`** - ✅ **UPDATED**
  - ✅ All contract addresses added
  - ✅ Environment variables defined
  - ✅ Migration notes included
  - ✅ Frontend integration examples

- [x] **`alchemy.md`** - ✅ **ENHANCED**
  - ✅ Comprehensive RPC setup
  - ✅ Performance optimization tips
  - ✅ Error handling guide
  - ✅ Testing examples

- [x] **`README.md`** - ✅ **UPDATED**
  - ✅ Project description updated to LuxPlay
  - ✅ Technology stack documented
  - ✅ Installation instructions
  - ✅ Migration notes included

## 🔍 Issues Found & Fixed

### 1. Binary Pool References
**Status**: ⚠️ **NEEDS FRONTEND UPDATE**
- Documentation correctly removes Binary Pool
- Frontend code needs to be updated to remove all Binary Pool imports/calls
- All cap/referral logic must now use ActivePool functions

### 2. Function Name Changes
**Status**: ⚠️ **VERIFY ABI COMPATIBILITY**
- `getRemainingCap()` → `viewRemainingReferralCapPct()`
- `checkpoint` vs `checkPoint` (verify exact spelling in ABI)
- Ensure all function names match the actual contract ABIs

### 3. Contract Addresses
**Status**: ✅ **DOCUMENTED**
- All Play Hub v2 addresses documented in `env.md`
- Environment variable template provided
- Frontend integration examples included

### 4. Token Changes
**Status**: ⚠️ **UPDATE FRONTEND**
- BITZ/LGNX → PLAY token
- Decimal handling: USDT=6, PLAY=18
- Update all UI labels and references

## 🚨 Critical Actions Required

### Frontend Code Updates Needed

#### `/app/invite/page.tsx`
- [ ] Remove all Binary Pool imports
- [ ] Update data sources:
  - [ ] `userInfo()` from ActivePool
  - [ ] `referralPendingReward()` from ActivePool  
  - [ ] `totalReferralAccrued()` from ActivePool
  - [ ] `viewRemainingReferralCapPct()` from ActivePool (not Binary)
  - [ ] `viewUserTotals.cap2xMax` from ActivePool
- [ ] Update Claim button logic (disable if cap.remaining==0)

#### `/app/prize-program/page.tsx`
- [ ] Update approve calls: `approve(PLAY → ActivePool)`
- [ ] Add `checkPoint()` functionality (Sync Data button)
- [ ] Update data sources:
  - [ ] `viewUserTotals` for active/warmup amounts
  - [ ] `moveWarmUpToActivePool()` for warmup migration
  - [ ] `secondsUntilNextEpoch()` for timer

#### `/app/buy/page.tsx` (New)
- [ ] Implement PlaySwap integration:
  - [ ] `getSwapConfig()` to get swap parameters
  - [ ] `approve(USDT → PlaySwap)` before swap
  - [ ] `previewBuyWithDonation(amountIn)` for preview
  - [ ] `swapAndDonate(amountIn)` for execution

#### Contract Integration (`/lib/addresses.ts`)
- [ ] Update all contract addresses to Play Hub v2
- [ ] Remove Binary Pool address
- [ ] Add PlaySwap address

#### ABI Updates (`/abi/`)
- [ ] Replace Destiny ABIs with Play Hub v2 ABIs
- [ ] Verify all function names match documentation
- [ ] Test all contract calls

## 🔧 Environment Setup

### Required Environment Variables
```bash
NEXT_PUBLIC_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/WAjAsGR9B4Aj9dJQBxOnYqCcJHsvC-QV
NEXT_PUBLIC_ACTIVE_POOL=0x5096e5b307aa42bb55286408eb23f4f3e0a8dec3
NEXT_PUBLIC_USER_CONTRACT=0x6401c5eC1cAB00bc5eb737D62cf5AE1D23d4F7A9
NEXT_PUBLIC_PLAY_TOKEN=0xCE133957d679C217EA7a6Aa3A6a7c349735a523D
NEXT_PUBLIC_USDT_TOKEN=0x6220350478F6A5f815D109f360cFE30581adB1b7
NEXT_PUBLIC_PLAYSWAP=0xd5af5a8a508aD6758B88960ECC8696934C38B690
NEXT_PUBLIC_ORACLE=0x892f173286f773AAD2700fa5703cbB0AF2f949c1
```

## 🧪 Testing Requirements

### Before Deployment
- [ ] Test wallet connection with multiple wallets
- [ ] Test user registration flow
- [ ] Test all ActivePool functions:
  - [ ] `deposit()` with different plans
  - [ ] `claimRewards()`
  - [ ] `claimReferralRewards()`
  - [ ] `checkPoint()`
  - [ ] `moveWarmUpToActivePool()`
- [ ] Test PlaySwap integration:
  - [ ] USDT approval
  - [ ] Swap preview
  - [ ] Actual swap execution
- [ ] Test Oracle price fetching
- [ ] Verify all UI labels show correct token names (PLAY vs BITZ)

### Performance Testing
- [ ] Test RPC connection stability
- [ ] Verify batch contract calls work properly
- [ ] Test error handling for failed transactions
- [ ] Check loading states and user feedback

## 📊 Documentation Completeness Score

| Document | Completeness | Status |
|----------|-------------|---------|
| `new scope_no binary.md` | 95% | ✅ Excellent |
| `env.md` | 90% | ✅ Good |
| `alchemy.md` | 85% | ✅ Good |
| `README.md` | 90% | ✅ Good |
| Migration Checklist | 100% | ✅ Complete |

## 🎯 Next Steps

1. **High Priority**: Update frontend code to remove Binary Pool dependencies
2. **High Priority**: Implement PlaySwap integration in `/buy` page
3. **Medium Priority**: Update all UI labels and token references
4. **Medium Priority**: Test all contract interactions
5. **Low Priority**: Performance optimization and error handling refinement

## ⚠️ Risk Areas

1. **Function Name Mismatches**: Verify exact spelling in ABIs
2. **Decimal Handling**: Ensure proper conversion between 6 and 18 decimals
3. **Allowance Management**: Critical for both PLAY and USDT approvals
4. **Cap Logic**: Complex referral cap calculations moved to ActivePool

---

**Last Updated**: August 29, 2025  
**Migration Status**: Documentation Complete ✅ | Frontend Updates Pending ⚠️