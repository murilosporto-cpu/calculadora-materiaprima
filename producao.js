/**
 * Domino's Pizza - Assistente de Produção de Massa
 * Passo a passo interativo baseado no Treinamento de Comissariado 2026.
 * O operador marca cada etapa; o progresso é salvo no navegador (localStorage).
 */

// ─── 1. ROTEIRO DE PRODUÇÃO (extraído do PDF de treinamento) ─────────────────

const FASES_PRODUCAO = [
    {
        id: 'calibracao',
        icon: '🧪',
        titulo: 'Verificação de Calibração',
        desc: 'Faça sempre ANTES de iniciar a produção. Em caso de não conformidade, o equipamento precisa de manutenção, calibração ou troca.',
        itens: [
            'Balança: ligar e verificar se está zerada',
            'Balança: colocar o peso no centro, conferir e documentar',
            'Balança: colocar o peso nas extremidades, conferir e documentar (usar pesos próprios de verificação)',
            'Termômetros: mergulhar em copo com água e gelo por 5 min — devem estabilizar entre 0,0 °C e 1,0 °C',
            'Temporizador da batedeira: zerar o cronômetro e acioná-lo junto — conferir tempos de velocidade lenta e rápida e registrar',
            'Água: mergulhar a fita, comparar as cores com a embalagem, registrar e colar a fita no controle',
        ],
    },
    {
        id: 'planejamento',
        icon: '📋',
        titulo: 'Planejamento e Etiquetas',
        desc: 'Confira o rendimento na calculadora para não haver desperdício. O nº de BATCH é o lote que garante a rastreabilidade.',
        itens: [
            'Conferir na calculadora as batidas e o peso necessário para cada tipo de massa',
            'Preencher somente o campo referente à massa que foi produzida',
            'Checar se a data está correta',
            'Imprimir etiquetas — dias em vermelho = massa VERDE (ainda não liberada); descartar após o 5º dia de uso',
        ],
    },
    {
        id: 'pesagem',
        icon: '⚖️',
        titulo: 'Pesagem dos Ingredientes',
        desc: 'Tare o recipiente vazio antes de cada pesagem e atinja a quantidade exata da ficha técnica.',
        itens: [
            'Água da massa: colocar o balde vazio na balança, tarar e despejar até a quantidade exata',
            'Água do fermento: tarar o recipiente, despejar, aferir a temperatura e registrar no controle',
            'Fermento: colocar o copo na balança, tarar e despejar até a quantidade',
            'Pré-mix: pesar a quantidade exata',
            'Óleo de soja: pesar a quantidade exata',
            'Óleo de palma (apenas massa PAN): pesar — lembrar que fica refrigerado no Walk-in',
        ],
    },
    {
        id: 'preparo',
        icon: '🌀',
        titulo: 'Preparo e Batida',
        desc: 'Siga a ordem exatamente. Não é permitido reprocessar a massa.',
        itens: [
            'Despejar a água pesada no tacho e adicionar o pré-mix, mexendo',
            'Hidratar o fermento na água do fermento, mexer, acionar o cronômetro e aguardar 2 minutos',
            'Adicionar o fermento hidratado no tacho e mexer',
            'Adicionar o óleo de soja no tacho e NÃO MEXER',
            'Adicionar a farinha',
            'PAN: após a farinha, adicionar o óleo de palma previamente pesado',
            'Bater 2 minutos em velocidade baixa e mais 4 minutos em velocidade alta',
            'Borrifar óleo na bancada e na tampa da balança, retirar a massa, medir a temperatura e registrar',
        ],
    },
    {
        id: 'corte',
        icon: '🔪',
        titulo: 'Corte e Gramatura',
        desc: 'Variação aceitável de 1% a mais ou a menos do peso ideal. Gramaturas de referência abaixo.',
        itens: [
            'Separar uma amostra de 170 g, colocar numa bandeja, etiquetar e deixar em temperatura ambiente',
            'Cortar a massa e pesar cada bola conforme o tamanho (variação ±1%)',
            'Preencher o Controle de Produção',
        ],
        referencia: [
            'Massa 14": 6 bolas de 540 g (534,6–545,4 g)',
            'Massa 11,5": 8 bolas de 365 g (361,3–368,6 g)',
            'Massa 8,5": 12 bolas de 215 g (212,8–217,1 g)',
            'Massa 7": 12 bolas de 130 g (128,7–131,3 g)',
            'PAN 11,5": 7 bolas de 450 g (445,5–454,5 g)',
            'PAN 8,5": 12 bolas de 215 g (212,8–217,1 g)',
        ],
    },
    {
        id: 'boleamento',
        icon: '🫓',
        titulo: 'Boleamento',
        desc: 'As bolas não podem ter fissuras.',
        itens: [
            'Bolear com formato arredondado e superfície lisa, sem nenhuma fissura',
            'Bolear em até 15 minutos, contando da saída da batedeira até a entrada no Walk-in',
        ],
    },
    {
        id: 'empilhamento',
        icon: '📦',
        titulo: 'Empilhamento e Armazenagem',
        desc: 'Cada torre deve ter no máximo 22 bandejas com massa.',
        itens: [
            'Posicionar as bolas conforme o tipo de massa em bandeja higienizada e seca',
            'Empilhar as bandejas na torre, cruzando-as, e etiquetá-las',
            'Colocar uma bandeja vermelha ou azul vazia identificada como "BASE"',
            'Armazenar a torre no Walk-in e registrar a hora no controle',
        ],
    },
    {
        id: 'registro',
        icon: '✅',
        titulo: 'Registro e Liberação',
        desc: 'A massa só é liberada após a verificação da fermentação da amostra.',
        itens: [
            'Preencher o Controle de Entrada de Massa no Walk-in',
            'Descruzamento: aferir temperatura da bandeja do meio, primeira e última — descruzar ao atingir 4,4 °C (nunca abaixo de 0,5 °C), em até 4 h; manter bandeja amarela como tampa',
            'Verificar a fermentação das amostras e liberar a massa (não conforme → descartar todo o lote)',
            'Assar e descartar a amostra e registrar no relatório de produção',
        ],
    },
];

