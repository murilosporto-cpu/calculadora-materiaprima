# Domino's Pizza - Calculadora de Matéria-Prima de Produção

Uma ferramenta interativa e responsiva desenvolvida para auxiliar gerentes de produção e padeiros no planejamento exato de matérias-primas e ingredientes de panificação para a produção diária de pizzas da Domino's.

## 🚀 Como Executar o Projeto Localmente

Como o projeto foi projetado para ser 100% autossuficiente e portátil, **não é necessário instalar nenhuma dependência ou executar gerenciadores de pacotes (como npm/pip)**.

1. Navegue até a pasta do projeto:
   `C:\Users\Murilo Porto\.gemini\antigravity\scratch\pizza-calculator`
2. Localize o arquivo `index.html`.
3. Dê um **duplo clique** no arquivo `index.html` para abri-lo diretamente em qualquer navegador moderno (Chrome, Edge, Firefox, Safari, etc.).
4. Insira a quantidade desejada de bandejas no formulário e veja a lista de compras recalcular em tempo real.

---

## 🍕 Fichas Técnicas Integradas (Por Batch)

O sistema realiza os cálculos com base nas seguintes fichas técnicas oficiais:

| Ingrediente | Massa Tradicional (Batch: 16,16 kg) | Massa Pan (Batch: 17,48 kg) |
| :--- | :--- | :--- |
| **Farinha** | 10,00 kg | 10,00 kg |
| **Água** | 5,40 kg | 5,60 kg |
| **Óleo Vegetal** | 0,38 kg | 0,20 kg |
| **Pré-mix** | 0,34 kg | 0,34 kg |
| **Fermento** | 0,04 kg | 0,04 kg |
| **Óleo de Palma** | - | 1,30 kg |

### Lógica de Rendimento de Bandejas
O sistema calcula o peso de massa necessário por bandeja dividindo o peso total do Batch de acordo com a tabela abaixo:

*   **Massa 7"**: 16,16 kg / 10 bandejas = **1,616 kg/bandeja** (Tradicional)
*   **Massa 8,5"**: 16,16 kg / 6 bandejas = **2,6933 kg/bandeja** (Tradicional)
*   **Massa 11,5"**: 16,16 kg / 5 bandejas = **3,232 kg/bandeja** (Tradicional)
*   **Massa 14"**: 16,16 kg / 5 bandejas = **3,232 kg/bandeja** (Tradicional)
*   **Massa Pan**: 17,48 kg / 5 bandejas = **3,496 kg/bandeja** (Pan)

---

## 🛠️ Tecnologias Utilizadas

*   **HTML5 Semântico**: Estrutura robusta e acessível.
*   **CSS3 Moderno**: Efeito glassmorphism, temas escuros harmoniosos, fontes dinâmicas, animações e layout totalmente responsivo para desktop e dispositivos móveis.
*   **JavaScript ES6**: Lógica de cálculo reativo instantâneo.
