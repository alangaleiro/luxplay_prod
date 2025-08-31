Frontend Integration Spec (shadcn/ui + wagmi + viem) - LuxPlay v2
1) Stack

React/Next.js, TypeScript, wagmi + viem para EVM, shadcn/ui para UI.

Zustand (ou jotai) para store global; zod para validar respostas.

BigInt para números on-chain; helpers de conversão (18 decimais PLAY, 6 decimais USDT).

2) Contratos & Funções relevantes
Active Pool (recompensas, depósitos, epochs)

deposit(stake, plan) — entrar/queimar (BURN) no plano 0/1/2

claimRewards(amount) — resgatar juros (Redeem/Claim)

claimReferralRewards(amount) — claim dos afiliados (Invite)

viewUserTotals() — retorna 6 valores; usar 2º = ActiveAmount e 3º = Warmup

userInfo() — 6 valores; 1º = Active Prize, 2º = Burned

pendingRewards(user) — Claimable (juros)

upgradePlan(uint8) — upgrade APY

checkpoint() (ou checkPoint) — sincroniza dados antes de ler

secondsUntilNextEpoch() — countdown em segundos

viewRemainingReferralCapPct(user) — cap restante + % (substitui getRemainingCap)

totalReferralAccrued(user) — total recebido via referral

referralPendingReward(user) — disponível para claim referral

viewDownlineActiveCount(user) — contagem downlines por nível [15]

viewDownlineStakeByLevelAndPlan(user) — stakes por nível/plano [3][15]

Constantes/planos: RATE_300_APY / RATE_600_APY / RATE_1200_APY, MIN_PLAN0/1/2, MIN_DEPOSIT
.

User Contract (cadastro / sponsor)

isRegistered(address), getReferrals(user), getUpline(user, level), referrals(...)
.

Oracle (preço PLAY ↔ USD)

getPrice() e ajustes com decimals0/decimals1
.

Token (PLAY / ativo)

decimals(), approve(spender, amount), balanceOf(user)
.

Em Active Pool há activePoolToken() para descobrir qual token aprovar
.

Regras de negócio (docs)

Depósito: chamar deposit(amount18, planId) (0=400%, 1=750%, 2=1400%)
.

Warmup: após 2 epochs, chamar moveWarmUpToActivePool() para ativar
.

Invite: My Total Burned = userInfo()[2]; Available = ReferralPendingRewards; Total Received = totalReferralAccrued
.

Networking: ViewDownlineCount(user, 15) (conta níveis) pelo User Contract; somas de ViewDownlinesStakeByPlanAndLevel (45 itens) por nível (1,16,31 etc.)
.

3) Modelos de dados (TypeScript)
export type PlanId = 0 | 1 | 2; // 0:300, 1:600, 2:1200

export interface PrizeSummary {
  countdownSec: number;              // secondsUntilNextEpoch()
  globalActiveTokens: bigint;        // totalActive()
  priceUsd: number;                  // oracle getPrice()
  claimable: bigint;                 // pendingRewards(user)
  activePrize: bigint;               // userInfo()[0]
  burned: bigint;                    // userInfo()[1]
  activeAmount: bigint;              // viewUserTotals()[1]
  warmupAmount: bigint;              // viewUserTotals()[2]
  epochRateBp: number;               // % por epoch conforme plano
}
4) Componentes por tela (shadcn/ui) + Props
Tela A — Wallet Connect & Sponsor

Header: Sheet (menu) + Heading

CardConnect: Card com Button “Connect Wallet”

onConnect: verifica isRegistered(addr)
; se false, abre CardSponsor.

CardSponsor: Card com Input address + Button

onInsertSponsor: chamada de registro conforme seu fluxo; valida sponsor; pode refletir via eventos UserRegistered
.

Tela B — Prize Program

ActionBar: ToggleGroup (Burn/Redeem), Input, Button Max, Button CTA

CTA (Burn): deposit(amount18, plan)

CTA (Redeem): claimRewards(amount)

CardCountdown: exibe secondsUntilNextEpoch()

