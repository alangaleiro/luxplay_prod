## Error Type
Build Error

## Error Message
Export usePendingRewards doesn't exist in target module

## Build Output
./Downloads/LuxPlay Front/src/app/invite/page.tsx:13:1
Export usePendingRewards doesn't exist in target module
  11 |
  12 | // Import hooks
> 13 | import { 
     | ^^^^^^^^^
> 14 |   useClaimReferralRewards,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^
> 15 |   useUserInfo,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^
> 16 |   usePendingRewards,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^
> 17 |   useViewUserTotals,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^
> 18 |   useViewRemainingReferralCapPct,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^
> 19 |   useViewDownlineActiveCount,
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^
> 20 |   useViewDownlineStakeByLevelAndPlan
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^
> 21 | } from '../../../hooks/useActivePool';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  22 | import { useFormattedPrice } from '../../../hooks/useOracle';
  23 | import { useNetworkingData } from '../../../hooks/useUserContract';
  24 | import { useNotify } from '../../../hooks/useStore';

The export usePendingRewards was not found in module [project]/Downloads/LuxPlay Front/hooks/useActivePool.ts [app-client] (ecmascript).
Did you mean to import useViewPendingReward?
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import traces:
  Client Component Browser:
    ./Downloads/LuxPlay Front/src/app/invite/page.tsx [Client Component Browser]
    ./Downloads/LuxPlay Front/src/app/invite/page.tsx [Server Component]

  Client Component SSR:
    ./Downloads/LuxPlay Front/src/app/invite/page.tsx [Client Component SSR]
    ./Downloads/LuxPlay Front/src/app/invite/page.tsx [Server Component]

Next.js version: 15.5.2 (Turbopack)
