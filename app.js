/**
 * Domino's Pizza - Calculadora de Matéria-Prima v2.0
 * Lógica de cálculo de insumos de produção com barras de progresso animadas.
 */

// ─── 1. FICHAS TÉCNICAS POR BATCH ───────────────────────────────────────────

// Ficha técnica — Batida de 10 kg (manual Comissariado 2026, pág. 16-17)
const BATCH_TRADICIONAL = {
    total:     16.26,   // 10 + 5,5 + 0,38 + 0,34 + 0,04
    farinha:   10.00,
    agua:       5.50,   // água total (5,3 massa + 0,2 fermento)
    oleo:       0.38,
    premix:     0.34,
    fermento:   0.04,
    oleoPalma:  0.00
};

const BATCH_PAN = {
    total:     17.38,   // 10 + 5,5 + 0,20 + 0,34 + 0,04 + 1,30
    farinha:   10.00,
    agua:       5.50,   // água total (5,3 massa + 0,2 fermento)
    oleo:       0.20,
    premix:     0.34,
    fermento:   0.04,
    oleoPalma:  1.30
};

// Peso por bandeja (kg) — valores oficiais da ficha técnica (manual, pág. 10)
const MASSA_SPECS = {
    '7':   { tipo: 'tradicional', pesoPorBandeja: 1.560 },  // Bandeja 7"
    '85':  { tipo: 'tradicional', pesoPorBandeja: 2.920 },  // Bandeja 8,5" (tabela de rendimento)
    '115': { tipo: 'tradicional', pesoPorBandeja: 2.920 },  // Bandeja 11,5"
    '14':  { tipo: 'tradicional', pesoPorBandeja: 3.240 },  // Bandeja 14"
    'pan': { tipo: 'pan',         pesoPorBandeja: 3.150 }   // Bandeja 11,5" Pan
};

// ─── 2. CHART (removido) ─────────────────────────────────────────────────────

// ─── 3. DOM REFERENCES ───────────────────────────────────────────────────────

const inputs = {
    '7':   document.getElementById('input-mass-7'),
    '85':  document.getElementById('input-mass-85'),
    '115': document.getElementById('input-mass-115'),
    '14':  document.getElementById('input-mass-14'),
    'pan': document.getElementById('input-mass-pan')
};

const previews = {
    '7':   document.getElementById('preview-mass-7'),
    '85':  document.getElementById('preview-mass-85'),
    '115': document.getElementById('preview-mass-115'),
    '14':  document.getElementById('preview-mass-14'),
    'pan': document.getElementById('preview-mass-pan')
};

const outputs = {
    totalDough:  document.getElementById('total-dough-weight'),
    flour:       document.getElementById('total-flour'),
    water:       document.getElementById('total-water'),
    oil:         document.getElementById('total-oil'),
    premix:      document.getElementById('total-premix'),
    yeast:       document.getElementById('total-yeast'),
    palmoil:     document.getElementById('total-palmoil'),
    batchesTrad: document.getElementById('batches-trad'),
    batchesPan:  document.getElementById('batches-pan')
};

const bars = {
    flour:   document.getElementById('bar-flour'),
    water:   document.getElementById('bar-water'),
    oil:     document.getElementById('bar-oil'),
    premix:  document.getElementById('bar-premix'),
    yeast:   document.getElementById('bar-yeast'),
    palmoil: document.getElementById('bar-palmoil')
};

const btnReset = document.getElementById('btn-reset');

// ─── 4. CÁLCULO PRINCIPAL ────────────────────────────────────────────────────

