# LuxPlay — Guia Único de Migração e Implementação

Este arquivo consolida **todo** o contexto de migração Destiny → LuxPlay. Ele une em um só lugar: mapa de contratos, diferenças de ABI, fluxo de cadastro (sem binário), mudanças por página do frontend (Next.js App Router + shadcn/ui + wagmi), PlaySwap, configuração de RPC, wireframes ASCII e checklists de QA.

> **Status:** Definitivo v2 — baseado no `env.md` e ABIs Play Hub mais recentes.

---

## 0) TL;DR (o essencial em 8 passos)

1. **Sem Binary Pool.** Tudo que era cap/binário migrou para o **ActivePool**.
2. **Cadastro:** `User.register(sponsor)`; checar `User.isRegistered(user)`.
3. **/invite:** ler de **ActivePool**: `userInfo`, `referralPendingReward`, `totalReferralAccrued`, `viewRemainingReferralCapPct`, `viewUserTotals.cap2xMax`, e métricas de downlines (`viewDownlineActiveCount`, `viewDownlineStakeByLevelAndPlan`).
4. **/prize-program:** `deposit(amount, plan)`, `claimRewards(amount)`, `checkPoint()`, `viewUserTotals` (active/warmup/apy…), `secondsUntilNextEpoch()`, `moveWarmUpToActivePool()`.
5. **/buy:** via **PlaySwap**: `getSwapConfig`, `previewBuyWithDonation(amountIn)`, `swapAndDonate(amountIn)`; lembrar `approve(USDT → PlaySwap)`.
6. **Preço USD:** via **Oracle.getPrice()**.
7. **Decimais:** USDT (fake) 6; PLAY 18; trate tudo como `bigint` e formate com helpers.
8. **RPC dedicado:** defina `NEXT_PUBLIC_RPC_URL` e configure wagmi.

---

## 1) Mapa de Contratos / Endereços (do `.env`)

* **Active Pool (Proxy):** `0x5096e5b307aa42bb55286408eb23f4f3e0a8dec3`
* **Active Pool (Impl):** `0xcfD1A694F250c3cF1726909EFC9715E3bCac89e4`
* **User (Proxy):** `0x6401c5eC1cAB00bc5eb737D62cf5AE1D23d4F7A9`
* **User (Impl):** `0x96B7D8c808AafeF1401252990c9F17B5cD41d0B2`
* **Uniswap Oracle:** `0x892f173286f773AAD2700fa5703cbB0AF2f949c1`
* **PlaySwap:** `0xd5af5a8a508aD6758B88960ECC8696934C38B690`
* **USDT (Fake/Test):** `0x6220350478F6A5f815D109f360cFE30581adB1b7`
* **PLAY (Fake/Test):** `0xCE133957d679C217EA7a6Aa3A6a7c349735a523D`
* **Router v3:** `0xE592427A0AEce92De3Edee1F18E0157C05861564`
* **Liquidity Pair:** `0x9C17E9Cf8fEcF2f1f5390Fa915F348e4ad3ad3dc`
* **Power Pick / Reader:** `0xC8Aa24f574a78f19CcdEcff8fD022D971F0D5b0E` / `0xABb185b64b0C0381D55C5e26c4e2dfe01d77a935`
* **Sponsor default:** `0xff1d11A306cCB9AA26F1dA6C265a1f7a68F43AeC`

> Centralize em `src/lib/addresses.ts` e importe nas páginas.

---

## 2) Mudanças de ABI (Destiny → PlayHub)

### 2.1 ActivePool (leituras principais)