CardGlobalValue: Badge + Button “Sync Data” → checkpoint()

Row Metrics:

CardApyUpgrade: Select plano + Button upgrade → upgradePlan(plan)

CardBurned: userInfo()[1]

Row Balances:

CardClaimable: pendingRewards() + botão Claim → claimRewards()

CardActivePrize: userInfo()[0]

CardWarmup: viewUserTotals()[2] (warmup), viewUserTotals()[1] (active) + Button mover → moveWarmUpToActivePool()

CardYieldInfo: mostra ActiveAmount, taxa por epoch (RATE_*) e próximo valor (Active×rate)

Tela C — Invite & Buy

Coluna Invite

CardReferrals: mostra Referrer, Referral Link (copy)

CardTotals:

My Total Burned → userInfo()[2]

Available → ReferralPendingRewards (ActivePool)

Claim → claimReferralRewards(amount=Available)

Total Received → totalReferralAccrued

CardLimits: viewRemainingReferralCapPct(user) (ActivePool)

CardNetworking (lista 1–15):

Users / level → ViewDownlineCount(user, 15) (via User Contract)

Deposits / level → somatório ViewDownlinesStakeByPlanAndLevel (índices 1,16,31 etc.)

Unlocked? comparando USD (MyTotalBurned×price) com patamares $100…$1.500

Coluna Buy

CardSwap: campos From/To + [Swap] (via Router/SDK externo)

CardNextDraw: usa cronômetro (secondsUntilNextEpoch) e pool calculado (regra do app)

CardPrizeStatus: [Check Prizes] → previewClaimableReward(user)

Cards Tickets/History/Winners: vindo do seu DB (ou indexando eventos EpochProcessed, RewardClaimed)
.

5) Helpers (utils.ts)
export const toWei = (n: string | number, decimals = 18) =>
  BigInt(Math.round(Number(n) * 10 ** 6)) * (10n ** BigInt(decimals - 6)); // evita float

export const fromWei = (v: bigint, decimals = 18) =>
  Number(v) / 10 ** decimals;

export const formatUSD = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });

export const planEpochRatePct = (plan: PlanId): number => {
  // usar percentuais do doc por epoch:
  // 400%: 0.1267%, 750%: 0.1842%, 1400%: 0.2413% :contentReference[oaicite:57]{index=57}
  return plan === 0 ? 0.126682
       : plan === 1 ? 0.177867
       : 0.234517;
};
6) Hooks (wagmi/viem)
// addresses.ts
export const ADDR = {
  activePool: '0x5096e5b307aa42bb55286408eb23f4f3e0a8dec3',
  user: '0x6401c5eC1cAB00bc5eb737D62cf5AE1D23d4F7A9',
  oracle: '0x892f173286f773AAD2700fa5703cbB0AF2f949c1',
  playToken: '0xCE133957d679C217EA7a6Aa3A6a7c349735a523D', // PLAY token
  usdtToken: '0x6220350478F6A5f815D109f360cFE30581adB1b7', // USDT token
  playSwap: '0xd5af5a8a508aD6758B88960ECC8696934C38B690', // PlaySwap contract
} as const;
// useActivePool.ts
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import activePoolAbi from './abi/ActivePool.json';

export function useCountdown() {
  return useReadContract({ address: ADDR.activePool, abi: activePoolAbi, functionName: 'secondsUntilNextEpoch' }); // :contentReference[oaicite:58]{index=58}
}

