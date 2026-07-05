/**
 * Domino's Pizza - Assistente de Produção de Massa (batida a batida)
 * Lê o plano da calculadora, guia cada batida programada, e exporta um
 * relatório em PDF no final (ou só das batidas concluídas, se parar antes).
 * Progresso salvo no navegador (localStorage).
 */

// ─── 1. FASES DO ROTEIRO (extraídas do Treinamento Comissariado 2026) ────────
// Itens podem ser string (valem para os dois tipos) ou { t, tipo } quando são
// específicos de 'tradicional' ou 'pan'.

const FASES_INICIAIS = [
    {
        id: 'calibracao', icon: '🧪', titulo: 'Verificação de Calibração',
        desc: 'Feita UMA vez, antes de iniciar a produção. Em não conformidade, o equipamento precisa de manutenção, calibração ou troca.',
        itens: [
            'Balança: ligar e verificar se está zerada',
            'Balança: peso no centro — conferir e documentar',
            'Balança: peso nas extremidades — conferir e documentar (pesos próprios)',
            { t: 'Termômetros: copo com água e gelo por 5 min — estabilizar entre 0,0 °C e 1,0 °C',
              campos: [{ id: 'leitura', rotulo: 'Leitura do termômetro', unidade: '°C' }] },
            'Temporizador da batedeira: zerar e acionar junto ao cronômetro — conferir tempos e registrar',
            { t: 'Água: mergulhar a fita, comparar as cores, registrar e colar no controle',
              campos: [{ id: 'ph', rotulo: 'pH da água', unidade: '' }] },
        ],
    },
    {
        id: 'planejamento', icon: '📋', titulo: 'Planejamento e Etiquetas',
        desc: 'Feito UMA vez. O nº de BATCH é o lote que garante a rastreabilidade.',
        itens: [
            'Conferir na calculadora as batidas e o peso de cada tipo de massa',
            'Preencher somente o campo referente à massa produzida e checar a data',
            'Imprimir etiquetas — dias em vermelho = massa VERDE; descartar após o 5º dia de uso',
        ],
    },
];

const FASES_BATIDA = [
    {
        id: 'pesagem', icon: '⚖️', titulo: 'Pesagem dos Ingredientes',
        desc: 'Tare o recipiente vazio antes de cada pesagem e atinja a quantidade exata da ficha.',
        itens: [
            { t: 'Água da massa: tarar o balde e despejar até a quantidade exata',
              campos: [
                { id: 'temp_agua', rotulo: 'Temp. da água', unidade: '°C' },
                { id: 'temp_amb',  rotulo: 'Temp. ambiente', unidade: '°C' },
              ] },
            { t: 'Água do fermento: tarar, despejar, aferir a temperatura e registrar',
              campos: [{ id: 'temp_ferm', rotulo: 'Temp. da água do fermento', unidade: '°C' }] },
            'Fermento: tarar o copo e despejar até a quantidade',
            'Pré-mix: pesar a quantidade exata',
            'Óleo de soja: pesar a quantidade exata',
            { t: 'Óleo de palma: pesar (fica refrigerado no Walk-in)', tipo: 'pan' },
        ],
    },
    {
        id: 'preparo', icon: '🌀', titulo: 'Preparo e Batida',
        desc: 'Siga a ordem exatamente. Não é permitido reprocessar a massa.',
        itens: [
            'Despejar a água pesada no tacho e adicionar o pré-mix, mexendo',
            'Hidratar o fermento na água do fermento, mexer, cronômetro e aguardar 2 minutos',
            'Adicionar o fermento hidratado no tacho e mexer',
            'Adicionar o óleo de soja no tacho e NÃO MEXER',
            'Adicionar a farinha',
            { t: 'Após a farinha, adicionar o óleo de palma previamente pesado', tipo: 'pan' },
            'Bater 2 min em velocidade baixa e mais 4 min em velocidade alta',
            { t: 'Borrifar óleo na bancada e na tampa, retirar a massa, medir a temperatura e registrar',
              campos: [{ id: 'temp_massa', rotulo: 'Temp. da massa', unidade: '°C' }] },
        ],
    },
    {
        id: 'corte', icon: '🔪', titulo: 'Corte e Gramatura',
        desc: 'Variação aceitável de ±1% do peso ideal.',
        itens: [
            'Separar amostra de 170 g, etiquetar e deixar em temperatura ambiente',
            'Cortar a massa e pesar cada bola conforme o tamanho (±1%)',
            'Preencher o Controle de Produção',
        ],
        referencia: [
            { t: 'Massa 14": 6 bolas de 540 g (534,6–545,4 g)', tipo: 'tradicional' },
            { t: 'Massa 11,5": 8 bolas de 365 g (361,3–368,6 g)', tipo: 'tradicional' },
            { t: 'Massa 8,5": 12 bolas de 215 g (212,8–217,1 g)', tipo: 'tradicional' },
            { t: 'Massa 7": 12 bolas de 130 g (128,7–131,3 g)', tipo: 'tradicional' },
            { t: 'PAN 11,5": 7 bolas de 450 g (445,5–454,5 g)', tipo: 'pan' },
            { t: 'PAN 8,5": 12 bolas de 215 g (212,8–217,1 g)', tipo: 'pan' },
        ],
    },
    {
        id: 'boleamento', icon: '🫓', titulo: 'Boleamento',
        desc: 'As bolas não podem ter fissuras.',
        itens: [
            'Bolear com formato arredondado e superfície lisa, sem fissuras',
            'Bolear em até 15 min (da saída da batedeira até a entrada no Walk-in)',
        ],
    },
    {
        id: 'empilhamento', icon: '📦', titulo: 'Empilhamento e Armazenagem',
        desc: 'Cada torre deve ter no máximo 22 bandejas com massa.',
        itens: [
            'Posicionar as bolas em bandeja higienizada e seca',
            'Empilhar as bandejas na torre, cruzando-as, e etiquetá-las',
            'Colocar uma bandeja "BASE" (vermelha ou azul vazia)',
            'Armazenar a torre no Walk-in e registrar a hora no controle',
        ],
    },
];

