/**
 * Domino's Pizza - Calculadora de Matéria-Prima
 * Lógica do aplicativo e cálculo de insumos de produção.
 */

// --- 1. CONFIGURAÇÕES DAS FICHAS TÉCNICAS E RENDIMENTOS ---

// Fichas Técnicas por Batch (Valores em kg)
const BATCH_TRADICIONAL = {
    total: 16.16,
    farinha: 10.00,
    agua: 5.40,
    oleo: 0.38,
    premix: 0.34,
    fermento: 0.04,
    oleoPalma: 0.00
};

const BATCH_PAN = {
    total: 17.48,
    farinha: 10.00,
    agua: 5.60,
    oleo: 0.20,
    premix: 0.34,
    fermento: 0.04,
    oleoPalma: 1.30
};

// Rendimentos e Pesos por Bandeja (Valores em kg)
const MASSA_SPECS = {
    '7': {
        tipo: 'tradicional',
        pesoPorBandeja: 16.16 / 10 // 1.616 kg
    },
    '85': {
        tipo: 'tradicional',
        pesoPorBandeja: 16.16 / 6 // ~2.693333 kg (Usamos divisão exata para precisão matemática total)
    },
    '115': {
        tipo: 'tradicional',
        pesoPorBandeja: 16.16 / 5 // 3.232 kg
    },
    '14': {
        tipo: 'tradicional',
        pesoPorBandeja: 16.16 / 5 // 3.232 kg
    },
    'pan': {
        tipo: 'pan',
        pesoPorBandeja: 17.48 / 5 // 3.496 kg
    }
};

// --- 2. ELEMENTOS DO DOM ---

const inputs = {
    '7': document.getElementById('input-mass-7'),
    '85': document.getElementById('input-mass-85'),
    '115': document.getElementById('input-mass-115'),
    '14': document.getElementById('input-mass-14'),
    'pan': document.getElementById('input-mass-pan')
};

const previews = {
    '7': document.getElementById('preview-mass-7'),
    '85': document.getElementById('preview-mass-85'),
    '115': document.getElementById('preview-mass-115'),
    '14': document.getElementById('preview-mass-14'),
    'pan': document.getElementById('preview-mass-pan')
};

const outputs = {
    totalDough: document.getElementById('total-dough-weight'),
    flour: document.getElementById('total-flour'),
    water: document.getElementById('total-water'),
    oil: document.getElementById('total-oil'),
    premix: document.getElementById('total-premix'),
    yeast: document.getElementById('total-yeast'),
    palmoil: document.getElementById('total-palmoil'),
    batchesTrad: document.getElementById('batches-trad'),
    batchesPan: document.getElementById('batches-pan')
};

const btnReset = document.getElementById('btn-reset');

// --- 3. LÓGICA DE CÁLCULO ---