export function useCheckpoint() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const tx = () => writeContract({ address: ADDR.activePool, abi: activePoolAbi, functionName: 'checkpoint' }); // :contentReference[oaicite:59]{index=59}
  const receipt = useWaitForTransactionReceipt({ hash });
  return { tx, hash, isPending, receipt, error };
}
// approval before deposit
import erc20Abi from './abi/ERC20.json';
export async function ensureAllowance(client, owner, spender, min: bigint) {
  const allowance: bigint = await client.readContract({ address: ADDR.token, abi: erc20Abi, functionName: 'allowance', args: [owner, ADDR.activePool] }); // :contentReference[oaicite:60]{index=60}:contentReference[oaicite:61]{index=61}
  if (allowance < min) {
    const hash = await client.writeContract({ address: ADDR.token, abi: erc20Abi, functionName: 'approve', args: [spender, min] }); // :contentReference[oaicite:62]{index=62}
    await client.waitForTransactionReceipt({ hash });
  }
}
7) Página — Prize Program (skeleton com shadcn/ui)
// app/prize-program/page.tsx
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import activePoolAbi from '@/abi/ActivePool.json';
import oracleAbi from '@/abi/Oracle.json';
import { ADDR } from '@/lib/addresses';
import { fromWei, toWei, planEpochRatePct, formatUSD } from '@/lib/utils';