function calculateIngredients() {
    // Ler quantidades de bandejas
    const qty = {};
    for (const key in inputs) {
        qty[key] = Math.max(0, parseInt(inputs[key].value) || 0);
    }

    // Calcular peso por tipo
    let pesoTrad = 0;
    let pesoPan  = 0;

    for (const key in MASSA_SPECS) {
        const spec  = MASSA_SPECS[key];
        const peso  = qty[key] * spec.pesoPorBandeja;

        // Atualizar preview individual
        if (previews[key]) previews[key].textContent = peso.toFixed(3);

        if (spec.tipo === 'tradicional') pesoTrad += peso;
        else                             pesoPan  += peso;
    }

    const pesoTotal = pesoTrad + pesoPan;

    // Ingredientes Tradicional
    const tradFlour  = pesoTrad * (BATCH_TRADICIONAL.farinha  / BATCH_TRADICIONAL.total);
    const tradWater  = pesoTrad * (BATCH_TRADICIONAL.agua     / BATCH_TRADICIONAL.total);
    const tradOil    = pesoTrad * (BATCH_TRADICIONAL.oleo     / BATCH_TRADICIONAL.total);
    const tradPremix = pesoTrad * (BATCH_TRADICIONAL.premix   / BATCH_TRADICIONAL.total);
    const tradYeast  = pesoTrad * (BATCH_TRADICIONAL.fermento / BATCH_TRADICIONAL.total);

    // Ingredientes Pan
    const panFlour   = pesoPan * (BATCH_PAN.farinha    / BATCH_PAN.total);
    const panWater   = pesoPan * (BATCH_PAN.agua       / BATCH_PAN.total);
    const panOil     = pesoPan * (BATCH_PAN.oleo       / BATCH_PAN.total);
    const panPremix  = pesoPan * (BATCH_PAN.premix     / BATCH_PAN.total);
    const panYeast   = pesoPan * (BATCH_PAN.fermento   / BATCH_PAN.total);
    const panPalm    = pesoPan * (BATCH_PAN.oleoPalma  / BATCH_PAN.total);

    // Totais consolidados
    const totalFlour   = tradFlour  + panFlour;
    const totalWater   = tradWater  + panWater;
    const totalOil     = tradOil    + panOil;
    const totalPremix  = tradPremix + panPremix;
    const totalYeast   = tradYeast  + panYeast;
    const totalPalmOil = panPalm;

    // Batches: com sugestão de meia batida quando a fração não completa um inteiro
    const rawTrad = pesoTrad > 0 ? pesoTrad / BATCH_TRADICIONAL.total : 0;
    const rawPan  = pesoPan  > 0 ? pesoPan  / BATCH_PAN.total         : 0;

    function formatBatida(raw) {
        if (raw === 0) return { display: '0', hint: 'batida(s) necessária(s)' };
        const intPart  = Math.floor(raw);
        const fracPart = raw - intPart;

        // Exato — sem fração
        if (fracPart < 0.01) {
            return { display: String(intPart), hint: 'batida(s) necessária(s)' };
        }
        // Fração ≤ 0.5 — sugerir meia batida
        if (fracPart <= 0.5) {
            const decimalVal = intPart + 0.5;
            return { display: String(decimalVal).replace('.', ','), hint: '💡 sugestão: meia batida' };
        }
        // Fração > 0.5 — arredondar para cima
        return { display: String(intPart + 1), hint: 'batida(s) necessária(s)' };
    }

    const tradResult = formatBatida(rawTrad);
    const panResult  = formatBatida(rawPan);

    // ── Atualizar DOM ──
    outputs.totalDough.textContent  = pesoTotal.toFixed(2);
    outputs.flour.textContent       = totalFlour.toFixed(3);
    outputs.water.textContent       = totalWater.toFixed(3);
    outputs.oil.textContent         = totalOil.toFixed(3);
    outputs.premix.textContent      = totalPremix.toFixed(3);
    outputs.yeast.textContent       = totalYeast.toFixed(3);
    outputs.palmoil.textContent     = totalPalmOil.toFixed(3);
    outputs.batchesTrad.textContent = tradResult.display;
    outputs.batchesPan.textContent  = panResult.display;

    // Atualizar hint text
    const hintTrad = document.getElementById('batches-trad-hint');
    const hintPan  = document.getElementById('batches-pan-hint');
    if (hintTrad) hintTrad.textContent = tradResult.hint;
    if (hintPan)  hintPan.textContent  = panResult.hint;

    // ── Atualizar barras de progresso ──
    const maxIngredient = Math.max(totalFlour, totalWater, totalOil, totalPremix, totalYeast, totalPalmOil, 0.001);

    function setBar(barEl, value) {
        if (!barEl) return;
        const pct = Math.max(0, Math.min(100, (value / maxIngredient) * 100));
        barEl.style.width = pct + '%';
    }

    setBar(bars.flour,   totalFlour);
    setBar(bars.water,   totalWater);
    setBar(bars.oil,     totalOil);
    setBar(bars.premix,  totalPremix);
    setBar(bars.yeast,   totalYeast);
    setBar(bars.palmoil, totalPalmOil);
}