const FASES_FINAIS = [
    {
        id: 'registro', icon: '✅', titulo: 'Registro e Liberação',
        desc: 'Feito UMA vez, ao final de todas as batidas. A massa só é liberada após verificar a fermentação da amostra.',
        itens: [
            'Preencher o Controle de Entrada de Massa no Walk-in',
            { t: 'Descruzamento: descruzar ao atingir 4,4 °C (nunca abaixo de 0,5 °C), em até 4 h; bandeja amarela como tampa',
              campos: [
                { id: 't_primeira', rotulo: '1ª bandeja', unidade: '°C' },
                { id: 't_meio',     rotulo: 'Bandeja do meio', unidade: '°C' },
                { id: 't_ultima',   rotulo: 'Última bandeja', unidade: '°C' },
              ] },
            'Verificar a fermentação das amostras e liberar (não conforme → descartar o lote)',
            'Assar e descartar a amostra e registrar no relatório de produção',
        ],
    },
];

const ULTIMA_FASE_BATIDA = FASES_BATIDA[FASES_BATIDA.length - 1].id;

// ─── 2. ESTADO E PERSISTÊNCIA ────────────────────────────────────────────────

const STORAGE_KEY = 'dominos-producao-v2';

const estado = {
    plano: null,            // snapshot do plano da calculadora (com runs anotados)
    cursor: 0,              // índice na tela atual (roteiro)
    marcados: {},           // chave -> bool
    medicoes: {},           // chaveCampo -> valor (temperaturas, pH, etc.)
    runsConcluidas: {},     // índice da run -> ISO de conclusão
    operador: '', loja: '',
    iniciadoEm: null,
};

let roteiro = [];           // lista plana de telas, montada a partir de estado.plano

function carregarEstado() {
    try {
        const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (s && typeof s === 'object') Object.assign(estado, s);
    } catch (_) { /* ignora dados inválidos */ }
}

function salvarEstado() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(estado)); }
    catch (_) { /* sem persistência */ }
}

// ─── 3. PLANO E ROTEIRO ──────────────────────────────────────────────────────