export default function PrizeProgramPage() {
  const { address } = useAccount();
  const [mode, setMode] = useState<'burn'|'redeem'>('burn');
  const [amount, setAmount] = useState('');
  const [plan, setPlan] = useState<0|1|2>(0);

  const { data: countdownSec } = useReadContract({ address: ADDR.activePool, abi: activePoolAbi, functionName: 'secondsUntilNextEpoch' }); // :contentReference[oaicite:63]{index=63}
  const { data: userInfo } = useReadContract({ address: ADDR.activePool, abi: activePoolAbi, functionName: 'userInfo', args: [address] }); // [activePrize, burned, ...] :contentReference[oaicite:64]{index=64}
  const { data: totals } = useReadContract({ address: ADDR.activePool, abi: activePoolAbi, functionName: 'viewUserTotals', args: [address] }); // [ , active, warmup, ...] :contentReference[oaicite:65]{index=65}
  const { data: claimable } = useReadContract({ address: ADDR.activePool, abi: activePoolAbi, functionName: 'pendingRewards', args: [address] }); // :contentReference[oaicite:66]{index=66}
  const { data: price } = useReadContract({ address: ADDR.oracle, abi: oracleAbi, functionName: 'getPrice' }); // :contentReference[oaicite:67]{index=67}

  const { writeContract, data: hash, isPending } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  const onSync = () => writeContract({ address: ADDR.activePool, abi: activePoolAbi, functionName: 'checkpoint' }); // :contentReference[oaicite:68]{index=68}

  const onSubmit = () => {
    if (mode === 'burn') {
      writeContract({ address: ADDR.activePool, abi: activePoolAbi, functionName: 'deposit', args: [toWei(amount), plan] }); // :contentReference[oaicite:69]{index=69}
    } else {
      writeContract({ address: ADDR.activePool, abi: activePoolAbi, functionName: 'claimRewards', args: [toWei(amount)] }); // :contentReference[oaicite:70]{index=70}
    }
  };

  const activePrize = userInfo?.[0] as bigint | undefined;
  const burned = userInfo?.[1] as bigint | undefined;
  const activeAmount = totals?.[1] as bigint | undefined;
  const warmup = totals?.[2] as bigint | undefined;

  const epochRate = planEpochRatePct(plan) / 100;
  const nextPrizeAmount = activeAmount ? Number(fromWei(activeAmount)) * epochRate : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {/* Action Bar */}
      <Card>
        <CardHeader><CardTitle>Action</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          <ToggleGroup type="single" value={mode} onValueChange={(v:any)=>v && setMode(v)}>
            <ToggleGroupItem value="burn">Burn</ToggleGroupItem>
            <ToggleGroupItem value="redeem">Redeem</ToggleGroupItem>
          </ToggleGroup>
          <div className="flex gap-2">
            <Input placeholder="0.0000" value={amount} onChange={e=>setAmount(e.target.value)} />
            <Button variant="secondary" onClick={()=>setAmount(String(fromWei((claimable as bigint) ?? 0n)))}>Max</Button>
            <Button onClick={onSubmit} disabled={isPending}>
              {mode === 'burn' ? 'Burn PLAY' : 'Redeem PLAY'}
            </Button>
          </div>
          {mode === 'burn' && (
            <div className="flex gap-2">
              <Select value={String(plan)} onValueChange={(v)=>setPlan(Number(v) as 0|1|2)}>
                <SelectTrigger className="w-[200px]"><SelectValue placeholder="APY Plan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">400% APY</SelectItem>
                  <SelectItem value="1">750% APY</SelectItem>
                  <SelectItem value="2">1400% APY</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={()=>writeContract({ address: ADDR.activePool, abi: activePoolAbi, functionName: 'upgradePlan', args: [plan] })}>
                Upgrade
              </Button> {/* :contentReference[oaicite:71]{index=71}:contentReference[oaicite:72]{index=72} */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Countdown + Global */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Next Rebase</CardTitle></CardHeader>
          <CardContent>⏱ {Number(countdownSec ?? 0)} s</CardContent>
        </Card>
        <Card><CardHeader className="flex justify-between"><CardTitle>Global Value Burned</CardTitle><Button onClick={onSync}>Sync Data</Button></CardHeader>
          <CardContent>
            <Badge variant="secondary">
              {formatUSD(Number(fromWei((activeAmount ?? 0n))) * Number(price ?? 0) /* simplificado */)}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle>400/750/1400% APY</CardTitle></CardHeader>
          <CardContent>Current plan rate (per-epoch): {planEpochRatePct(plan)}%</CardContent>
        </Card>
        <Card><CardHeader><CardTitle>Burned</CardTitle></CardHeader>
          <CardContent>{fromWei(burned ?? 0n)} PLAY</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader className="flex justify-between"><CardTitle>Claimable</CardTitle>
          <Button onClick={()=>writeContract({ address: ADDR.activePool, abi: activePoolAbi, functionName:'claimRewards', args:[claimable ?? 0n] })}>Claim</Button></CardHeader>
          <CardContent>{fromWei((claimable as bigint) ?? 0n)} PLAY</CardContent></Card>
        <Card><CardHeader><CardTitle>Active Prize</CardTitle></CardHeader>
          <CardContent>{fromWei(activePrize ?? 0n)} PLAY</CardContent></Card>
      </div>

      {/* Warmup & Yield */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader className="flex justify-between"><CardTitle>Warmup</CardTitle>
          <Button variant="secondary" onClick={()=>writeContract({ address: ADDR.activePool, abi: activePoolAbi, functionName:'moveWarmUpToActivePool' })}>
            Move to Active
          </Button></CardHeader>
          <CardContent>Warmup: {fromWei(warmup ?? 0n)} | Active: {fromWei(activeAmount ?? 0n)}</CardContent></Card>

        <Card><CardHeader><CardTitle>Yield Information</CardTitle></CardHeader>
          <CardContent>
            Next Epoch Yield: {planEpochRatePct(plan).toFixed(4)}% • Next Prize Amount: {nextPrizeAmount.toFixed(4)} PLAY
          </CardContent></Card>
      </div>
    </div>
  );
}

Obs.: os functionName acima refletem o doc/ABI. Em alguns ABIs o nome pode aparecer checkPoint (variação de case). Ajuste após importar o JSON real
8) Página — Invite Program (skeleton)
// app/invite/page.tsx (trechos)
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import activePoolAbi from '@/abi/ActivePool.json';
import userAbi from '@/abi/User.json';
import oracleAbi from '@/abi/Oracle.json';

function InviteProgram() {
  const { address } = useAccount();
  const { data: burned } = useReadContract({ address: ADDR.activePool, abi: activePoolAbi, functionName: 'userInfo', args: [address] }); // idx 1
  const { data: avail } = useReadContract({ address: ADDR.activePool, abi: activePoolAbi, functionName: 'referralPendingReward', args: [address] });
  const { data: totalRef } = useReadContract({ address: ADDR.activePool, abi: activePoolAbi, functionName: 'totalReferralAccrued', args: [address] });
  const { data: cap } = useReadContract({ address: ADDR.activePool, abi: activePoolAbi, functionName: 'viewRemainingReferralCapPct', args: [address] });
  const { data: price } = useReadContract({ address: ADDR.oracle, abi: oracleAbi, functionName: 'getPrice' });

  const usdDeposited = fromWei(burned?.[1] ?? 0n) * Number(price ?? 0); // MyTotalBurned x price :contentReference[oaicite:80]{index=80}

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card><CardHeader><CardTitle>Invite Program</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>My Total Burned</div><Badge>{fromWei(burned?.[1] ?? 0n)} PLAY</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>Available</div>
            <div className="flex gap-2">
              <Badge>{fromWei((avail as bigint) ?? 0n)} PLAY</Badge>
              <Button onClick={()=>writeContract({ address: ADDR.activePool, abi: activePoolAbi, functionName:'claimReferralRewards', args:[avail ?? 0n] })}>
                Claim
              </Button> {/* :contentReference[oaicite:81]{index=81} */}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>Total Received</div><Badge>{fromWei((totalRef as bigint) ?? 0n)} PLAY</Badge>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">Remaining Cap: {fromWei((cap as bigint) ?? 0n)} USD (approx)</div>
        </CardContent>
      </Card>

      {/* Networking, com sua lógica de 1..15 níveis usando ViewDownlineCount + ViewDownlinesStakeByPlanAndLevel :contentReference[oaicite:82]{index=82} */}
    </div>
  );
}
9) Página — Buy PLAY (skeleton)

