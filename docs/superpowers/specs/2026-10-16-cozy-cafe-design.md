# Brewlight — Design do Projeto

**Data:** 2026-10-16
**Status:** Design aprovado, pronto para planejamento de implementação

## Intenção

Um jogo mobile cozy/ASMR de simulação de cafeteria em primeira pessoa. O autor
descobriu o Three.js e se interessou pela linguagem visual 3D; juntou isso à
sua afinidade pessoal por ambientes de cafeteria (algo que ele já associa a
relaxamento) e à vontade de empreender com um produto pago.

**Prioridade declarada pelo autor, em ordem:** o jogo ser redondo, bonito e
agradável de usar vem antes da rentabilidade. Rentabilidade importa, mas se o
modelo "app pago" não gerar retorno alto, outras formas de monetização podem
ser consideradas no futuro — isso não deve comprometer a experiência.

## Objetivos

- Entregar uma experiência genuinamente relaxante, no estilo cozy/ASMR —
  essa é a lente pela qual toda decisão de design deve passar.
- Um loop central de preparo de pedidos que seja satisfatório de repetir:
  ler o pedido, ir até a estação certa, montar o item manualmente, entregar.
- Progressão econômica simples (upar o nível da cafeteria) que dá uma sensação
  de evolução sem exigir gerenciamento complexo.
- Visual 3D leve o suficiente para rodar bem em celulares de linha
  intermediária, mantendo personalidade e aconchego.
- Lançar em português, inglês e espanhol, mirando EUA, Canadá e Brasil como
  mercados iniciais, com expansão de mercado/idioma gradual.

## Não-objetivos (fora do escopo desta fase)

- **Temas visuais alternativos por nível** (ex.: estética noturna desbloqueada
  no nível 2, com reposicionamento dos equipamentos) — ideia validada pelo
  autor como boa, mas explicitamente adiada para uma fase futura. Não faz
  parte do escopo inicial.
- Compra de equipamento item por item (fogão, máquina X, máquina Y
  separadamente) — decisão explícita do autor foi simplificar isso em um
  único upgrade de nível de cafeteria (ver seção Progressão).
- Multiplayer, modo competitivo, ou qualquer mecânica social.
- Anúncios (ads) como modelo de monetização — forçados ou intersticiais
  estão fora de cogitação; só se considera, no máximo, ad opcional
  recompensado no futuro, e mesmo isso não é compromisso desta fase.
- Definição final de preço — adiada até o escopo e a complexidade de produção
  estarem mais claros.

## Anti-metas (o que tornaria isso um fracasso)

- **O jogo virar estressante.** Esta é a linha vermelha de todo o projeto.
  Qualquer mecânica de pressão (timer visível, penalidade dura, cliente
  impaciente agressivo) vai contra a premissa central e deve ser evitada ou
  tratada com extremo cuidado.
- Ficar repetitivo rápido demais a ponto de quebrar o relaxamento (mitigado
  pela progressão de níveis, variedade de receitas e o ritmo de
  turnos/horário de pico descrito abaixo).
- Visual pesado demais para rodar fluido em celular — compromete diretamente
  a sensação de "experiência cuidada".

## Restrições e decisões técnicas já tomadas

- **Stack 3D:** React Three Fiber (sobre Three.js).
- **Empacotamento mobile:** React Native + Expo, usando `expo-gl` para rodar
  o R3F com performance próxima do nativo — não um WebView (Capacitor/Cordova),
  pela penalidade de performance/bateria que isso traria em um jogo que
  renderiza 3D continuamente.
- **Plataformas:** iOS e Android, lançamento simultâneo.
- **Orientação do dispositivo:** paisagem (landscape) — *decisão do assistente*,
  por ser um jogo de câmera 3D em primeira pessoa que enquadra ambientes
  (estações, balcão, janela); retrato comprimiria demais a visão da cena.