function iniciarPlano() {
    const plano = window.obterPlanoProducao
        ? window.obterPlanoProducao()
        : { runs: [], pesoTotal: 0, ingredientes: {} };

    const totT = plano.runs.filter((r) => r.tipo === 'tradicional').length;
    const totP = plano.runs.filter((r) => r.tipo === 'pan').length;
    let cT = 0, cP = 0;
    plano.runs.forEach((r) => {
        if (r.tipo === 'tradicional') { r.n = ++cT; r.totalTipo = totT; }
        else                          { r.n = ++cP; r.totalTipo = totP; }
    });

    estado.plano = plano;
    estado.cursor = 0;
    estado.marcados = {};
    estado.medicoes = {};
    estado.runsConcluidas = {};
    estado.iniciadoEm = new Date().toISOString();
    salvarEstado();
}

function construirRoteiro(plano) {
    const r = [];
    FASES_INICIAIS.forEach((fase) => r.push({ grupo: 'inicio', fase, run: null, runNo: null }));
    plano.runs.forEach((run, i) => {
        FASES_BATIDA.forEach((fase) => r.push({ grupo: 'batida', fase, run, runNo: i }));
    });
    FASES_FINAIS.forEach((fase) => r.push({ grupo: 'final', fase, run: null, runNo: null }));
    r.push({ grupo: 'relatorio' });
    return r;
}

// ─── 4. HELPERS ──────────────────────────────────────────────────────────────

function normItem(it) { return typeof it === 'string' ? { t: it } : it; }

function itensVisiveis(tela) {
    const tipoRun = tela.run ? tela.run.tipo : null;
    return (tela.fase.itens || [])
        .map((it, i) => ({ ...normItem(it), _i: i }))
        .filter((it) => !it.tipo || it.tipo === tipoRun);
}

function refsVisiveis(tela) {
    const tipoRun = tela.run ? tela.run.tipo : null;
    return (tela.fase.referencia || [])
        .map(normItem)
        .filter((it) => !it.tipo || it.tipo === tipoRun);
}

function chaveItem(tela, i) {
    return `${tela.runNo == null ? 'x' : tela.runNo}:${tela.fase.id}:${i}`;
}

function chaveCampo(tela, i, campoId) {
    return `${chaveItem(tela, i)}:${campoId}`;
}

function medicaoPreenchida(tela, i, campoId) {
    const v = estado.medicoes[chaveCampo(tela, i, campoId)];
    return v != null && v.toString().trim() !== '';
}

function telaCompleta(idx) {
    const tela = roteiro[idx];
    if (!tela || tela.grupo === 'relatorio') return true;
    return itensVisiveis(tela).every((it) => {
        if (!estado.marcados[chaveItem(tela, it._i)]) return false;
        if (it.campos && it.campos.length) {
            return it.campos.every((c) => medicaoPreenchida(tela, it._i, c.id));
        }
        return true;
    });
}

function runTemProgresso(runNo) {
    return roteiro.some((t) => t.grupo === 'batida' && t.runNo === runNo &&
        itensVisiveis(t).some((it) => estado.marcados[chaveItem(t, it._i)]));
}

function progresso() {
    let total = 0, feitos = 0;
    roteiro.forEach((tela) => {
        if (tela.grupo === 'relatorio') return;
        itensVisiveis(tela).forEach((it) => {
            total++;
            if (estado.marcados[chaveItem(tela, it._i)]) feitos++;
        });
    });
    return { total, feitos, pct: total ? Math.round((feitos / total) * 100) : 0 };
}

function rotuloRun(run) {
    const tipo = run.tipo === 'pan' ? 'Massa Pan' : 'Massa Tradicional';
    const tam  = run.tamanho === 'meia' ? '5 kg (meia batida)' : '10 kg (batida cheia)';
    return `${tipo} · Batida ${run.n} de ${run.totalTipo} · ${tam}`;
}

function segmentoDoCursor() {
    const atual = roteiro[estado.cursor];
    if (!atual || atual.grupo === 'relatorio') return null;
    const fases = roteiro.filter((t) => t.grupo === atual.grupo && t.runNo === atual.runNo);
    return { grupo: atual.grupo, run: atual.run, fases };
}

// ─── 5. MODAL ─────────────────────────────────────────────────────────────────

