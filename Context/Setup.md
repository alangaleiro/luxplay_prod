# Setup LuxPlay Frontend - Next.js + shadcn/ui + wagmi

Configuração para o frontend LuxPlay usando os ABIs mais recentes do Play Hub v2.

⚠️ **IMPORTANTE**: Use os ABIs do Play Hub v2, não os do Destiny:
- ABI Play Hub (Active Pool Contract)v2.md
- ABI Play Hub (User Contract)v2.md  
- ABI Play Hub (Play Token Contract)v2.md
- ABI Play Hub (PlaySwap Contract)v2.md
- ABI Play Hub (USDT Fake Contract)v2.md

Setup em Next.js App Router com shadcn/ui e wagmi/viem para o frontend LuxPlay.

Criar um arquivo globals.css para que eu possa gerenciar os componentes do shadcn/ui.

🛠 Setup inicial
# criar projeto
npx create-next-app@latest luxplay-frontend --ts --eslint --app

# entrar no projeto
cd luxplay-frontend

# instalar dependências Web3 + utilitários
npm install wagmi viem zustand zod

# instalar shadcn/ui
npx shadcn@latest init

# adicionar componentes principais do shadcn
npx shadcn@latest add button input card select toggle-group badge sheet

📂 Estrutura recomendada
/app
  /connect/page.tsx         # Tela Connect & Sponsor
  /prize-program/page.tsx   # Tela Prize Program
  /invite/page.tsx          # Tela Invite Program
  /buy/page.tsx             # Tela Buy PLAY (PlaySwap)
  /api/oracle/price/route.ts # Endpoint server p/ cache do preço
  layout.tsx
  providers.tsx              # WagmiConfig + ThemeProvider
/abi
  ActivePool.json           # Play Hub v2
  User.json                 # Play Hub v2
  PlayToken.json            # PLAY token
  PlaySwap.json             # PlaySwap contract
  Oracle.json               # Uniswap Oracle
  USDT.json                 # USDT token
/lib
  addresses.ts
  utils.ts
/components/ui/             # shadcn/ui (gerado pelo CLI)

⚙️ Providers globais (app/providers.tsx)
'use client';

import { WagmiConfig, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet } from 'wagmi/chains';
import { ThemeProvider } from '@/components/theme-provider';

const config = createConfig({
  chains: [mainnet], // trocar pela chain correta
  transports: { [mainnet.id]: http() }
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}


e no layout.tsx:

import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

🔗 Estrutura das páginas
/connect/page.tsx

Button para Connect Wallet

Verifica isRegistered(user) (UserContract)

Se não registrado → mostra Input sponsor + Button “Insert Sponsor”

/prize-program/page.tsx

ActionBar: ToggleGroup (Burn/Redeem), Input amount, Button CTA

Burn → deposit(amount, plan)

Redeem → claimRewards(amount)

Sync Data → checkpoint()

Cards:

Countdown → secondsUntilNextEpoch()

Global Value Burned → totalActive() × getPrice()

Burned, Active Prize → userInfo()

Claimable → pendingRewards()

Warmup → viewUserTotals()

Upgrade → upgradePlan(plan)

/invite/page.tsx

Invite Program:

My Total Burned → userInfo()[1] (ActivePool)

Available → referralPendingReward() (ActivePool)

Claim → claimReferralRewards(amount) (ActivePool)

Total Received → totalReferralAccrued() (ActivePool)

Remaining Cap → viewRemainingReferralCapPct(user) (ActivePool)

Networking Levels → viewDownlineActiveCount, viewDownlineStakeByLevelAndPlan (ActivePool)

/buy/page.tsx

Buy PLAY (PlaySwap):

Form From/To + approve(USDT → PlaySwap)

previewBuyWithDonation(amountIn) → mostrar expectedOut, minOut, donateAmt

swapAndDonate(amountIn) → executar swap

📚 utils.ts
export const toWei = (value: string, decimals = 18) =>
  BigInt(Math.floor(Number(value) * 10 ** decimals));

export const fromWei = (value: bigint, decimals = 18) =>
  Number(value) / 10 ** decimals;

export const formatUSD = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export const planEpochRatePct = (plan: 0|1|2): number => {
  return plan === 0 ? 0.1267 :
         plan === 1 ? 0.1842 :
         0.2413; // per epoch - exact values
};

✅ Próximos passos

Colocar os ABIs que você já tem na pasta /abi.

Criar addresses.ts com os endereços reais dos contratos.

Implementar cada página com base nos skeletons que já te passei.

Usar o Cursor AI:

Copie o spec de cada tela e peça para gerar o React code usando shadcn/ui.

Ajuste os functionName de acordo com o ABI real (às vezes muda case: checkPoint vs checkpoint).

Testar com wagmi no modo testnet primeiro.

