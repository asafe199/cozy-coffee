# Suco/milkshake com frutas variadas + histórico de avaliações + piloto de cafeteira por nível — design

## Intenção e porquê

Três peças independentes pedidas pelo usuário na mesma conversa, agrupadas num
documento só porque chegaram juntas — podem ser implementadas e planejadas
separadamente (inclusive em ordens diferentes, ou só algumas delas):

- **Parte A — Estação de suco com frutas variadas.** Hoje "suco" é uma receita
  genérica sem sabor: o liquidificador (`RecipeStation` + `specs.ts`) processa
  um copo instantaneamente, sem ingrediente nenhum envolvido. O usuário quer
  vários potinhos de ingrediente atrás do liquidificador (frutas + sabores de
  milkshake), o pedido pedindo uma combinação específica, e o jogador tendo
  que arrastar os ingredientes certos pra dentro antes de bater.
- **Parte B — Histórico de avaliações.** O jogo já calcula estrelas e motivos
  (`calculateReview`) a cada entrega, mas isso nunca é mostrado ao jogador
  além do número de estrelas da última entrega no HUD. O usuário quer tocar
  nas estrelinhas e ver a lista de clientes atendidos no turno, com o motivo
  de cada nota.

Ambas seguem a regra de design que domina o projeto inteiro (`CLAUDE.md`): **o
jogo nunca trava nem pune com timer duro** — escolher o ingrediente errado, ou
não terminar a tempo, nunca impede a entrega; só prejudica a nota, igual já
funciona com açúcar/manteiga/mel/molho hoje.

## Parte A — Estação de suco e milkshake

### Receitas (pesquisadas, não inventadas)

10 receitas reais, usando 9 ingredientes no total (vários ingredientes servem
mais de uma receita):

| Receita (PT)              | Ingrediente(s)         | Cor do líquido (hex, minha escolha) |
|----------------------------|-------------------------|---------------------------------------|
| Suco de Laranja            | laranja                 | `#F2A33A` (cor já usada hoje p/ juice) |
| Limonada                   | limão                    | `#E8E04A` |
| Suco de Melancia           | melancia                 | `#F2546B` |
| Suco de Manga              | manga                    | `#F7B733` |
| Suco de Abacaxi            | abacaxi                  | `#F0D43A` |
| Smoothie de Morango c/ Banana | morango + banana      | `#E67A9E` |
| Suco de Manga com Abacaxi  | manga + abacaxi           | `#F5C542` |
| Milkshake de Chocolate     | chocolate                | `#5C3A28` |
| Milkshake de Morango       | morango                  | `#F2A0C0` |
| Milkshake de Baunilha      | baunilha                 | `#F5EBDC` |

Fontes: combinações de smoothie clássicas (morango+banana, manga+abacaxi) e
sabores de milkshake clássicos (chocolate/morango/baunilha) — ver links no
chat. Morango e banana e abacaxi e manga são reaproveitados entre receitas
(só 9 potinhos, não 10+2).

**Minha chamada:** nenhuma receita vira "wrong combo" proposital tipo
laranja+banana (o usuário pediu explicitamente pra evitar isso) — todas as 10
acima são combinações reais que existem.

### Modelo de dados (`src/game/types.ts`)

Hoje `ExtraRecipe = 'juice' | 'pancakes' | 'salad'` trata as três receitas de
forma idêntica (um item, uma zona de "extra" opcional). Suco deixa de caber
nesse molde — ele precisa de **um sabor** (qual receita das 10) e de **um
conjunto de ingredientes realmente usados** (quais potinhos o jogador
arrastou), não só um boolean de extra.

- `ExtraRecipe` passa a ser só `'pancakes' | 'salad'` (sai do grupo genérico).
- Novo `JuiceFlavor` = união das 10 chaves da tabela acima (ex.: `'orange'`,
  `'lemonade'`, `'watermelon'`, `'mango'`, `'pineapple'`,
  `'strawberryBanana'`, `'mangoPineapple'`, `'milkshakeChocolate'`,
  `'milkshakeStrawberry'`, `'milkshakeVanilla'`).
- Novo `FruitId` = união dos 9 ingredientes (`'orange'`, `'lemon'`,
  `'watermelon'`, `'mango'`, `'pineapple'`, `'strawberry'`, `'banana'`,
  `'chocolate'`, `'vanilla'`).
- Novo catálogo (pode morar em `src/scenes/JuiceStation/flavors.ts`, análogo
  ao `specs.ts` de hoje):
  ```ts
  interface FlavorSpec { ingredients: FruitId[]; color: string; model: ModelData /* fruit shown in the glass, opcional */ }
  const JUICE_FLAVORS: Record<JuiceFlavor, FlavorSpec> = { ... }
  ```