// ─── 2. ESTADO E PERSISTÊNCIA ────────────────────────────────────────────────

const STORAGE_KEY = 'dominos-producao-progresso-v1';

const estado = {
    faseAtual: 0,
    marcados: {}, // { "faseId-indice": true }
};

function carregarEstado() {
    try {
        const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (salvo && typeof salvo === 'object') {
            estado.faseAtual = salvo.faseAtual || 0;
            estado.marcados = salvo.marcados || {};
        }
    } catch (_) { /* ignora dados inválidos */ }
}

function salvarEstado() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    } catch (_) { /* localStorage indisponível — segue sem persistir */ }
}

// ─── 3. HELPERS DE PROGRESSO ─────────────────────────────────────────────────

function chaveItem(faseIdx, itemIdx) {
    return `${FASES_PRODUCAO[faseIdx].id}-${itemIdx}`;
}

function totalItens() {
    return FASES_PRODUCAO.reduce((soma, f) => soma + f.itens.length, 0);
}

function totalMarcados() {
    return Object.values(estado.marcados).filter(Boolean).length;
}

function faseCompleta(faseIdx) {
    const fase = FASES_PRODUCAO[faseIdx];
    return fase.itens.every((_, i) => estado.marcados[chaveItem(faseIdx, i)]);
}

// ─── 4. CONSTRUÇÃO DO MODAL ──────────────────────────────────────────────────

function construirModal() {
    const overlay = document.createElement('div');
    overlay.className = 'prod-overlay';
    overlay.id = 'prod-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
        <div class="prod-modal" role="dialog" aria-modal="true" aria-labelledby="prod-fase-titulo">
            <header class="prod-modal-head">
                <div class="prod-steps" id="prod-steps"></div>
                <button type="button" class="prod-close" id="prod-close" aria-label="Fechar">&times;</button>
            </header>

            <div class="prod-progress-track">
                <div class="prod-progress-fill" id="prod-progress-fill"></div>
            </div>
            <div class="prod-progress-label" id="prod-progress-label"></div>

            <div class="prod-body" id="prod-body"></div>

            <footer class="prod-modal-foot">
                <button type="button" class="btn btn-secondary" id="prod-prev">← Voltar</button>
                <span class="prod-fase-counter" id="prod-fase-counter"></span>
                <button type="button" class="btn prod-btn-next" id="prod-next">Avançar →</button>
            </footer>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('prod-close').addEventListener('click', fecharModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) fecharModal(); });
    document.getElementById('prod-prev').addEventListener('click', () => irParaFase(estado.faseAtual - 1));
    document.getElementById('prod-next').addEventListener('click', avancar);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !overlay.hidden) fecharModal();
    });
}

// ─── 5. RENDERIZAÇÃO ─────────────────────────────────────────────────────────

function renderizarPassos() {
    const cont = document.getElementById('prod-steps');
    cont.innerHTML = '';
    FASES_PRODUCAO.forEach((fase, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'prod-step-dot';
        dot.title = fase.titulo;
        dot.textContent = fase.icon;
        if (idx === estado.faseAtual) dot.classList.add('is-active');
        if (faseCompleta(idx)) dot.classList.add('is-done');
        dot.addEventListener('click', () => irParaFase(idx));
        cont.appendChild(dot);
    });
}

