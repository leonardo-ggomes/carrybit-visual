# 🔢 Contador Binário Mecânico — 8 bits

> Simulador visual de um contador binário mecânico para uso em aulas de fundamentos de computação.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Zero dependências](https://img.shields.io/badge/dependências-zero-brightgreen?style=flat)
![Licença MIT](https://img.shields.io/badge/licença-MIT-blue?style=flat)

---

## 📖 Sobre o projeto

Este projeto é inspirado em um brinquedo educacional físico feito de madeira — uma máquina com cards pendurados em uma haste metálica, onde cada card representa um **bit**. Ao girar a manivela, os cards viram mecanicamente demonstrando o funcionamento do sistema binário e o conceito de **carry (vai-um)**.

A versão digital foi construída com HTML, CSS e JavaScript puro, sem nenhuma dependência externa, e pode ser aberta diretamente no navegador. O objetivo é ser uma ferramenta de apoio visual para professores durante aulas sobre:

- Sistema de numeração binário
- Representação de bits e bytes
- Operação de carry (propagação de vai-um)
- Nibbles, bytes e hexadecimal
- Limites de representação e overflow

---

## ✨ Funcionalidades

- **8 cards em linha única**, cada um representando um bit (bit 7 ao bit 0)
- **Animação 3D real** — cada card gira em torno do eixo superior como um card preso fisicamente a uma haste, sempre no mesmo sentido (nunca reverte)
- **Carry em cascata** — quando um bit passa de 1→0, seu gancho aciona o próximo bit com delay visual escalonado, tornando o carry visível e didático
- **Display em tempo real** mostrando o valor atual em:
  - Binário (agrupado em nibbles: `0000 0000`)
  - Decimal (`0` a `255`)
  - Hexadecimal (`0x00` a `0xFF`)
- **Histórico de contagem** com os últimos 20 estados registrados
- **Overflow animado** ao atingir 255 — todos os cards retornam a 0 em cascata com mensagem visual
- **Atalhos de teclado**: `Espaço`, `→` ou `Enter` giram a manivela; `R` reinicia
- Estética de **brinquedo de madeira torneada** com textura, parafusos, hastes metálicas e ganchos de carry

---

## 🎓 Conceitos ensinados

| Conceito | Como aparece na simulação |
|---|---|
| **Bit** | Cada card individual (face clara = 0, face escura = 1) |
| **Nibble** | Grupos de 4 cards (bits 7–4 e bits 3–0) |
| **Byte** | Os 8 cards juntos representam 1 byte completo |
| **Carry** | O gancho metálico que empurra o próximo card ao virar de 1→0 |
| **Overflow** | Ao ultrapassar 255, todos os bits voltam a 0 |
| **Hexadecimal** | Mostrado em tempo real junto com binário e decimal |

---

## 🚀 Como usar

### Opção 1 — Abrir direto no navegador

Baixe o arquivo `contador-binario.html` e abra em qualquer navegador moderno. Nenhuma instalação necessária.

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/contador-binario.git

# Abra o arquivo
cd contador-binario
open contador-binario.html      # macOS
start contador-binario.html     # Windows
xdg-open contador-binario.html  # Linux
```

### Opção 2 — Servidor local (opcional)

```bash
# Python 3
python -m http.server 8080

# Node.js
npx serve .
```

Acesse `http://localhost:8080/contador-binario.html`.

---

## 🕹️ Controles

| Ação | Como fazer |
|---|---|
| Incrementar (+1) | Clique na **manivela** ou pressione `Espaço` / `→` / `Enter` |
| Reiniciar para 0 | Clique em **↺ Reiniciar** ou pressione `R` |

---

## 🗂️ Estrutura do projeto

```
contador-binario/
└── contador-binario.html   # Aplicação completa em arquivo único
```

O projeto é intencionalmente um **arquivo HTML único** — toda a lógica, estilos e animações estão embutidos, facilitando o compartilhamento e uso em ambientes educacionais sem necessidade de infraestrutura.

---

## ⚙️ Como funciona a animação

O mecanismo central usa um acumulador de rotação por card (`cardRotation[i]`). A cada flip, sempre é **subtraído 180°** — o card nunca inverte a direção de rotação:

```
cardRotation =    0° → face 0 visível  (card em repouso)
cardRotation = -180° → face 1 visível  (card virado)
cardRotation = -360° → face 0 visível  (completou uma volta)
cardRotation = -540° → face 1 visível  (volta e meia)
...e assim por diante
```

Isso garante que a transição de 1→0 (carry) seja sempre uma continuação do mesmo movimento, exatamente como no brinquedo físico — o card nunca "desfaz" o giro para voltar.

---

## 🛠️ Tecnologias

- **HTML5** — estrutura e semântica
- **CSS3** — animações 3D (`transform-style: preserve-3d`, `rotateX`), variáveis CSS, gradientes para textura de madeira
- **JavaScript ES6+** — lógica de contagem, carry em cascata, controle de animações
- **Google Fonts** — `Bebas Neue` (dígitos), `IBM Plex Mono` (labels e display), `Nunito` (UI geral)

---

## 🎨 Decisões de design

- **Tema madeira** — inspirado diretamente no brinquedo físico original; textura criada inteiramente via `repeating-linear-gradient` sem imagens externas
- **Animação sempre no mesmo sentido** — decisão técnica e didática: o card nunca "desfaz" o movimento, assim como no mecanismo real
- **Delay escalonado no carry** — cada bit da cadeia anima com 140ms de intervalo, tornando a propagação visível e compreensível
- **Linha única de cards** — todos os 8 bits em uma haste contínua reforça visualmente que formam um único número de 8 bits

---

## 📚 Contexto pedagógico

Este simulador foi desenvolvido para uso em aulas de **fundamentos de sistemas digitais e arquitetura de computadores**. O conceito do brinquedo mecânico original é atribuído a projetos de computação desplugada (*unplugged computing*), onde conceitos abstratos de hardware são ensinados com suporte visual e físico.

A versão digital mantém a fidelidade ao mecanismo físico para preservar a intuição que ele oferece: ao ver o gancho de carry empurrar o próximo card, o aluno compreende visceralmente por que `0111 + 1 = 1000`.

---

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma *issue* ou enviar um *pull request* com melhorias ou novas funcionalidades — como modo de subtração, entrada manual de valor, ou versões de 4/16 bits.

---

## 📄 Licença

Distribuído sob a licença MIT. Veja o arquivo `LICENSE` para mais informações.

---

<p align="center">Feito para a sala de aula ⚙️</p>
