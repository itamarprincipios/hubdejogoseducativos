// ── Banco de Dados Expandido ───────────────────────
const POOL = {
    animais: [
        { name: "CACHORRO", img: "../assets/images/animais/cachorro.png" },
        { name: "GATO", img: "../assets/images/animais/gato.png" },
        { name: "PEIXE", img: "../assets/images/animais/peixe.png" },
        { name: "PÁSSARO", img: "../assets/images/animais/passaro.png" },
        { name: "LEÃO", img: "../assets/images/animais/leao.png" },
        { name: "ELEFANTE", img: "../assets/images/animais/elefante.png" },
        { name: "GIRAFA", img: "../assets/images/animais/girafa.png" },
        { name: "MACACO", img: "../assets/images/animais/macaco.png" },
        { name: "ZEBRA", img: "../assets/images/animais/zebra.png" },
        { name: "COELHO", img: "../assets/images/animais/coelho.png" },
        { name: "URSO", img: "../assets/images/animais/urso.png" },
        { name: "TARTARUGA", img: "../assets/images/animais/tartaruga.png" },
        { name: "PINGUIM", img: "../assets/images/animais/pinguim.png" },
        { name: "ABELHA", img: "../assets/images/animais/abelha.png" },
        { name: "TUBARÃO", img: "../assets/images/animais/tubarao.png" }
    ],
    frutas: [
        { name: "MAÇÃ", img: "../assets/images/frutas/maca.png" },
        { name: "BANANA", img: "../assets/images/frutas/banana.png" },
        { name: "UVA", img: "../assets/images/frutas/uva.png" },
        { name: "MORANGO", img: "../assets/images/frutas/morango.png" },
        { name: "MELANCIA", img: "../assets/images/frutas/melancia.png" },
        { name: "LARANJA", img: "../assets/images/frutas/laranja.png" },
        { name: "ABACAXI", img: "../assets/images/frutas/abacaxi.png" },
        { name: "LIMÃO", img: "../assets/images/frutas/limao.png" },
        { name: "CEREJA", img: "../assets/images/frutas/cereja.png" },
        { name: "MANGA", img: "../assets/images/frutas/manga.png" },
        { name: "KIWI", img: "../assets/images/frutas/kiwi.png" },
        { name: "PERA", img: "../assets/images/frutas/pera.png" },
        { name: "MELÃO", img: "../assets/images/frutas/melao.png" },
        { name: "MAMÃO", img: "../assets/images/frutas/mamao.png" },
        { name: "PESSEGO", img: "../assets/images/frutas/pessego.png" }
    ],
    objetos: [
        { name: "MOCHILA", img: "../assets/images/objetos/mochila.png" },
        { name: "LÁPIS", img: "../assets/images/objetos/lapis.png" },
        { name: "LIVRO", img: "../assets/images/objetos/livro.png" },
        { name: "CADEIRA", img: "../assets/images/objetos/cadeira.png" },
        { name: "BOLA", img: "../assets/images/objetos/bola.png" },
        { name: "TESOURA", img: "../assets/images/objetos/tesoura.png" },
        { name: "REGUA", img: "../assets/images/objetos/regua.png" },
        { name: "CADERNO", img: "../assets/images/objetos/caderno.png" },
        { name: "CANETA", img: "../assets/images/objetos/caneta.png" },
        { name: "MESA", img: "../assets/images/objetos/mesa.png" },
        { name: "RELOGIO", img: "../assets/images/objetos/relogio.png" },
        { name: "TELEFONE", img: "../assets/images/objetos/telefone.png" },
        { name: "PRATO", img: "../assets/images/objetos/prato.png" },
        { name: "COPO", img: "../assets/images/objetos/copo.png" },
        { name: "GARFO", img: "../assets/images/objetos/garfo.png" }
    ]
};

// ── Estado ───────────────────────────────────────
let currentLevel = 1;
let matchedCount = 0;
let totalItems = 0;
let draggedElement = null;
let currentRoundData = [];

// ── Elementos DOM ────────────────────────────────
const screens = {
    start: document.getElementById('screen-start'),
    game: document.getElementById('screen-game'),
    result: document.getElementById('screen-result')
};

const itemsColumn = document.getElementById('items-column');
const slotsColumn = document.getElementById('slots-column');
const statProgress = document.getElementById('stat-progress');

// ── Inicialização ────────────────────────────────
function init() {
    document.getElementById('btn-play').addEventListener('click', () => {
        currentLevel = 1;
        startGame();
    });
    
    document.getElementById('btn-back-menu').addEventListener('click', () => showScreen('start'));
    document.getElementById('btn-restart').addEventListener('click', startGame);
    document.getElementById('btn-home').addEventListener('click', () => showScreen('start'));
}

function showScreen(name) {
    Object.entries(screens).forEach(([k, el]) => {
        el.classList.toggle('active', k === name);
    });
}