| Dado na UI                     | Destiny                                                     | PlayHub                                                | Ação no Front                     |
| ------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------ | --------------------------------- |
| My Total Burned (principal)    | `userInfo()[1]`                                             | **igual**                                              | exibir como PLAY                  |
| Active Prize                   | `userInfo()[0]`                                             | **igual**                                              | idem                              |
| Available (Referral)           | `referralPendingReward(user)`                               | **igual**                                              | usar no botão Claim               |
| Total Received (Referral)      | `totalReferralAccrued(user)`                                | **igual**                                              |                                   |
| Remaining Cap + %              | `ViewRemainingReferralCapPct(user)` → (pct, remaining, max) | **igual** (nomes: `percentBps`, `remaining`, `maxCap`) | converter bps para % (bps/100)    |
| Global Bonus Cap (2x)          | `viewUserTotals()[3/4]` (variação)                          | `viewUserTotals().cap2xMax`                            | padronizado                       |
| Downline Active Count          | User/Binary em v1                                           | `viewDownlineActiveCount(root)`                        | array \[15] direto                |
| Downline Stake por Nível/Plano | `ViewDownlinesStakeByPlanAndLevel`                          | `viewDownlineStakeByLevelAndPlan`                      | matriz \[3]\[15]; somar por nível |
| Timer                          | `secondsUntilNextEpoch()`                                   | **igual**                                              | formatting HH\:MM\:SS             |

**Outras utilidades**: `checkPoint()` (ou `checkpoint`), `pendingRewards`, `moveWarmUpToActivePool`, taxas por plano (RATE\_\*/SCALE).

### 2.2 User (registro e rede)

* Registro e sponsor continuam no **User**: `register(sponsor)`, `isRegistered(user)`, eventos `UserRegistered`.
* Consultas de rede (uplines/referrals) permanecem.

### 2.3 PlaySwap

* `getSwapConfig()` → `paymentToken`, `erc20Token` (PLAY), `router`, `quoter`, `powerPick`, `poolFee`, `slippageBps`, `donateInUSDT`.
* `previewBuyWithDonation(amountIn)` → `{ expectedOut, minOut, donateAmt, swapAmt }`.
* `swapAndDonate(amountIn)`.
* (Opcional) `quoteExactIn/Out(payToTarget, amount)`.

---

## 3) Fluxo de Cadastro (sem Binary Pool)

1. **Connect Wallet** (wagmi `useConnect`).
2. **Checar registro**: `User.isRegistered(user)`; se `false`, mostrar input **Sponsor**.
3. **Registrar**: `User.register(sponsor)` (validar address ≠ 0 e ≠ user).
4. **Após registrar**: /invite lê de **ActivePool** (tudo de caps/referral) e de **User** (rede quando necessário).

### Desbloqueios por nível (UI)

* `USD_depositado = MyTotalBurned × preço` (Oracle.getPrice()).
* Thresholds: L1=\$100, L2=\$200, … L15=\$1.500.
* Exibir status lock/unlock + métricas por nível.

---

## 4) Alterações por Página (Next.js App Router)

### 4.1 `/invite`

* **Remover** Binary Pool.
* **Ler** do ActivePool: `userInfo`, `referralPendingReward`, `totalReferralAccrued`, `viewRemainingReferralCapPct`, `viewUserTotals.cap2xMax`, `viewDownlineActiveCount`, `viewDownlineStakeByLevelAndPlan`.
* **Claim**: `claimReferralRewards(available)`; desabilitar se `available==0` ou `cap.remaining==0`.

### 4.2 `/prize-program`

* **Burn/Deposit**: `deposit(amount, plan)` com `approve(PLAY → ActivePool)` antes.
* **Claim**: `claimRewards(amount)` (ou Max = `pendingRewards`).
* **Sync**: `checkPoint()`.
* **Totais**: `viewUserTotals` (active, warmUpDeposit, apyReceived, cap2xMax…).
* **Timer**: `secondsUntilNextEpoch()`; **Warm-up**: `moveWarmUpToActivePool()` após 2 epochs.

### 4.3 `/buy` (PlaySwap)

* `getSwapConfig()` → mostrar `donateInUSDT`, `slippageBps` etc.
* Input **USDT** (6 decimais): `approve(USDT → PlaySwap)` → `previewBuyWithDonation(amountIn)` → `swapAndDonate(amountIn)`.
* Exibir: `expectedOut`, `minOut`, `donateAmt`.

---

## 5) RPC e Configuração

* Use um **RPC dedicado** (Alchemy/QuickNode/etc.).
* `.env.local`:

```
NEXT_PUBLIC_RPC_URL=https://<provider>/<key>
```

* `app/providers.tsx` (wagmi):

```
createConfig({
  chains: [<suaChain>],
  transports: { [<suaChain>.id]: http(process.env.NEXT_PUBLIC_RPC_URL!) }
})
```