function construirModal() {
    const overlay = document.createElement('div');
    overlay.className = 'prod-overlay';
    overlay.id = 'prod-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
        <div class="prod-modal" role="dialog" aria-modal="true" aria-labelledby="prod-fase-titulo">
            <header class="prod-modal-head">
                <div class="prod-seg">
                    <span class="prod-seg-label" id="prod-seg-label"></span>
                    <div class="prod-steps" id="prod-steps"></div>
                </div>
                <div class="prod-head-actions">
                    <button type="button" class="btn btn-secondary prod-export-quick" id="prod-export-quick" hidden>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                        PDF
                    </button>
                    <button type="button" class="prod-close" id="prod-close" aria-label="Fechar">&times;</button>
                </div>
            </header>

            <div class="prod-progress-track"><div class="prod-progress-fill" id="prod-progress-fill"></div></div>
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

    const report = document.createElement('div');
    report.id = 'prod-report-print';
    document.body.appendChild(report);

    document.getElementById('prod-close').addEventListener('click', fecharModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) fecharModal(); });
    document.getElementById('prod-prev').addEventListener('click', () => irPara(estado.cursor - 1));
    document.getElementById('prod-next').addEventListener('click', avancar);
    document.getElementById('prod-export-quick').addEventListener('click', exportarPDF);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !overlay.hidden) fecharModal();
    });
}

// ─── 6. RENDER ────────────────────────────────────────────────────────────────

function renderizar() {
    if (!roteiro.length) { renderVazio(); return; }
    const tela = roteiro[estado.cursor];
    if (tela.grupo === 'relatorio') renderRelatorio();
    else                            renderFase();
    atualizarUI();
}

function renderVazio() {
    document.getElementById('prod-seg-label').textContent = '';
    document.getElementById('prod-steps').innerHTML = '';
    document.getElementById('prod-progress-fill').style.width = '0%';
    document.getElementById('prod-progress-label').textContent = '';
    document.getElementById('prod-fase-counter').textContent = '';
    document.getElementById('prod-export-quick').hidden = true;
    document.querySelector('.prod-modal-foot').style.display = 'none';
    document.getElementById('prod-body').innerHTML = `
        <div class="prod-done">
            <div class="prod-done-icon">🧮</div>
            <h2>Nenhuma batida programada</h2>
            <p>Preencha as quantidades de bandejas na calculadora e abra de novo — o assistente monta as batidas automaticamente.</p>
            <button type="button" class="btn prod-btn-next" id="prod-fechar-vazio">Entendi</button>
        </div>`;
    document.getElementById('prod-fechar-vazio').addEventListener('click', fecharModal);
}

function renderFase() {
    const tela = roteiro[estado.cursor];
    const body = document.getElementById('prod-body');
    const visiveis = itensVisiveis(tela);

    const itensHtml = visiveis.map((it) => {
        const chave = chaveItem(tela, it._i);
        const marc = estado.marcados[chave] ? 'checked' : '';
        const camposHtml = (it.campos && it.campos.length) ? `
            <div class="prod-meas">
                ${it.campos.map((c) => {
                    const v = estado.medicoes[chaveCampo(tela, it._i, c.id)] || '';
                    return `<div class="prod-meas-field ${v.toString().trim() === '' ? 'is-empty' : ''}">
                        <label>${c.rotulo}</label>
                        <div class="prod-meas-input">
                            <input type="number" inputmode="decimal" step="0.1" data-i="${it._i}" data-campo="${c.id}" value="${v}" placeholder="—">
                            ${c.unidade ? `<span>${c.unidade}</span>` : ''}
                        </div>
                    </div>`;
                }).join('')}
            </div>` : '';
        return `
            <div class="prod-item-wrap">
                <label class="prod-item ${marc ? 'is-checked' : ''}" data-i="${it._i}">
                    <input type="checkbox" ${marc}>
                    <span class="prod-check"></span>
                    <span class="prod-item-text">${it.t}</span>
                </label>
                ${camposHtml}
            </div>`;
    }).join('');

    const refs = refsVisiveis(tela);
    const refHtml = refs.length ? `
        <div class="prod-ref">
            <div class="prod-ref-title">Gramaturas de referência</div>
            <ul>${refs.map((r) => `<li>${r.t}</li>`).join('')}</ul>
        </div>` : '';

    const badge = tela.grupo === 'batida'
        ? `<div class="prod-batch-badge ${tela.run.tipo === 'pan' ? 'is-pan' : 'is-trad'}">${rotuloRun(tela.run)}</div>`
        : '';

    body.innerHTML = `
        ${badge}
        <div class="prod-fase-header">
            <span class="prod-fase-icon">${tela.fase.icon}</span>
            <div>
                <h2 class="prod-fase-titulo" id="prod-fase-titulo">${tela.fase.titulo}</h2>
                <p class="prod-fase-desc">${tela.fase.desc}</p>
            </div>
        </div>
        <div class="prod-itens">${itensHtml}</div>
        ${refHtml}`;

    body.querySelectorAll('.prod-item').forEach((label) => {
        const i = parseInt(label.dataset.i, 10);
        const input = label.querySelector('input[type="checkbox"]');
        input.addEventListener('change', () => {
            estado.marcados[chaveItem(tela, i)] = input.checked;
            label.classList.toggle('is-checked', input.checked);
            salvarEstado();
            atualizarUI();
        });
    });

    body.querySelectorAll('.prod-meas-input input').forEach((inp) => {
        const i = parseInt(inp.dataset.i, 10);
        const campo = inp.dataset.campo;
        inp.addEventListener('input', () => {
            estado.medicoes[chaveCampo(tela, i, campo)] = inp.value;
            const field = inp.closest('.prod-meas-field');
            if (field) field.classList.toggle('is-empty', inp.value.trim() === '');
            salvarEstado();
            atualizarUI();
        });
    });

    body.scrollTop = 0;
}

