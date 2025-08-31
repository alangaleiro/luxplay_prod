# LuxPlay Environment Configuration

## Contract Addresses (Play Hub v2)

### Core Contracts
- **Active Pool (Proxy):** `0x5096e5b307aa42bb55286408eb23f4f3e0a8dec3`
- **Active Pool (Impl):** `0xcfD1A694F250c3cF1726909EFC9715E3bCac89e4`
- **User Contract (Proxy):** `0x6401c5eC1cAB00bc5eb737D62cf5AE1D23d4F7A9`
- **User Contract (Impl):** `0x96B7D8c808AafeF1401252990c9F17B5cD41d0B2`

### Token Contracts
- **PLAY Token (Fake/Test):** `0xCE133957d679C217EA7a6Aa3A6a7c349735a523D`
- **USDT (Fake/Test):** `0x6220350478F6A5f815D109f360cFE30581adB1b7`

### DeFi Infrastructure
- **PlaySwap:** `0xd5af5a8a508aD6758B88960ECC8696934C38B690`
- **Uniswap Oracle:** `0x892f173286f773AAD2700fa5703cbB0AF2f949c1`
- **Router v3:** `0xE592427A0AEce92De3Edee1F18E0157C05861564`
- **Liquidity Pair:** `0x9C17E9Cf8fEcF2f1f5390Fa915F348e4ad3ad3dc`

### Utility Contracts
- **Power Pick:** `0xC8Aa24f574a78f19CcdEcff8fD022D971F0D5b0E`
- **Reader:** `0xABb185b64b0C0381D55C5e26c4e2dfe01d77a935`
- **Default Sponsor:** `0xff1d11A306cCB9AA26F1dA6C265a1f7a68F43AeC`

## Environment Variables (.env.local)

```bash
# RPC Configuration
NEXT_PUBLIC_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/WAjAsGR9B4Aj9dJQBxOnYqCcJHsvC-QV

# Contract Addresses
NEXT_PUBLIC_ACTIVE_POOL=0x5096e5b307aa42bb55286408eb23f4f3e0a8dec3
NEXT_PUBLIC_USER_CONTRACT=0x6401c5eC1cAB00bc5eb737D62cf5AE1D23d4F7A9
NEXT_PUBLIC_PLAY_TOKEN=0xCE133957d679C217EA7a6Aa3A6a7c349735a523D
NEXT_PUBLIC_USDT_TOKEN=0x6220350478F6A5f815D109f360cFE30581adB1b7
NEXT_PUBLIC_PLAYSWAP=0xd5af5a8a508aD6758B88960ECC8696934C38B690
NEXT_PUBLIC_ORACLE=0x892f173286f773AAD2700fa5703cbB0AF2f949c1
```

## Critical Migration Notes

⚠️ **BREAKING CHANGES:**
- **Binary Pool REMOVED**: All cap/referral data now comes from ActivePool
- **Token Decimals**: USDT=6, PLAY=18
- **Function Names**: Some functions renamed (e.g., `checkPoint` vs `checkpoint`)
- **Data Sources**: 
  - OLD: `getRemainingCap()` from Binary Pool
  - NEW: `viewRemainingReferralCapPct()` from Active Pool

## Frontend Integration

Update `src/lib/addresses.ts`:
```typescript
export const ADDRESSES = {
  activePool: '0x5096e5b307aa42bb55286408eb23f4f3e0a8dec3',
  userContract: '0x6401c5eC1cAB00bc5eb737D62cf5AE1D23d4F7A9',
  playToken: '0xCE133957d679C217EA7a6Aa3A6a7c349735a523D',
  usdtToken: '0x6220350478F6A5f815D109f360cFE30581adB1b7',
  playSwap: '0xd5af5a8a508aD6758B88960ECC8696934C38B690',
  oracle: '0x892f173286f773AAD2700fa5703cbB0AF2f949c1',
} as const;
``` 