- **Modelo de negócio:** download grátis, sem ads forçados. O nível 1 da
  cafeteria é jogável de graça; um IAP único ("versão completa") desbloqueia
  os níveis 2-5. Preço do IAP ainda não definido — calibrar com base na
  complexidade final do produto. *(Decisão revisada: o plano original de
  "app pago, sem ads" foi substituído por este modelo free-to-play com
  desbloqueio único, por dar mais alcance de downloads e não exigir ads
  — que brigariam com o anti-meta de nunca ser estressante.)*
- **Idiomas:** português, inglês e espanhol desde o lançamento.
- **Performance e bibliotecas:** performance é prioridade explícita. A
  implementação deve se apoiar em bibliotecas open-source já consolidadas
  da comunidade React Three Fiber / React Native em vez de construir do
  zero o que já existe pronto e testado — por exemplo `@react-three/drei`
  (helpers prontos de R3F), `react-native-gesture-handler` +
  `react-native-reanimated` (gestos de arrastar performáticos, rodando na
  UI thread), e uma lib de state management leve (ex. `zustand`, já comum
  no ecossistema R3F) em vez de soluções caseiras. Só escrever código
  customizado para a lógica específica do jogo que não existe pronta em
  lugar nenhum.
- **Persistência:** 100% local no aparelho (ex.: AsyncStorage/SQLite local).
  Sem conta de usuário, sem autenticação, sem sincronização em nuvem — decisão
  explícita do autor para manter o escopo técnico enxuto.
- **Estilo visual:** 3D low-poly estilizado e aconchegante — formas
  geometricamente simples (caixas, cilindros, cones), cores quentes,
  iluminação "falsa" leve (sem global illumination em tempo real), evitando
  o caminho realista/PBR pesado (referência rejeitada por custo de produção
  e desempenho em mobile; comparação feita durante o brainstorming).
  - Protótipo 3D navegável aprovado pelo autor durante este brainstorming:
    `.superpowers/brainstorm/843-1792170485/content/preview-3d-lowpoly-v2.html`
    (cena de referência — vapor de café animado, poeira flutuando na luz da
    janela, luminária balançando; serve de guia de linguagem visual, não é
    código de produção).
  - Referências de tom aceitas pelo autor: *A Short Hike*, *Unpacking*,
    *Cozy Grove*.

## Decisões de design (o "como" já definido)

### Loop central

1. Jogador vê o quadro de pedidos (fade in na câmera) e lê um pedido por vez,
   em sequência.
2. Câmera dá fade out e fade in na estação correspondente ao item do pedido
   (ex.: máquina de café, fogão).
3. Na estação, o jogador realiza a preparação manualmente por interações de
   arrastar: ex. arrastar a xícara até a máquina, arrastar a alavanca/botão
   que despeja o café. Sem mãos ou personagem visível em tela — apenas os
   objetos reagindo à interação do jogador.
4. Ao concluir, fade out; o jogador pega o item pronto e o leva até o balcão
   de entrega (fade in no balcão).
5. Fluxo volta ao quadro de pedidos ou segue direto para a próxima estação,
   dependendo do próximo item do pedido.

### Fila de pedidos

Pode haver mais de um pedido pendente ao mesmo tempo no quadro — uma fila
pequena, não um acúmulo massivo. O volume varia com o horário (ver Estrutura
do dia / turnos): em horário de pico chegam mais pedidos com menos intervalo
entre eles; fora do pico, chegam um a um com folga. Um turno tem no máximo
~10 pedidos no total.

### Receitas / menu

Café, panqueca, ovos mexidos e outros itens de cafeteria a definir. A lista
exata de itens por nível de cafeteria fica a cargo do builder (ver seção
final), mas deve crescer em variedade conforme o nível sobe.

### Sistema de avaliação (sem pressão em tempo real)

Não há timer visível nem penalidade imediata. Depois da entrega, o cliente
dá uma nota/review que pode referenciar qualidade do atendimento — por
exemplo, demora (relativa à complexidade do pedido), ingrediente faltando,
item queimado. Essas reviews acumulam e refletem no resumo do dia, reforçando
a sensação de "você é dono do seu próprio negócio" sem gerar estresse direto.