---

## 6) Conventions & Helpers

* **Decimais**: USDT=6, PLAY=18. Converta `string → bigint` e vice versa.
* **BPS**: `% = bps/100` (ex.: 1234 bps = 12.34%).
* **Allowance**: antes de `deposit` (PLAY) e `swapAndDonate` (USDT).
* **Query gating**: `enabled: !!address` e `args` válidos em `useReadContract`.

---

## 7) Wireframes ASCII (atualizados)

### 7.1 `/invite`

```
+----------------------------------------------------------------------------------+
| Invite Program                                                                   |
|----------------------------------------------------------------------------------|
| My Total Burned: [ XXXXX PLAY ]                      USD≈ $XXXXX                 |
| Available (Referral): [ XXXXX PLAY ]        [ Claim ] (desabilitar se cap=0)     |
| Total Received: [ XXXXX PLAY ]                                                   |
| Remaining Cap: $XXXXX (YY.YY%)      Global Bonus Cap (2x): $XXXXXXXX             |
|----------------------------------------------------------------------------------|
| Levels 1–15                                                                      |
|  [Lvl 1] users: XX  volume: $XXXX  [lock/unlock]                                  |
|  [Lvl 2] users: XX  volume: $XXXX  [lock/unlock]                                  |
|   ...                                                                            |
+----------------------------------------------------------------------------------+
```

### 7.2 `/prize-program`

```
+----------------------------------------------------------------------------------+
| Prize Program                                                                     |
|----------------------------------------------------------------------------------|
| Active: XXXXX PLAY   Warm-up: XXXXX PLAY    Next Epoch in: HH:MM:SS               |
| Plan: (0)400% (1)750% (2)1400%     [ Upgrade Plan ⌄ ]                             |
| [ Amount ____ ] [ Deposit ]      [ Claim Rewards ____ ] [ Max ]                   |
| [ Sync Data ]  [ Check Prizes ]                                                  |
+----------------------------------------------------------------------------------+
```

### 7.3 `/buy` (PlaySwap)

```
+----------------------------------------------------------------------------------+
| Buy PLAY (PlaySwap)                                                               |
|----------------------------------------------------------------------------------|
| Pay with: [ USDT ] → Receive: [ PLAY ]                                           |
| Amount In [ ______ ]  [ Approve ]                                                |
| Preview: expectedOut ___  minOut ___  donateAmt ___                               |
| [ Swap & Donate ]                                                                 |
+----------------------------------------------------------------------------------+
```

---

## 8) Transcrição de Imagem (texto)

Se a imagem anexada tiver rótulos/valores específicos, cole aqui a transcrição literal (títulos/labels/valores). Use esta seção como **verdade visual** para alinhar o layout e copy da UI. Caso precise, posso extrair o texto se você reenviar a imagem com melhor definição.

---

## 9) Checklists de QA (não quebrar nada)

**/invite**

* [ ] Sem imports Binary Pool
* [ ] Leituras: `userInfo`, `referralPendingReward`, `totalReferralAccrued`, `viewRemainingReferralCapPct`, `viewUserTotals.cap2xMax`
* [ ] Claim desabilitado se `available==0` ou `cap.remaining==0`
* [ ] Downlines via `viewDownlineActiveCount`/`viewDownlineStakeByLevelAndPlan`

**/prize-program**

* [ ] `approve(PLAY → ActivePool)` antes de `deposit`
* [ ] `checkPoint()` roda antes de leituras sensíveis (opcional)
* [ ] Warm-up/Active via `viewUserTotals` + `moveWarmUpToActivePool`
* [ ] Timer correto via `secondsUntilNextEpoch`

**/buy**

* [ ] `approve(USDT → PlaySwap)` antes de `swapAndDonate`
* [ ] Mostrar `expectedOut`, `minOut`, `donateAmt`
* [ ] Tratar erros de slippage/allowance/saldo

**Infra**

* [ ] RPC dedicado em `.env`
* [ ] ABIs em `/abi` com nomes exatos
* [ ] Endereços em `lib/addresses.ts`
* [ ] Providers wagmi configurados

---

## 10) Snippets úteis (wagmi)

**Remaining Cap + %**