// ── Lógica do Jogo ───────────────────────────────
function startGame() {
    matchedCount = 0;
    currentRoundData = getLevelData(currentLevel);
    totalItems = currentRoundData.length;
    
    itemsColumn.innerHTML = '';
    slotsColumn.innerHTML = '';
    
    // Embaralha itens para as colunas
    const shuffledItems = [...currentRoundData].sort(() => Math.random() - 0.5);
    const shuffledSlots = [...currentRoundData].sort(() => Math.random() - 0.5);

    shuffledItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'assoc-item';
        // Adicionado ?v=17 para forçar o carregamento das novas imagens locais
        div.innerHTML = `<img src="${item.img}?v=17" alt="${item.name}" draggable="false" onerror="this.onerror=null; this.src='https://placehold.jp/24/5c67f2/ffffff/200x200.png?text=${item.name}';">`;
        div.draggable = true;
        div.dataset.name = item.name;
        
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragend', handleDragEnd);
        div.addEventListener('touchstart', handleTouchStart, { passive: false });
        div.addEventListener('touchmove', handleTouchMove, { passive: false });
        div.addEventListener('touchend', handleTouchEnd);

        itemsColumn.appendChild(div);
    });

    shuffledSlots.forEach(item => {
        const div = document.createElement('div');
        div.className = 'assoc-slot';
        div.dataset.match = item.name;
        div.innerHTML = `<span class="slot-label">${item.name}</span>`;
        
        div.addEventListener('dragover', e => e.preventDefault());
        div.addEventListener('dragenter', () => div.classList.add('hover'));
        div.addEventListener('dragleave', () => div.classList.remove('hover'));
        div.addEventListener('drop', handleDrop);

        slotsColumn.appendChild(div);
    });

    updateHUD();
    showScreen('game');
}

function getLevelData(level) {
    let all = [];
    let count = 4;

    switch(level) {
        case 1: 
            all = POOL.animais; 
            count = 4; 
            break;
        case 2: 
            all = POOL.frutas; 
            count = 5; 
            break;
        case 3: 
            all = POOL.objetos; 
            count = 5; 
            break;
        case 4: 
            all = [...POOL.animais, ...POOL.frutas]; 
            count = 6; 
            break;
        case 5: 
            all = [...POOL.animais, ...POOL.frutas, ...POOL.objetos]; 
            count = 8; 
            break;
        default: 
            all = [...POOL.animais, ...POOL.frutas, ...POOL.objetos]; 
            count = 8;
    }

    return [...all].sort(() => Math.random() - 0.5).slice(0, count);
}

// ── Áudio (Web Audio API) ─────────────────────────
let _audioCtx = null;
function getAudioCtx() {
    if (!_audioCtx || _audioCtx.state === 'closed') {
        _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    return _audioCtx;
}

function playCorrect() {
    const ctx = getAudioCtx();
    const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
    freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.3);
    });
}

function playWrong() {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
}

// ── Handlers ─────────────────────────────────────
function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
}

function handleDragEnd() {
    this.classList.remove('dragging');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('hover');
    
    if (!draggedElement) return;

    const itemName = draggedElement.dataset.name;
    const slotMatch = this.dataset.match;

    if (itemName === slotMatch) {
        processMatch(draggedElement, this);
    } else {
        playWrong();
        this.classList.add('error');
        setTimeout(() => this.classList.remove('error'), 500);
    }
}

// ── Touch Handlers (Otimizados) ──────────────────
let touchOffset = { x: 0, y: 0 };

function handleTouchStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    const touch = e.touches[0];
    const rect = this.getBoundingClientRect();
    touchOffset.x = touch.clientX - rect.left;
    touchOffset.y = touch.clientY - rect.top;
}

function handleTouchMove(e) {
    if (!draggedElement) return;
    e.preventDefault();
    const touch = e.touches[0];
    
    draggedElement.style.position = 'fixed';
    draggedElement.style.zIndex = '1000';
    draggedElement.style.left = (touch.clientX - touchOffset.x) + 'px';
    draggedElement.style.top = (touch.clientY - touchOffset.y) + 'px';
    draggedElement.style.pointerEvents = 'none';

    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const slot = target?.closest('.assoc-slot');
    
    document.querySelectorAll('.assoc-slot').forEach(s => s.classList.remove('hover'));
    if (slot && !slot.classList.contains('matched')) {
        slot.classList.add('hover');
    }
}

function handleTouchEnd(e) {
    if (!draggedElement) return;
    this.classList.remove('dragging');
    this.style.pointerEvents = 'auto';

    const rect = this.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let foundSlot = null;
    document.querySelectorAll('.assoc-slot').forEach(slot => {
        if (slot.classList.contains('matched')) return;
        const sRect = slot.getBoundingClientRect();
        if (centerX >= sRect.left && centerX <= sRect.right &&
            centerY >= sRect.top && centerY <= sRect.bottom) {
            foundSlot = slot;
        }
    });

    if (foundSlot) {
        if (this.dataset.name === foundSlot.dataset.match) {
            processMatch(this, foundSlot);
        } else {
            playWrong();
            foundSlot.classList.add('error');
            setTimeout(() => foundSlot.classList.remove('error'), 500);
        }
    }

    this.style.position = '';
    this.style.left = '';
    this.style.top = '';
    this.style.zIndex = '';
    document.querySelectorAll('.assoc-slot').forEach(s => s.classList.remove('hover'));
    draggedElement = null;
}

function processMatch(item, slot) {
    item.classList.add('matched');
    slot.classList.add('matched');
    slot.innerHTML = `<div class="slot-img-container">${item.innerHTML}</div><span class="slot-label">${slot.dataset.match}</span>`;
    
    playCorrect();

    matchedCount++;
    updateHUD();

    if (matchedCount === totalItems) {
        setTimeout(nextLevel, 1000);
    }
}

function nextLevel() {
    currentLevel++;
    if (currentLevel > 5) {
        showScreen('result');
    } else {
        startGame();
    }
}

function updateHUD() {
    statProgress.innerHTML = `Nível ${currentLevel} &nbsp;|&nbsp; Acertos: ${matchedCount} / ${totalItems}`;
}

function playSound(src) {
    // Mantido por compatibilidade, mas agora usamos playCorrect/playWrong diretamente
}

init();