- `OrderItem`'s variante de suco ganha `flavor: JuiceFlavor` (sorteado em
  `makeItem`/`orders.ts` quando a receita é `'juice'`; `wantsExtra` continua
  existindo e significando "com gelo", igual hoje — gelo continua sendo um
  extra independente do sabor).
- Novo `JuicePrep` (não é mais um `ExtraPrep`): `{ recipe: 'juice'; flavor:
  JuiceFlavor; ingredientsUsed: FruitId[]; extraAdded: boolean; processMs:
  number }`. `ItemPrep` vira `CoffeePrep | ToastPrep | JuicePrep | ExtraPrep`
  (`ExtraPrep` agora só cobre pancakes/salad).

### Avaliação (`src/game/review.ts`)

Novo branch para `item.recipe === 'juice'`: comparar o **conjunto** de
`prep.ingredientsUsed` com `JUICE_FLAVORS[item.flavor].ingredients` (ordem não
importa; ausência ou ingrediente extra errado = `wrong_flavor`, mesmo
tratamento de penalidade que os outros comentários, 1 estrela). Gelo
(`extraAdded` vs `wantsExtra`) e tempo de processo (`processMs` vs
`TOAST_MIN_MS`/`TOAST_BURN_THRESHOLD_MS`, reaproveitando as mesmas constantes
— bater pouco = "raso", bater demais = teoricamente teria "passado do ponto",
mas isso é cosmético aqui, não existe "queimar" líquido; **minha chamada:**
manter o julgamento de tempo igual pancakes por consistência, mesmo que a
palavra certa no comentário seja outra, ex. `under_blended`/`over_blended`).

### Cena nova: `JuiceStation` (não reaproveita `RecipeStation`)

A interação é fundamentalmente diferente da genérica (um item + um extra
opcional): aqui **vários ingredientes pequenos são arrastados um a um** para
dentro do liquidificador, que acumula um conjunto. Isso pede uma cena própria,
do mesmo jeito que `CoffeeStation`/`ToastStation` já são bespoke em vez de
genéricas. `RecipeStation`/`specs.ts`/`EXTRA_RECIPES` continuam existindo,
servindo só pancakes/salad.

Fluxo:
1. Potinhos de ingrediente ficam **sempre todos visíveis** numa fileira atrás
   do liquidificador (confirmado com o usuário — errar custa nota, não
   trava). Cada potinho é um pequeno `CupDraggable` independente.
2. Jogador arrasta o(s) potinho(s) certo(s) pra zona do liquidificador — isso
   acumula um `Set<FruitId>` local (não há limite de quantos ele pode tentar
   colocar; o conjunto final no momento de tocar o liquidificador é o que
   conta).
3. Toca no liquidificador → inicia o processo (mesmo padrão de
   `startRef`/tempo real da torradeira/frigideira): "bate" por um tempo,
   feedback visual (reaproveitar sacudida/vibração simples do mesh do
   liquidificador, ou um `Steam`-like efeito de "borbulha" — **deixo a
   escolha exata pro builder**, não é crítico).
4. Jogador arrasta o copo (`GLASS`, já existe) da origem pra zona do
   liquidificador pra "receber" o despejo (reaproveita `PourStream` +
   `CoffeeLiquid`, que já aceitam prop `color` — usar
   `JUICE_FLAVORS[flavor].color`), depois pra `READY_ZONE` (prato) quando
   quiser.

**Mudança de infraestrutura necessária:** `CupDraggable` hoje assume origem
fixa em `(0,0)` (constante de módulo `CUP_ORIGIN`). Pra ter N potinhos cada um
com sua própria posição de repouso, `CupDraggable` precisa de um prop opcional
`origin?: {x: number; z: number}` (default `{x:0,z:0}`, preservando o
comportamento de todo mundo que já usa o componente sem passar essa prop).