// ─── 5. EVENT LISTENERS ──────────────────────────────────────────────────────

for (const key in inputs) {
    if (!inputs[key]) continue;

    inputs[key].addEventListener('input', () => {
        if (parseInt(inputs[key].value) < 0) inputs[key].value = 0;
        calculateIngredients();
    });

    inputs[key].addEventListener('focus', function () {
        if (this.value === '0') this.value = '';
    });

    inputs[key].addEventListener('blur', function () {
        if (this.value.trim() === '') {
            this.value = '0';
            calculateIngredients();
        }
    });
}

btnReset.addEventListener('click', () => {
    // Limpa também a sessão do assistente de produção (aborta se o usuário cancelar)
    if (window.limparProducao && !window.limparProducao(true)) return;
    for (const key in inputs) {
        if (inputs[key]) inputs[key].value = '0';
    }
    calculateIngredients();
});

// ─── 6. INIT ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    calculateIngredients();
});

// ─── 7. PLANO DE PRODUÇÃO (consumido pelo assistente producao.js) ────────────

function obterPlanoProducao() {
    const qty = {};
    for (const key in inputs) {
        qty[key] = Math.max(0, parseInt(inputs[key].value) || 0);
    }

    let pesoTrad = 0, pesoPan = 0;
    for (const key in MASSA_SPECS) {
        const peso = qty[key] * MASSA_SPECS[key].pesoPorBandeja;
        if (MASSA_SPECS[key].tipo === 'tradicional') pesoTrad += peso;
        else                                         pesoPan  += peso;
    }

    // Converte o peso total em uma lista de batidas: 'cheia' (10kg) ou 'meia' (5kg)
    function listarBatidas(peso, totalBatch) {
        if (peso <= 0) return [];
        const raw    = peso / totalBatch;
        const cheias = Math.floor(raw);
        const frac   = raw - cheias;
        const lista  = [];
        for (let i = 0; i < cheias; i++) lista.push('cheia');
        if (frac >= 0.01 && frac <= 0.5) lista.push('meia');
        else if (frac > 0.5)             lista.push('cheia');
        return lista;
    }

    const runs = [];
    listarBatidas(pesoTrad, BATCH_TRADICIONAL.total).forEach((tam) =>
        runs.push({ tipo: 'tradicional', tamanho: tam }));
    listarBatidas(pesoPan, BATCH_PAN.total).forEach((tam) =>
        runs.push({ tipo: 'pan', tamanho: tam }));

    const val = (id) => (document.getElementById(id) || {}).textContent || '0';

    return {
        qty,
        pesoTrad, pesoPan, pesoTotal: pesoTrad + pesoPan,
        runs,
        ingredientes: {
            farinha:   val('total-flour'),
            agua:      val('total-water'),
            oleo:      val('total-oil'),
            premix:    val('total-premix'),
            fermento:  val('total-yeast'),
            oleoPalma: val('total-palmoil')
        }
    };
}

window.obterPlanoProducao = obterPlanoProducao;