Swap: via Aggregator/Router (fora do ABI).

Next Prize Draw: usa sua regra + secondsUntilNextEpoch()
.

Check Prizes: previewClaimableReward(user) devolve claimable/currentEpoch/lastEpoch
10) Fluxos críticos (passo a passo)

Depositar (Burn)

checkpoint() → sincroniza

ensureAllowance(token, activePool, amount)

deposit(amount18, plan)

Aguardar recibo; atualizar leituras.

Claim juros (Redeem)

checkpoint()

claimRewards(amount) (ou Max)

Atualizar pendingRewards, userInfo, viewUserTotals.

Warmup → Active

Mostrar viewUserTotals()[2] e countdown secondsUntilNextEpoch()

Após 2 epochs, moveWarmUpToActivePool()
.

Invite Claim

Ler ReferralPendingRewards

claimReferralRewards(amount=Available)
.

11) Estados & validações (UI)

Desabilitar CTAs se paused() de algum contrato estiver true
.

MIN_DEPOSIT / MIN_PLAN* nos inputs de Burn
.

Endereço do Sponsor: validar 0x… + isRegistered(sponsor)
.

Mostrar tooltips de taxa por plano com planFeeBP(plan)
12) Wireframes ASCII (resumo)

Prize Program
[Action: Burn/Redeem][Amount][Max][CTA]
[Countdown ⏱]  [Global Value Burned   (Sync Data)]
[APY/Upgrade]   [Burned]
[Claimable][Claim]   [Active Prize]
[Warmup: Move]       [Yield Info (Active, Rate, Next Prize)]
Invite & Buy
Invite: Referrer/Link | Totals( MyBurned, Available[Claim], Received )
Limits(Remaining Cap) | Networking Levels 1..15 (users, volume, unlocked)
Buy: From/To [Swap] | Next Draw | Check Prizes | Tickets/History/Winners
Connect & Sponsor
[Connect Wallet] -> isRegistered? else [Sponsor Address][Insert Sponsor]
13) Dossiê para a IA do Cursor (instruções curtas)

Objetivo: gerar páginas React + shadcn para 3 telas usando os hooks e funções aqui listados.

AO CRIAR COMPONENTES:

Use Card, Button, Input, Select, ToggleGroup, Badge.

Inputs numéricos: armazene como string, converta para BigInt com toWei.

Todas as leituras on-chain via useReadContract. Escritas via useWriteContract + useWaitForTransactionReceipt.

Antes de deposit, execute ensureAllowance.

Sempre que uma transação confirmar, re-ler: userInfo, viewUserTotals, pendingRewards, secondsUntilNextEpoch.

Para USD, multiplique tokens × getPrice() do Oracle, ajustando decimais.

Wallet Connect & Sponsor (com integração ao Smart Contract)
0) Metadados da Tela