function renderRelatorio() {
    const body = document.getElementById('prod-body');
    const p = estado.plano;
    const feitas = Object.keys(estado.runsConcluidas).length;
    const totalRuns = p.runs.length;
    const tudo = feitas === totalRuns;

    body.innerHTML = `
        <div class="prod-fase-header">
            <span class="prod-fase-icon">${tudo ? '🎉' : '📄'}</span>
            <div>
                <h2 class="prod-fase-titulo">${tudo ? 'Produção concluída!' : 'Relatório de produção'}</h2>
                <p class="prod-fase-desc">${feitas} de ${totalRuns} batida(s) concluída(s). Preencha os dados e exporte o relatório em PDF.</p>
            </div>
        </div>
        <div class="prod-report-fields">
            <label class="prod-field"><span>Operador</span><input type="text" id="prod-operador" value="${estado.operador || ''}" placeholder="Nome do operador"></label>
            <label class="prod-field"><span>Loja</span><input type="text" id="prod-loja" value="${estado.loja || ''}" placeholder="Unidade / loja"></label>
        </div>
        <div class="prod-report-actions">
            <button type="button" class="btn prod-btn-next is-finish" id="prod-exportar">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Exportar relatório em PDF
            </button>
            <button type="button" class="btn btn-secondary" id="prod-nova">Nova produção</button>
        </div>`;

    const op = document.getElementById('prod-operador');
    const lj = document.getElementById('prod-loja');
    op.addEventListener('input', () => { estado.operador = op.value; salvarEstado(); });
    lj.addEventListener('input', () => { estado.loja = lj.value; salvarEstado(); });
    document.getElementById('prod-exportar').addEventListener('click', exportarPDF);
    document.getElementById('prod-nova').addEventListener('click', reiniciar);

    body.scrollTop = 0;
}

function renderizarPassos() {
    const cont = document.getElementById('prod-steps');
    const lbl  = document.getElementById('prod-seg-label');
    const seg  = segmentoDoCursor();
    cont.innerHTML = '';
    if (!seg) { lbl.textContent = 'Relatório final'; return; }

    lbl.textContent = seg.grupo === 'inicio' ? 'Preparação'
        : seg.grupo === 'final' ? 'Finalização'
        : `Batida ${seg.run.n}/${seg.run.totalTipo} · ${seg.run.tipo === 'pan' ? 'Pan' : 'Trad'}`;

    seg.fases.forEach((scr) => {
        const gi = roteiro.indexOf(scr);
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'prod-step-dot';
        dot.title = scr.fase.titulo;
        dot.textContent = scr.fase.icon;
        if (gi === estado.cursor) dot.classList.add('is-active');
        if (telaCompleta(gi))     dot.classList.add('is-done');
        dot.addEventListener('click', () => irPara(gi));
        cont.appendChild(dot);
    });
}