Um pedido pode ter mais de um item (ex.: um café + um pão na chapa com
manteiga). **Não existe bloqueio de entrega:** o jogador pode entregar um
item incompleto ou errado (ex.: esqueceu o açúcar no café) e o jogo deixa —
não há validação que impede a ação. A única consequência é uma nota mais
baixa na review, mencionando o que faltou. Reforça o anti-meta de nunca
travar o jogador ou puni-lo ativamente; o feedback é sempre posterior e leve.

*Decisão do assistente sobre o cálculo da nota:* um sistema simples baseado
em regras por pedido (não uma pontuação multidimensional complexa) — cada
pedido checa condições pontuais (tempo de preparo acima de um limiar
proporcional à complexidade da receita; ingrediente presente ou não; item
dentro ou fora da janela de "queimado"), e cada condição falha gera um
comentário específico na review. Mantém o sistema de dados simples e ainda
assim gera feedback variado.

### Progressão — níveis da cafeteria

Em vez de compra individual de equipamento, a progressão é um upgrade único
por nível, de 1 a 5:

- O jogador acumula dinheiro vendendo os produtos (preços definidos pelo
  próprio jogador/dono do negócio). **Isso é puramente narrativo/cosmético:**
  o preço escolhido não afeta demanda, fluxo de clientes nem reviews — é só
  parte da fantasia de "ser dono do negócio", sem criar um sistema econômico
  adicional de elasticidade de demanda.
- Ao atingir o valor necessário, ele faz upgrade de nível.
- Cada nível novo já vem com: equipamento adicional (ex.: fogão liberado em
  algum nível), receitas novas desbloqueadas, e maior capacidade de
  atendimento.
- Também existe a ideia narrativa de equipamento "envelhecendo" e precisar
  ser trocado, e de alugar um espaço maior quando a fila cresce demais — a
  progressão por nível é o veículo mecânico para isso; os detalhes de como
  cada nível comunica isso (nova cafeteira mais bonita, espaço maior, etc.)
  ficam a cargo do builder.
- Faixa alvo: 5 níveis no total para a v1.
- **Paywall:** o nível 1 é jogável inteiramente de graça. Progredir para os
  níveis 2-5 exige o IAP único de "versão completa" (ver Modelo de negócio).

### Estrutura do dia / turnos

- A cafeteria opera em turnos: manhã e tarde. Fecha à noite.
- Ao fechar, mostra um resumo do dia: quanto foi ganho e as reviews
  recebidas.
- Um relógio no canto da tela mostra o horário atual.
- **Mecânica do relógio (híbrida):** dentro de um período de pico, o tempo
  passa em tempo real enquanto os pedidos daquele período chegam e são
  atendidos (~8-10 minutos reais por turno, com até ~10 pedidos no total,
  espaçados com folga entre eles — não é uma avalanche). Assim que os
  pedidos daquele período de pico acabam, o relógio **avança por evento**
  (salta algumas horas de jogo de uma vez) direto para o próximo período
  com movimento. Isso evita tempo morto esperando o relógio andar sozinho
  sem nada acontecendo.
- O movimento de clientes varia com o horário: mais pedidos e menos
  intervalo entre eles em horário de pico, mais calmo e espaçado fora dele.

### Áudio

Música de fundo suave, no tom ASMR/relaxante, tocando continuamente durante
o expediente. (Direção aprovada pelo autor; curadoria/composição específica
fica para uma fase posterior.)

## O que fica a cargo do builder

- Lista exata de itens de menu por nível de cafeteria (quais receitas
  entram em cada um dos 5 níveis).
- Números de balanceamento econômico: preços de venda, custo de cada
  upgrade de nível, tempo médio de preparo por receita.
- Mecânica exata de interação de arrastar para cada receita individual
  (café já está descrito; panqueca, ovos mexidos e demais itens precisam de
  especificação própria de gestos).
- Pipeline de produção de assets 3D (modelagem, otimização de draw
  calls/polígonos para o orçamento de performance mobile).
- Precificação final do app.
- Especificação de trilha sonora / efeitos sonoros ambiente.
- Detalhamento da feature futura de temas visuais alternativos por nível
  (fora do escopo desta fase — apenas registrada aqui como direção aprovada
  para avaliação posterior).