Rota/ID: /connect

Layout base: coluna centralizada

Contratos envolvidos:

User Contract → registro de usuários, sponsor 



Active Pool → saldo e rewards ativos, mas só após conexão 

1) Header

Texto: LuxPlay

Menu hambúrguer (à esquerda)

2) Card Principal — Conexão de Carteira

Logo Destiny (central)

Título: DESTINY

Subtexto: Connect your wallet to start earning rewards

Botão: [ Connect Wallet ]

🔗 Backend:

Detectar provider Web3 (Metamask/WalletConnect).

Após conexão, chamar:

isRegistered(address) no User Contract para verificar se a carteira já está registrada
.

Se não estiver, solicitar Sponsor.

3) Card Sponsor

Título: Sponsor

Subtexto: Please enter the sponsor address

Input: endereço Ethereum (0x...)

Botão: [ Insert Sponsor ]

🔗 Backend:

Quando usuário clica, executar UserRegistered (evento disparado após register no User Contract)
.

Caso contrato exija árvore binária, validar posição via binarySponsor(address) no Binary Pool Contract
.

O input deve ser validado como address.

Wireframe ASCII (com ligações backend)
+------------------------------------------------------------------------------------+
| ☰                                   Destiny                                        |
+------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------+
|                                      LOGO                                          |
|                                   [ DESTINY ]                                      |
|                                                                                    |
|    Connect your wallet to start earning rewards                                    |
|                                                                                    |
|                          [ Connect Wallet ]                                        |
|                                                                                    |
|         Supported wallets: Metamask, WalletConnect                                 |
|------------------------------------------------------------------------------------|
|  [Connect Wallet] -> chama provider Web3                                           |
|                   -> verifica isRegistered(user) no User Contract                  |
|                   -> se FALSE, solicita Sponsor                                    |
+------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------+
| SPONSOR                                                                            |
| Please enter sponsor address                                                       |
| [ 0x1a55ad…a5s15d5a1 ______________________ ]                                      |
| [ Insert Sponsor ]                                                                 |
|------------------------------------------------------------------------------------|
|  [Insert Sponsor] -> executa registro via User Contract                            |
|                   -> dispara evento UserRegistered(user, referrer)                 |
|                   -> opcional: valida posição binária no BinaryPoolContract        |
+------------------------------------------------------------------------------------+


👉 Dessa forma, além da posição dos componentes visuais, já temos o mapeamento direto de cada ação para a função Solidity correspondente.



A) Destiny — Prize Program (com integração ao contrato)
Componentes & Ligações
1) Header + Toolbar

sem chamada on-chain (apenas navegação / conexão já feita)

2) Countdown “to next rebase”

secondsUntilNextEpoch() → retorna segundos; converter p/ h:m. 

3) Global Value Burned (USD)

totalActive() → quantidade em tokens; converter via Uniswap Oracle getPrice() para USD. 

4) Botão “Sync Data”

checkpoint() (ou checkPoint) para sincronizar cálculos antes de ler saldos. 

5) Card APY / Upgrade

Exibir APY atual a partir do plano do usuário.

Upgrade de plano: upgradePlan(uint8 newPlan). 

Taxas por plano (se precisar exibir): planFeeBP(planId). 

Taxas/APY por plano: RATE_300_APY / RATE_600_APY / RATE_1200_APY (por-epoch; converter conforme docs). 

6) Burned / Claimable / Active Prize

Burned: userInfo() (usar o 2º valor do retorno). 

Active Prize: userInfo() (usar o 1º valor do retorno). 

Claimable (interest): pendingRewards(address). 

7) Action (Burn/Redeem)

Burn PLAY / Entrar no plano: deposit(uint256 stake, uint8 plan) (valor com 18 casas + id do plano 0/1/2). 

Mínimos por plano (se precisar validar): MIN_PLAN0/1/2 e MIN_DEPOSIT. 

Redeem (interest): claimRewards(uint256 amount); Max = claim total. 

8) Warmup Information