```ts
const { data: cap } = useReadContract({
  address: ADDR.activePool,
  abi: activePoolAbi,
  functionName: 'viewRemainingReferralCapPct',
  args: [address!],
  query: { enabled: !!address },
});
// cap.percentBps, cap.remaining, cap.maxCap
```

**Totals/Cap 2x**

```ts
const { data: totals } = useReadContract({
  address: ADDR.activePool,
  abi: activePoolAbi,
  functionName: 'viewUserTotals',
  args: [address!],
});
// totals.cap2xMax
```

**Swap (PlaySwap)**

```ts
await ensureAllowanceERC20({ token: ADDR.usdt, spender: ADDR.playSwap, min: amountInBN, ... });
writeContract({ address: ADDR.playSwap, abi: playSwapAbi, functionName: 'swapAndDonate', args: [amountInBN] });
```

---

## 11) Observações finais

* Mantive nomes de função **case-sensitive** — ajuste ao importar os ABIs .json reais.
* Se algum método tiver variação (`checkpoint` vs `checkPoint`), alinhe em uma única função utilitária que detecte e chame a assinatura correta.
* Para downlines, prefira as funções agregadoras do ActivePool v2 (quando disponíveis), pois reduzem leituras.

> Fim do guia. Copie este arquivo e entregue ao seu assistente de código para aplicar as mudanças no repositório.


O que mudou no produto (back → front)

Saiu o Binary Pool

Antes: getRemainingCap() e outras leituras vinham do Binary.

Agora: tudo vem do ActivePool (viewRemainingReferralCapPct, viewUserTotals.cap2xMax, downlines agregadas).
➜ Por isso o wireframe trocou rótulos e notas para apontar as novas fontes e evitar chamadas obsoletas.

Caps e métricas padronizados no ActivePool v2

cap200/“Global Cap” virou cap2xMax.

Remaining Cap agora mostra valor e % (exposto como percentBps).
➜ O wireframe passou a exibir Remaining Cap + % e Global Bonus Cap (2x) juntos.

Novas agregações de rede (downlines)

Em vez de misturar User/Binary, o ActivePool expõe arrays por nível (viewDownlineActiveCount, viewDownlineStakeByLevelAndPlan).
➜ O wireframe simplificou a seção Levels 1–15 (contagem e volume por nível) e removeu menção ao binário.

Token e decimais

Passagem de BITZ → PLAY, USDT(6) e PLAY(18).
➜ O wireframe e os placeholders refletem os sufixos certos (PLAY/USDT) e “USD ≈” via Oracle.

Fluxo de compra via PlaySwap

Entrou a tela/seção /buy com approve → previewBuyWithDonation → swapAndDonate.
➜ O wireframe ganhou o bloco Preview (expectedOut / minOut / donateAmt).

Nomes de funções alinhados

checkpoint/checkPoint, referralPendingReward (case) etc.
➜ O wireframe anota as funções reais para a IA gerar o código correto.

O que mudou visualmente no wireframe (UI)

/invite: blocos reordenados para: Burned → Available/Claim → Total Received → Remaining Cap(%) → Global Bonus Cap(2x) → Levels.

/prize-program: destaque para Sync Data (checkpoint), separação Burn/Deposit × Claim, e Warm-up → Move to Active.

/buy: novos campos de Approve, Preview e Swap & Donate.

Impacto direto no seu código (onde mexer)

/app/invite/page.tsx

REMOVER Binary import/leituras.

LER do ActivePool: userInfo, referralPendingReward, totalReferralAccrued, viewRemainingReferralCapPct, viewUserTotals (usar cap2xMax).

Desabilitar Claim se available==0 ou cap.remaining==0.

/app/prize-program/page.tsx

Antes de deposit, approve(PLAY → ActivePool).

checkPoint() acessível (Sync Data).

viewUserTotals.active/warmUpDeposit + moveWarmUpToActivePool.

/app/buy/page.tsx (novo fluxo)

approve(USDT → PlaySwap) → previewBuyWithDonation(amountIn) → swapAndDonate(amountIn).

resumo: o wireframe mudou para guiar o front a refletir exatamente o novo contrato (ActivePool v2 + PlaySwap), os novos nomes e o fim do Binary.