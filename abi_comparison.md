# Comparação entre ActivePool.json e @abi/activepool.md

## Funções presentes em @abi/activepool.md mas não em ActivePool.json:
1. priceOracle (variável de estado)
2. setPriceOracle (função)
3. viewPrincipalLock (função)
4. viewMyPrincipalLock (função)

## Funções presentes em ActivePool.json mas não em @abi/activepool.md:
1. setLgnxToken (função)
2. lgnxToken (variável de estado)
3. voucherCreditActive (função)

## Diferenças nas assinaturas de funções:
1. initialize:
   - @abi/activepool.md: usa `_playToken`
   - ActivePool.json: usa `_lgnxToken`

2. setToken function:
   - @abi/activepool.md: `setPlayToken`
   - ActivePool.json: `setLgnxToken`

3. Token variable:
   - @abi/activepool.md: `playToken`
   - ActivePool.json: `lgnxToken`

## Conclusão:
O arquivo ActivePool.json não está atualizado com relação ao @abi/activepool.md. Há várias funções e variáveis importantes faltando no ActivePool.json, incluindo o suporte a priceOracle e funções de visualização adicionais. Além disso, parece que houve uma mudança de nome de lgnxToken para playToken que não foi refletida no ActivePool.json.