viewUserTotals() → pegar 3º valor para “Warmup Balance” e 2º valor para “Active Amount”. 

Após 2 epochs: moveWarmUpToActivePool(). 

Duração de epoch / tempo corrente (se exibir): EPOCH_DURATION / epochNow / currentEpochId. 

9) Yield Information

Active Amount: viewUserTotals() (2º valor). 

Next Prize Yield (% por epoch): usar RATE_300_APY / RATE_600_APY / RATE_1200_APY conforme plano do usuário (docs já fornecem os percentuais por epoch). 

Next Prize Amount: activeAmount * nextEpochRate. 

ROI (5-Day Rate): calcular no front (5 * nextEpochRate) ou fórmula equivalente. (Sem chamada on-chain explícita.)

10) Observações/Notas

EXPIRATION_EPOCHS e outras constantes, se precisarem ser mostradas. 

Wireframe ASCII — Prize Program
+------------------------------------------------------------------------------------+
|                                   DESTINY                                          |
| [Prize Program]* [Icon A] [Icon B] [Icon C]                        0x... ●         |
+------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------+
| ACTION BAR                                                                         |
| Toggle: (BURN) (REDEEM)                                                            |
| Amount: [ 0.0000____________________ ] [Max] [ CTA ]                               |
|   CTA (Burn -> deposit(stake,plan))  (Redeem -> claimRewards(amount))              |
+------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------+
|  [ ⏱  HH:MM ]  to next rebase     ← secondsUntilNextEpoch()                        |
+------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------+
| Global Value Burned: $X,XXX,XXX  [Sync Data]                                       |
|   Sync -> checkpoint()                                                             |
|   Valor -> totalActive() × getPrice() (Uniswap Oracle)                             |
+------------------------------------------------------------------------------------+

+------------------------------+-------------------------------+
|  APY / Upgrade               |  Burned                       |
|  APY via RATE_*              |  N Bitz ← userInfo()[2]       |
|  [ Upgrade ] -> upgradePlan  |                               |
+------------------------------+-------------------------------+

+------------------------------+-------------------------------+
|  Claimable                   |  Active Prize                 |
|  X Bitz ← pendingRewards()   |  Y Bitz ← userInfo()[1]       |
|  [ Claim ] -> claimRewards   |                               |
+------------------------------+-------------------------------+

+------------------------------------------------------------------------------------+
| ACTION (local)                                                                      |
| Toggle (Burn/Redeem), Amount [____] [Max], Presets [400%][750%][1400%]             |
| [ CTA ]  -> deposit(...) ou claimRewards(...)                                      |
+------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------+
| WARMUP INFORMATION                                                                  |
| Warmup Balance ← viewUserTotals()[3]   |  Active ← viewUserTotals()[2]             |
| [ Start Program / Move ] -> moveWarmUpToActivePool()                               |
+------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------+
| YIELD INFORMATION                                                                   |
| Active Amount ← viewUserTotals()[2]                                                |
| Next Prize Yield ← RATE_* (por epoch)                                              |
| Next Prize Amount ← Active * Yield                                                 |
| [ ROI (5-Day Rate): computed ]                                                     |
+------------------------------------------------------------------------------------+

B) Destiny — Invite & Buy (com integração ao contrato)
Coluna Esquerda — Invite Program
1) Referrer / Referral Link

isRegistered(address) para checar se o usuário está ativo/registrado. 

O referrer (sponsor) vem do cadastro (evento UserRegistered), mantido no User/Binary. 

2) My Total Burned

userInfo() do Active Pool → usar o 2º retorno. 

3) Available (Referral)

ReferralPendingRewards(address) no Active Pool. 

4) Botão “Claimable”

Executa claimReferralRewards(uint256 amount); o amount deve igualar o “Available”. 

5) Total Received (Referral)

totalReferralAccrued(address) no Active Pool. 

6) Remaining Cap / Global Bonus Cap

getRemainingCap(address) no Binary Pool (cap de binário/diário/lifetime conforme regras). 

Constantes auxiliares se expostas: DAILY_BP / LIFETIME_BP_CAP. 