function atualizarUI() {
    const foot = document.querySelector('.prod-modal-foot');
    foot.style.display = '';
    renderizarPassos();

    const { total, feitos, pct } = progresso();
    document.getElementById('prod-progress-fill').style.width = pct + '%';
    document.getElementById('prod-progress-label').textContent =
        `${feitos} de ${total} etapas • ${pct}%`;

    const feitasRuns = Object.keys(estado.runsConcluidas).length;
    const totalRuns  = estado.plano ? estado.plano.runs.length : 0;
    document.getElementById('prod-fase-counter').textContent =
        `${feitasRuns} de ${totalRuns} batida(s) concluída(s)`;

    document.getElementById('prod-export-quick').hidden = feitasRuns < 1;

    const tela = roteiro[estado.cursor];
    const prev = document.getElementById('prod-prev');
    const next = document.getElementById('prod-next');
    prev.disabled = estado.cursor === 0;

    if (tela.grupo === 'relatorio') { next.hidden = true; return; }
    next.hidden = false;

    const completa = telaCompleta(estado.cursor);
    next.disabled = !completa;

    const fimBatida = tela.grupo === 'batida' && tela.fase.id === ULTIMA_FASE_BATIDA;
    const proxima   = roteiro[estado.cursor + 1];

    if (fimBatida) {
        next.textContent = (proxima && proxima.grupo === 'batida')
            ? '✔ Concluir batida · Próxima →'
            : '✔ Concluir batida · Finalizar →';
    } else if (proxima && proxima.grupo === 'relatorio') {
        next.textContent = 'Ver relatório →';
    } else {
        next.textContent = 'Avançar →';
    }
    next.classList.toggle('is-finish', fimBatida && completa);
}

// ─── 7. NAVEGAÇÃO ────────────────────────────────────────────────────────────

function irPara(idx) {
    if (idx < 0 || idx >= roteiro.length) return;
    estado.cursor = idx;
    salvarEstado();
    renderizar();
}

function avancar() {
    const tela = roteiro[estado.cursor];
    if (tela.grupo !== 'relatorio' && !telaCompleta(estado.cursor)) return;

    if (tela.grupo === 'batida' && tela.fase.id === ULTIMA_FASE_BATIDA) {
        if (!estado.runsConcluidas[tela.runNo]) {
            estado.runsConcluidas[tela.runNo] = new Date().toISOString();
        }
    }
    if (estado.cursor < roteiro.length - 1) irPara(estado.cursor + 1);
}

function reiniciar() {
    iniciarPlano();
    roteiro = estado.plano.runs.length ? construirRoteiro(estado.plano) : [];
    renderizar();
}

// ─── 8. EXPORTAÇÃO EM PDF (via impressão do navegador) ────────────────────────

function fmt(iso) {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString('pt-BR'); } catch (_) { return '—'; }
}

function coletarMedicoes() {
    const linhas = [];
    roteiro.forEach((tela) => {
        if (tela.grupo === 'relatorio') return;
        const ctx = tela.grupo === 'inicio' ? 'Preparação'
            : tela.grupo === 'final' ? 'Finalização'
            : `Batida ${tela.run.n} ${tela.run.tipo === 'pan' ? 'Pan' : 'Trad'}`;
        itensVisiveis(tela).forEach((it) => {
            if (!it.campos) return;
            it.campos.forEach((c) => {
                const v = estado.medicoes[chaveCampo(tela, it._i, c.id)];
                if (v != null && v.toString().trim() !== '') {
                    linhas.push({ ctx, rotulo: c.rotulo, valor: v + (c.unidade ? ' ' + c.unidade : '') });
                }
            });
        });
    });
    return linhas;
}