**Layout espacial dos 9 potinhos:** não cabe no layout de 3 posições de hoje
(aparelho/item/extra). **Minha chamada, deixo pro builder ajustar por
tuning:** duas fileiras de potinhos pequenos atrás do liquidificador (ex.: 5 +
4), compacto, baixo-poly, cor do próprio ingrediente indicando o que é (não
precisa de texto/label 3D — o jogo já evita texto dentro do Canvas, ver lição
#4 do `CLAUDE.md`). Visual de qual fruta é cada potinho pode ser só a cor +
uma forma simples (uma esfera laranja = laranja, um triângulo amarelo
deitado = abacaxi, etc.) até os modelos 3D reais existirem — ou já nascer
com os modelos de fruta (ver próxima seção).

### Modelos 3D

Pipeline já existente (`docs/ASSETS.md`): `.glb` CC0 → `scripts/convert-glb.cjs`
→ `models.generated.ts` → `<ModelParts>`. `ORANGE` **já está baekd** (não
usado em lugar nenhum hoje — confirmar antes de assumir que está pronto pra
uso, pode precisar reconferir escala). Faltam: limão, melancia, manga,
abacaxi, morango, banana, e dois "potes" pra sabor de milkshake (chocolate —
pode ser uma garrafinha de calda; baunilha — um potinho/baunilha em vagem).

Preferência: baixar o Kenney Food Kit (mesma fonte CC0 já licenciada pelo
projeto) e ver se já tem esses itens — é o caminho de menor atrito e mantém
consistência visual com o resto do jogo. Se faltar algum, o Blender MCP (já
conectado, versão 5.2.2 LTS) pode modelar à mão via `execute_blender_code` —
as bibliotecas de asset prontos (Poly Haven/Sketchfab/Poly Pizza) e os
geradores de IA estão desligados na conta do usuário agora, então não contar
com busca/geração automática a menos que ele ligue algum.

### i18n e economia

- Nome de cada sabor (10 chaves novas, PT/EN/ES) substitui o uso de
  `wordJuice` genérico em `describeOrder` quando `item.recipe === 'juice'`
  (passa a usar `JUICE_FLAVORS[item.flavor]` + uma chave de nome por sabor,
  não o nome genérico "Suco").
- `hintJuice` precisa reescrever pra explicar a nova mecânica.
- `ITEM_PRICES.juice` continua único pra todos os sabores (preço já é
  "puramente cosmético", conforme comentário existente no código — **minha
  chamada**, não criar preço por sabor agora).
- Todas as 10 receitas ficam disponíveis assim que suco é desbloqueado (nível
  3, como já é hoje) — **minha chamada**, não escalonar sabores por nível
  nesta fase (fica como ideia pra depois, não é meta agora).

### Não-metas desta parte

- Não inventar combinações que não existem na vida real.
- Não adicionar um 4º nível de "ponto" (cru/no ponto/queimado) ao suco além
  do que já existe pra pancake — reaproveitar as mesmas constantes de tempo.
- Não mexer no balcão de entrega (`DeliveryCounter.tsx`) nesta fase — ele já
  reaproveita `RecipeItemView`/`SPECS`; se isso quebrar por causa da saída de
  `juice` de `ExtraRecipe`, ajustar o mínimo necessário pra compilar, sem
  redesenhar a cena.

## Parte B — Histórico de avaliações

### Comportamento

- O texto de estrelas no HUD (`lastStars`, hoje só leitura dentro de um
  `<View pointerEvents="none">`) vira tocável: um `<Pressable>` que abre um
  overlay listando os clientes atendidos **no turno atual** (`dayReviews`,
  mesmo corte que já existe pro resumo de fim de dia — minha chamada: por
  turno, não vitalício, já que `reviews`/`dayReviews` não persistem entre
  sessões do app mesmo).
- Cada linha: estrelas (★/☆, mesmo formato já usado) + resumo do pedido +
  motivo(s) da nota, em texto traduzido (ex.: "☆☆☆☆★ · Café + Torrada ·
  Faltou açúcar, queimou a torrada"). Pedido sem problema nenhum mostra algo
  tipo "Tudo certo!" em vez de lista vazia.
- Mesmo padrão visual/leve de overlay que `OrderQueueOverlay` já usa
  (dismissable, não bloqueia o jogo por trás).

### Dados

`ReviewResult` ganha um campo `summary: string` (preenchido em
`deliverOrder()`, usando `describeOrder(order, orderWords())` — já existe e
já é usado em outro lugar do `GameScreen`). `comments: string[]` continua
sendo chaves internas (`'missing_sugar'`, `'too_slow'`, etc., + a nova
`'wrong_flavor'`/`under_blended`/`over_blended` da Parte A) — precisam de
tradução nova em `strings.ts` (PT/EN/ES) pra cada uma das que já existem hoje
(nenhuma tem tradução ainda, confirmado) + as novas da Parte A.

### Não-metas desta parte

- Não criar histórico vitalício entre dias/sessões (não persistido, por
  enquanto).
- Não adicionar filtro/ordenação na lista — é só uma lista simples na ordem
  em que os pedidos foram entregues.

## Parte C — Cafeteira com modelo 3D diferente por nível (piloto)

### Escopo confirmado com o usuário

Modelagem manual no Blender (bibliotecas prontas e geradores de IA estão
desligados na conta — não contar com eles). **Começa só com UM aparelho**
(a cafeteira, `COFFEE_MACHINE`) nos 5 níveis, como piloto do pipeline
completo; torradeira e liquidificador ficam para depois, um de cada vez,
repetindo o mesmo processo (fora do escopo desta parte do documento).

### Pipeline técnico (confirmado lendo `scripts/convert-glb.cjs`)

O conversor lê um `.glb`, e para cada vértice usa a cor da textura do
material (se houver) multiplicada pelo `baseColorFactor`; **sem textura, cai
direto no `baseColorFactor`** — ou seja, um material Principled BSDF simples
com cor sólida por parte (sem pintar textura nenhuma) já basta, exatamente
como Blender monta materiais por padrão. Fluxo por nível:

1. Modelar no Blender via `execute_blender_code` (bpy): malhas simples,
   baixo-poly, um material de cor sólida por parte (corpo, bocal, base,
   detalhes), consistente com o estilo do resto do jogo.
2. Usar `look` (captura de viewport) repetidamente pra julgar o resultado —
   esse é um trabalho visual iterativo, não dá pra acertar o modelo de
   primeira sem ver. **Por isso este trabalho deve ser feito interativamente
   (por mim, ou por um agente com acesso às ferramentas do Blender MCP que
   também itere com `look`), não despachado às cegas pra um subagente sem
   visão do resultado.**
3. Exportar `.glb` (`bpy.ops.export_scene.gltf`).
4. Rodar `scripts/convert-glb.cjs` incluindo **todos** os nomes de modelo já
   existentes + o novo (o script reescreve o arquivo inteiro a cada chamada,
   confirmado lendo o código — não dá pra só acrescentar um nome).
5. Nomear a constante nova de forma que não colida com `COFFEE_MACHINE`
   (ex.: `COFFEE_MACHINE_L1`..`COFFEE_MACHINE_L5`; `L1` pode simplesmente
   reexportar o `COFFEE_MACHINE` de hoje sem remodelar nada).

### Direção visual dos 5 tiers (minha proposta, revisável)

Amarrando com a progressão que `levels.ts` já faz na mesa (madeira simples
`#6B4226` → nogueira escura polida `#432A1D`) e com a paleta "Madeira & Âmbar"
já estabelecida (`docs/superpowers/specs/2026-10-16-brewlight-menu-tipografia.md`):

1. **Nível 1** — a cafeteira atual, sem mudança (máquina de filtro simples).
2. **Nível 2** — mesmo porte, acabamento com um pouco de metal/cromado.
3. **Nível 3** — estilo máquina de espresso pequena, detalhes em latão.
4. **Nível 4** — máquina de espresso de dois grupos, latão/cobre polido,
   visor de pressão.
5. **Nível 5** — peça "de vitrine": nogueira escura + dourado, mais
   ornamentada, condizente com o tema "café sofisticado" do nível 5.

### Dado/plumbing no jogo

`CoffeeStation.tsx` já lê `level` da store (`useGameStore((s) => s.level)`
— hoje só usado para `tableScale`/`tableColor`). Adicionar um pequeno mapa
`level → ModelData` (ex.: `src/scenes/CoffeeStation/applianceTiers.ts`,
`Record<number, ModelData>` com as 5 constantes acima) e trocar
`<ModelParts data={COFFEE_MACHINE} .../>` por
`<ModelParts data={COFFEE_MACHINE_TIERS[level]} .../>`. Cada modelo novo
provavelmente precisa de seu próprio `scale` (a normalização do conversor
deixa a maior dimensão = 1, mas a proporção real de cada máquina desenhada à
mão vai variar) — ajustar por nível também, igual o `MACHINE_ZONE`/posição do
bocal pode precisar de pequeno ajuste por tier (mesmo cuidado de
"tuning pendente em dispositivo" que já existe pros outros props).

### Não-metas desta parte

- Torradeira e liquidificador não mudam nesta fase (próxima rodada, cada um
  por vez, depois que o piloto da cafeteira validar o processo).
- Não mexer na posição/zona de pour (`MACHINE_ZONE`) além do mínimo
  necessário pra cada novo modelo não ficar visualmente errado.

## O que fica para o builder decidir (minhas chamadas já registradas acima,
revisáveis se o usuário discordar ao ler)

- Layout espacial exato dos potinhos atrás do liquidificador.
- Efeito visual exato de "liquidificador batendo" (vibração simples vs.
  partícula nova).
- Nome exato das chaves de comentário novas do suco.
- Se o modelo 3D de cada fruta vem do Kenney Food Kit ou é modelado no
  Blender — decidir na hora, pelo que estiver disponível.
- Direção visual exata de cada um dos 5 tiers da cafeteira (proposta acima,
  ajustável durante a modelagem conforme o resultado visto no `look`).
- Escala/posição de bocal por tier da cafeteira (tuning visual iterativo).
