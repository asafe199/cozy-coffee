# Brewlight — Direções de Menu e Tipografia

**Data:** 2026-10-16
**Status:** Exploração — 3 direções para escolher
**Referência visual:** diorama isométrico de loft em madeira, fundo carvão, luz âmbar de janela, móveis com estrutura de metal preto.
**Formato das telas:** celular em paisagem (844 × 390)

Todas as direções partem do spec do projeto: low-poly aconchegante, sem pressão, PT/EN/ES desde o lançamento. Em todas, o menu fica **sobreposto à cena 3D ao vivo** (o diorama da cafeteria girando devagar ao fundo).

---

## A · Madeira & Âmbar

**Ideia:** o menu é um painel de nogueira encostado na lateral, como se fosse parte da mobília da cena.

### Layout do menu principal
- Painel lateral esquerdo de 330 px, fundo nogueira, borda direita de madeira (6 px) e sombra suave sobre a cena.
- Topo: logo "Brewlight" + subtítulo "SUA CAFETERIA ACONCHEGANTE" em caixa alta espaçada.
- Botões empilhados: **Continuar** (destaque âmbar, com "Dia 4 · Nível 2" à direita), Novo dia, Receitas, Ajustes.
- Rodapé: seletor de idioma `PT · EN · ES`.
- Cena 3D à direita com brilho radial âmbar atrás.

### Tipografia
| Uso | Fonte | Peso | Tamanho |
|---|---|---|---|
| Logo / títulos grandes | Fraunces | 700 | 44 px |
| Subtítulos | Fraunces | 500 | 22 px |
| Interface / corpo | Figtree | 400–700 | 13–17 px |
| Rótulos | Figtree, caixa alta, tracking 2–2,5 px | 600 | 12–13 px |

### Paleta
| Nome | Hex | Uso |
|---|---|---|
| Carvão | `#2B2729` | Fundo da cena |
| Nogueira | `#4A2F1F` | Botões secundários |
| Madeira | `#6B4226` | Bordas |
| Painel | `#3B2618` | Fundo do painel |
| Âmbar | `#F3B45A` | Destaque / botão principal |
| Creme | `#F6E3C7` | Texto |

### Botões
- **Principal:** fundo âmbar, texto `#2B1A10`, raio 14 px, altura 52 px.
- **Secundário:** fundo nogueira, borda 1,5 px madeira, texto creme, altura 46 px.

---

## B · Vidro & Luz

**Ideia:** a cena ocupa a tela toda; a interface flutua como peças de vidro translúcido — inspirada na barra de navegação em pílula da referência.

### Layout do menu principal
- Cena 3D em tela cheia, câmera orbitando, brilho âmbar central.
- **Barra em pílula no topo** (centralizada, fundo vidro 92%): logo "brewlight" em minúsculas + Receitas · Cafeteria · Ajustes + botão de idioma `PT`.
- **Cartão inferior** centralizado: "DIA 4 · MANHÃ" / "07:30 — abrir a cafeteria" + botão **Continuar**.

### Tipografia
| Uso | Fonte | Peso | Tamanho |
|---|---|---|---|
| Logo / títulos | Bricolage Grotesque | 800 | 19–44 px, tracking negativo |
| Subtítulos | Bricolage Grotesque | 500 | 22 px |
| Interface / corpo | Instrument Sans | 400–600 | 14–16 px |
| Rótulos | Instrument Sans, caixa alta | 600 | 12 px |

### Paleta
| Nome | Hex | Uso |
|---|---|---|
| Noite | `#2E2A2C` | Fundo da cena |
| Vidro | `#FFFAF3` (92% opaco) | Pílulas e cartões |
| Linho | `#D9CFC2` | Bordas |
| Sol | `#F6C26B` | Botão principal |
| Grão | `#8A5A33` | Rótulos |
| Texto | `#2B2729` | Texto principal |

### Botões
- **Principal:** fundo sol, raio 16 px, altura 50 px, Instrument Sans 600.
- **Secundário:** pílula branca, borda linho 1 px.
- **Itens da barra:** transparentes, altura 40 px.

---

## C · Quadro de Giz

**Ideia:** o menu é o quadro-negro da cafeteria, com moldura de ferro — conversa com o quadro de pedidos do loop central e com os móveis de metal preto da referência.

### Layout do menu principal
- Cena 3D à esquerda; quadro à direita (360 × 330), fundo lousa, moldura de 7 px em ferro.
- Topo do quadro: "Brewlight" escrito à mão + rótulo "CARDÁPIO"; linha tracejada abaixo.
- Itens como em cardápio, com pontilhado até a direita: **Continuar ······ Dia 4** (giz âmbar), Novo dia, Receitas ······ *6 novas* (giz sálvia), Ajustes.
- Rodapé: `PT · EN · ES`.

### Tipografia
| Uso | Fonte | Peso | Tamanho |
|---|---|---|---|
| Logo / títulos / itens do menu | Caveat | 500–700 | 28–52 px |
| Interface, números, rótulos | Outfit | 400–600 | 12–16 px |

### Paleta
| Nome | Hex | Uso |
|---|---|---|
| Ferro | `#111111` | Moldura |
| Lousa | `#232523` | Fundo do quadro |
| Giz | `#EDE8DF` | Texto |
| Giz âmbar | `#F3C46B` | Destaque |
| Giz sálvia | `#B4D3A8` | Novidades / positivo |
| Carvão | `#2B2729` | Fundo da cena |

### Botões
- **Principal:** contorno 2 px giz âmbar, fundo transparente, Caveat 700.
- **Secundário:** contorno tracejado em giz 50%, Caveat 500.
- Itens do menu: texto + pontilhado, área de toque ≥ 44 px.

---

## Notas comuns

- Fontes todas do Google Fonts (licença aberta) — empacotar com `expo-font`.
- Áreas de toque ≥ 44 px em todas as direções.
- Textos sobre fundos escuros em creme/giz; o botão âmbar usa texto quase preto (`#2B1A10`) para manter contraste.
- Cor de destaque é ajustável em cada direção (alternativas testadas: A `#E8914A` / `#D9B48F`; B `#B4E0B8` / `#F3C9A0`; C `#B4D3A8` / `#F2A7A0`).
- Próximo passo após escolher: aplicar a direção ao quadro de pedidos, relógio do canto e resumo do dia.