function renderizarFase() {
    const fase = FASES_PRODUCAO[estado.faseAtual];
    const body = document.getElementById('prod-body');

    const itensHtml = fase.itens.map((texto, i) => {
        const chave = chaveItem(estado.faseAtual, i);
        const marcado = estado.marcados[chave] ? 'checked' : '';
        return `
            <label class="prod-item ${marcado ? 'is-checked' : ''}" data-idx="${i}">
                <input type="checkbox" ${marcado}>
                <span class="prod-check"></span>
                <span class="prod-item-text">${texto}</span>
            </label>
        `;
    }).join('');

    const refHtml = fase.referencia ? `
        <div class="prod-ref">
            <div class="prod-ref-title">Gramaturas de referência</div>
            <ul>${fase.referencia.map((r) => `<li>${r}</li>`).join('')}</ul>
        </div>
    ` : '';

    body.innerHTML = `
        <div class="prod-fase-header">
            <span class="prod-fase-icon">${fase.icon}</span>
            <div>
                <h2 class="prod-fase-titulo" id="prod-fase-titulo">${fase.titulo}</h2>
                <p class="prod-fase-desc">${fase.desc}</p>
            </div>
        </div>
        <div class="prod-itens">${itensHtml}</div>
        ${refHtml}
    `;

    body.querySelectorAll('.prod-item').forEach((label) => {
        const idx = parseInt(label.dataset.idx, 10);
        const input = label.querySelector('input');
        input.addEventListener('change', () => {
            estado.marcados[chaveItem(estado.faseAtual, idx)] = input.checked;
            label.classList.toggle('is-checked', input.checked);
            salvarEstado();
            atualizarUI();
        });
    });

    body.scrollTop = 0;
    atualizarUI();
}

function atualizarUI() {
    renderizarPassos();

    const total = totalItens();
    const feitos = totalMarcados();
    const pct = total ? Math.round((feitos / total) * 100) : 0;

    document.getElementById('prod-progress-fill').style.width = pct + '%';
    document.getElementById('prod-progress-label').textContent =
        `${feitos} de ${total} etapas concluídas (${pct}%)`;
    document.getElementById('prod-fase-counter').textContent =
        `Fase ${estado.faseAtual + 1} de ${FASES_PRODUCAO.length}`;

    const prev = document.getElementById('prod-prev');
    const next = document.getElementById('prod-next');
    prev.disabled = estado.faseAtual === 0;

    const ehUltima = estado.faseAtual === FASES_PRODUCAO.length - 1;
    const completa = faseCompleta(estado.faseAtual);
    next.disabled = !completa;
    next.textContent = ehUltima ? '✔ Concluir Produção' : 'Avançar →';
    next.classList.toggle('is-finish', ehUltima && completa);
}

// ─── 6. NAVEGAÇÃO ────────────────────────────────────────────────────────────

function irParaFase(idx) {
    if (idx < 0 || idx >= FASES_PRODUCAO.length) return;
    estado.faseAtual = idx;
    salvarEstado();
    renderizarFase();
}

function avancar() {
    if (!faseCompleta(estado.faseAtual)) return;
    if (estado.faseAtual === FASES_PRODUCAO.length - 1) {
        concluir();
    } else {
        irParaFase(estado.faseAtual + 1);
    }
}

function concluir() {
    const body = document.getElementById('prod-body');
    body.innerHTML = `
        <div class="prod-done">
            <div class="prod-done-icon">🎉</div>
            <h2>Produção concluída!</h2>
            <p>Todas as etapas do roteiro foram cumpridas e registradas. Bom trabalho!</p>
            <button type="button" class="btn prod-btn-next is-finish" id="prod-restart">Iniciar nova produção</button>
        </div>
    `;
    document.getElementById('prod-restart').addEventListener('click', reiniciar);
}

function reiniciar() {
    estado.marcados = {};
    estado.faseAtual = 0;
    salvarEstado();
    renderizarFase();
}

// ─── 7. ABRIR / FECHAR ───────────────────────────────────────────────────────

function abrirModal() {
    const overlay = document.getElementById('prod-overlay');
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    renderizarFase();
}

function fecharModal() {
    const overlay = document.getElementById('prod-overlay');
    overlay.hidden = true;
    document.body.style.overflow = '';
}

// ─── 8. INIT ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    carregarEstado();
    construirModal();
    const btn = document.getElementById('btn-iniciar-producao');
    if (btn) btn.addEventListener('click', abrirModal);
});