function calculateIngredients() {
    // Quantidade de bandejas inseridas pelo usuário
    const quantities = {
        '7': Math.max(0, parseInt(inputs['7'].value) || 0),
        '85': Math.max(0, parseInt(inputs['85'].value) || 0),
        '115': Math.max(0, parseInt(inputs['115'].value) || 0),
        '14': Math.max(0, parseInt(inputs['14'].value) || 0),
        'pan': Math.max(0, parseInt(inputs['pan'].value) || 0)
    };

    // 1. Calcular o peso total de cada tipo de massa com base nas bandejas
    let pesoTotalTradicional = 0;
    let pesoTotalPan = 0;

    for (const key in MASSA_SPECS) {
        const spec = MASSA_SPECS[key];
        const quant = quantities[key];
        const pesoMassa = quant * spec.pesoPorBandeja;

        // Atualizar o preview de peso individual no DOM
        if (previews[key]) {
            previews[key].textContent = pesoMassa.toFixed(3);
        }

        if (spec.tipo === 'tradicional') {
            pesoTotalTradicional += pesoMassa;
        } else if (spec.tipo === 'pan') {
            pesoTotalPan += pesoMassa;
        }
    }

    // Peso total geral de todas as massas
    const pesoTotalGeral = pesoTotalTradicional + pesoTotalPan;

    // 2. Calcular a proporção de cada ingrediente
    // Ingredientes = (Peso Total da Massa do Tipo) * (Ingrediente no Batch / Peso Total do Batch)
    
    // Tradicional
    const tradFlour = pesoTotalTradicional * (BATCH_TRADICIONAL.farinha / BATCH_TRADICIONAL.total);
    const tradWater = pesoTotalTradicional * (BATCH_TRADICIONAL.agua / BATCH_TRADICIONAL.total);
    const tradOil = pesoTotalTradicional * (BATCH_TRADICIONAL.oleo / BATCH_TRADICIONAL.total);
    const tradPremix = pesoTotalTradicional * (BATCH_TRADICIONAL.premix / BATCH_TRADICIONAL.total);
    const tradYeast = pesoTotalTradicional * (BATCH_TRADICIONAL.fermento / BATCH_TRADICIONAL.total);

    // Pan
    const panFlour = pesoTotalPan * (BATCH_PAN.farinha / BATCH_PAN.total);
    const panWater = pesoTotalPan * (BATCH_PAN.agua / BATCH_PAN.total);
    const panOil = pesoTotalPan * (BATCH_PAN.oleo / BATCH_PAN.total);
    const panPremix = pesoTotalPan * (BATCH_PAN.premix / BATCH_PAN.total);
    const panYeast = pesoTotalPan * (BATCH_PAN.fermento / BATCH_PAN.total);
    const panPalm = pesoTotalPan * (BATCH_PAN.oleoPalma / BATCH_PAN.total);

    // Consolidando os valores
    const totalFlour = tradFlour + panFlour;
    const totalWater = tradWater + panWater;
    const totalOil = tradOil + panOil;
    const totalPremix = tradPremix + panPremix;
    const totalYeast = tradYeast + panYeast;
    const totalPalmOil = panPalm; // Apenas Pan

    // 3. Calcular a quantidade de lotes (batches) necessários
    const batchesTradVal = pesoTotalTradicional / BATCH_TRADICIONAL.total;
    const batchesPanVal = pesoTotalPan / BATCH_PAN.total;

    // 4. Atualizar o DOM com os valores consolidados
    outputs.totalDough.textContent = pesoTotalGeral.toFixed(2);
    outputs.flour.textContent = totalFlour.toFixed(3);
    outputs.water.textContent = totalWater.toFixed(3);
    outputs.oil.textContent = totalOil.toFixed(3);
    outputs.premix.textContent = totalPremix.toFixed(3);
    outputs.yeast.textContent = totalYeast.toFixed(3);
    outputs.palmoil.textContent = totalPalmOil.toFixed(3);
    outputs.batchesTrad.textContent = batchesTradVal.toFixed(2);
    outputs.batchesPan.textContent = batchesPanVal.toFixed(2);
}

// --- 4. CONFIGURAÇÃO DOS EVENTOS ---

// Adicionar listener de input em todos os campos numéricos
for (const key in inputs) {
    if (inputs[key]) {
        inputs[key].addEventListener('input', () => {
            // Impedir valores negativos diretamente no tratamento de eventos
            if (parseInt(inputs[key].value) < 0) {
                inputs[key].value = 0;
            }
            calculateIngredients();
        });
        
        // Tratar o foco e comportamento amigável
        inputs[key].addEventListener('focus', function() {
            if (this.value === '0') {
                this.value = '';
            }
        });
        
        inputs[key].addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.value = '0';
                calculateIngredients();
            }
        });
    }
}

// Resetar o formulário
btnReset.addEventListener('click', () => {
    for (const key in inputs) {
        if (inputs[key]) {
            inputs[key].value = '0';
        }
    }
    calculateIngredients();
});

// Executar cálculo inicial ao carregar a página
document.addEventListener('DOMContentLoaded', calculateIngredients);