7) Networking (Affiliate Structure)

Número de usuários por nível (1–15): getReferrals/getUpline/referrals (ou função agregadora) no User Contract; doc indica ViewDownlineCount(user, 15). 

Depósitos da rede por nível: ViewDownlinesStakeByPlanAndLevel(user) no Active Pool; somar índices (1,16,31) para o nível 1 e seguir a tabela do doc para os demais níveis (3 planos × 15 níveis = 45 valores). 

8) Regras de desbloqueio por nível

Calcular USD depositado = MyTotalBurned * price, usando getPrice() do Oracle.

Desbloqueios crescem de $100 por nível (L1=$100 … L15=$1,500). 

Coluna Direita — Buy Bitz

Nesta seção você usa swap (DEX). O ABI do app não expõe “swap”, então o fluxo é front-end/SDK da DEX. Dados de prêmio podem vir do ActivePool, quando aplicável.

1) Form “Buy Bitz”

From (USDT) / To (BITZ): integração com agregador/Uniswap Router (fora dos ABIs fornecidos).

2) Next Prize Draw (pool e tempo)

Se o pool for “ativo do contrato”: ler saldos/variáveis do Active Pool (p.ex. totalActive/epoch) e compor no front. (Não há função explícita de “prize pool” no ABI em mãos; você pode derivar com sua regra de negócio.)

Para cronômetro é possível reutilizar secondsUntilNextEpoch(). 

3) Your Prize Status / Check Prizes

Pré-visualização: previewClaimableReward(user) → retorna claimable, currentEpoch, lastEpoch. 

4) My Tickets / Prize History / Prize Winners

Não aparecem nos ABIs; armazenar/consultar via banco do app ou subgraph.

(Você pode cruzar com events como EpochProcessed, RewardClaimed, etc., caso deseje indexar on-chain). 

Wireframe ASCII — Invite & Buy
+------------------------------------------------------------------------------------+
| CLAIM REWARD                                                                        |
| Amount [ ____ ]   [ Claimable -> claimReferralRewards(amount) ] [ Burn ]           |
+------------------------------------------------------------------------------------+

+--------------------------------------+---------------------------------------------+
| INVITE PROGRAM                       | BUY BITZ                                     |
|--------------------------------------|---------------------------------------------|
| Referrer: 0x... (UserRegistered)     | From [0.00 USDT] [Max]  To [0.00 BITZ]      |
| Referral Link: url  [ Copy ]         | [ Swap ]  (via DEX SDK)                     |
|--------------------------------------|---------------------------------------------|
| My Total Burned: X Bitz  ← userInfo()[2]                                          |
| [ Available: Y ] ← ReferralPendingRewards()  [ Claimable ] -> claimReferralRewards |
| Total Received: Z ← totalReferralAccrued()                                         |
|--------------------------------------| Next Prize Draw                              |
| Remaining Cap: $… ← getRemainingCap() (BinaryPool)                                 |
| Global Bonus Cap: … (usar constantes/fórmula)                                      |
|--------------------------------------| Your Prize Status                            |
| Networking (Affiliate Structure)     | [ Check Prizes ] -> previewClaimableReward() |
|  L1: users ← ViewDownlineCount       |---------------------------------------------|
|      vol ← ViewDownlinesStakeByPlanAndLevel (somar índices)                        |
|  ... L2..L15 idem                                                                    |
|  Unlock rule: USD = burned * price  (Oracle getPrice)                               |
|  Thresholds: L1=$100 … L15=$1,500                                                   |
|--------------------------------------| My Tickets / History / Winners (app DB)      |

Dicas de implementação (rápidas)

Orquestração de leitura: ao entrar na tela, chame checkpoint() → depois leia todos os view (minimiza valores desatualizados). 

Conversões numéricas: valores uint256 de token têm 18 casas; normalize para decimal.js/bigint.

Preço em USD: use getPrice() do Oracle e alinhe as decimals0/decimals1 para formatar corretamente. 

Segurança de UI: desabilite botões de claim/upgrade/deposit enquanto paused() do contrato estiver