function gerarRelatorioHTML() {
    const p = estado.plano || { runs: [], pesoTotal: 0, ingredientes: {} };
    const ing = p.ingredientes || {};
    const feitas = Object.keys(estado.runsConcluidas).length;

    const linhas = p.runs.map((r, i) => {
        const done = estado.runsConcluidas[i];
        const status = done ? 'Concluída' : (runTemProgresso(i) ? 'Parcial' : 'Não realizada');
        return `<tr>
            <td>${i + 1}</td>
            <td>${r.tipo === 'pan' ? 'Massa Pan' : 'Massa Tradicional'}</td>
            <td>${r.tamanho === 'meia' ? '5 kg' : '10 kg'}</td>
            <td>${status}</td>
            <td>${fmt(done)}</td>
        </tr>`;
    }).join('');

    const ingLinha = (nome, v) => `<span><strong>${nome}:</strong> ${v} kg</span>`;

    const meds = coletarMedicoes();
    const medHtml = meds.length ? `
        <h2>Medições registradas</h2>
        <table class="print-table">
            <thead><tr><th>Etapa</th><th>Medição</th><th>Valor</th></tr></thead>
            <tbody>${meds.map((m) => `<tr><td>${m.ctx}</td><td>${m.rotulo}</td><td>${m.valor}</td></tr>`).join('')}</tbody>
        </table>` : '';

    return `
    <div class="print-wrap">
        <div class="print-head">
            <div>
                <h1>Relatório de Produção de Massa</h1>
                <div class="print-sub">Domino's Pizza · Gestão de Produção</div>
            </div>
            <div class="print-meta">Gerado em<br><strong>${fmt(new Date().toISOString())}</strong></div>
        </div>

        <div class="print-info">
            <span><strong>Operador:</strong> ${estado.operador || '_______________'}</span>
            <span><strong>Loja:</strong> ${estado.loja || '_______________'}</span>
            <span><strong>Início:</strong> ${fmt(estado.iniciadoEm)}</span>
        </div>

        <h2>Plano programado</h2>
        <div class="print-info">
            <span><strong>Batidas:</strong> ${p.runs.length} (Trad: ${p.runs.filter(r=>r.tipo==='tradicional').length} · Pan: ${p.runs.filter(r=>r.tipo==='pan').length})</span>
            <span><strong>Peso total:</strong> ${(p.pesoTotal || 0).toFixed(2)} kg</span>
        </div>
        <div class="print-ing">
            ${ingLinha('Farinha', ing.farinha || '0')}
            ${ingLinha('Água', ing.agua || '0')}
            ${ingLinha('Óleo de soja', ing.oleo || '0')}
            ${ingLinha('Pré-mix', ing.premix || '0')}
            ${ingLinha('Fermento', ing.fermento || '0')}
            ${ingLinha('Óleo de palma', ing.oleoPalma || '0')}
        </div>

        <h2>Batidas — ${feitas} de ${p.runs.length} concluída(s)</h2>
        <table class="print-table">
            <thead><tr><th>#</th><th>Tipo</th><th>Batida</th><th>Status</th><th>Concluída em</th></tr></thead>
            <tbody>${linhas || '<tr><td colspan="5">Nenhuma batida no plano.</td></tr>'}</tbody>
        </table>

        ${medHtml}

        <div class="print-sign">
            <div>Responsável pela produção<br><br>____________________________</div>
            <div>Conferência / QA<br><br>____________________________</div>
        </div>
        <div class="print-foot">Documento gerado pelo Assistente de Produção · Domino's Pizza</div>
    </div>`;
}

function exportarPDF() {
    const cont = document.getElementById('prod-report-print');
    cont.innerHTML = gerarRelatorioHTML();
    window.print();
}

// ─── 9. ABRIR / FECHAR ───────────────────────────────────────────────────────

function abrirModal() {
    const temSessao = estado.plano && estado.plano.runs && estado.plano.runs.length;
    if (!temSessao) iniciarPlano();

    roteiro = (estado.plano && estado.plano.runs.length) ? construirRoteiro(estado.plano) : [];
    if (estado.cursor >= roteiro.length) estado.cursor = Math.max(0, roteiro.length - 1);

    document.getElementById('prod-overlay').hidden = false;
    document.body.style.overflow = 'hidden';
    renderizar();
}

function fecharModal() {
    document.getElementById('prod-overlay').hidden = true;
    document.body.style.overflow = '';
}

// ─── 10. INIT ────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    carregarEstado();
    construirModal();
    const btn = document.getElementById('btn-iniciar-producao');
    if (btn) btn.addEventListener('click', abrirModal);
});
