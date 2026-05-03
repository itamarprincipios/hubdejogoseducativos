// ── Banco de Dados Expandido ───────────────────────
const POOL = {
    animais: [
        { name: "CACHORRO", img: "../assets/images/animais/cachorro.png" },
        { name: "GATO", img: "../assets/images/animais/gato.png" },
        { name: "PEIXE", img: "../assets/images/animais/peixe.png" },
        { name: "PÁSSARO", img: "../assets/images/animais/passaro.png" },
        { name: "LEÃO", img: "../assets/images/animais/leao.png" },
        { name: "ELEFANTE", img: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=200&h=200&fit=crop" },
        { name: "GIRAFA", img: "https://images.unsplash.com/photo-1545468800-85cc9bc6ecf7?w=200&h=200&fit=crop" },
        { name: "MACACO", img: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=200&h=200&fit=crop" },
        { name: "ZEBRA", img: "https://images.unsplash.com/photo-1526081347589-7fa3cb41b4b2?w=200&h=200&fit=crop" },
        { name: "COELHO", img: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200&h=200&fit=crop" },
        { name: "URSO", img: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=200&h=200&fit=crop" },
        { name: "TARTARUGA", img: "https://images.unsplash.com/photo-1541010145217-183693f18a59?w=200&h=200&fit=crop" },
        { name: "PINGUIM", img: "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=200&h=200&fit=crop" },
        { name: "ABELHA", img: "https://images.unsplash.com/photo-1558223961-9d9036c01e68?w=200&h=200&fit=crop" },
        { name: "TUBARÃO", img: "https://images.unsplash.com/photo-1560273074-c9317399413c?w=200&h=200&fit=crop" }
    ],
    frutas: [
        { name: "MAÇÃ", img: "../assets/images/frutas/maca.png" },
        { name: "BANANA", img: "../assets/images/frutas/banana.png" },
        { name: "UVA", img: "../assets/images/frutas/uva.png" },
        { name: "MORANGO", img: "../assets/images/frutas/morango.png" },
        { name: "MELANCIA", img: "../assets/images/frutas/melancia.png" },
        { name: "LARANJA", img: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=200&h=200&fit=crop" },
        { name: "ABACAXI", img: "https://images.unsplash.com/photo-1550258114-b0d2475b5394?w=200&h=200&fit=crop" },
        { name: "LIMÃO", img: "https://images.unsplash.com/photo-1590502593747-42a996133562?w=200&h=200&fit=crop" },
        { name: "CEREJA", img: "https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=200&h=200&fit=crop" },
        { name: "MANGA", img: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&h=200&fit=crop" },
        { name: "KIWI", img: "https://images.unsplash.com/photo-1591735156682-6b638971b052?w=200&h=200&fit=crop" },
        { name: "PERA", img: "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=200&h=200&fit=crop" },
        { name: "MELÃO", img: "https://images.unsplash.com/photo-1571575173700-afb9492e6a50?w=200&h=200&fit=crop" },
        { name: "MAMÃO", img: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=200&h=200&fit=crop" },
        { name: "PESSEGO", img: "https://images.unsplash.com/photo-1629911723982-433f8994793d?w=200&h=200&fit=crop" }
    ],
    objetos: [
        { name: "MOCHILA", img: "../assets/images/objetos/mochila.png" },
        { name: "LÁPIS", img: "../assets/images/objetos/lapis.png" },
        { name: "LIVRO", img: "../assets/images/objetos/livro.png" },
        { name: "CADEIRA", img: "../assets/images/objetos/cadeira.png" },
        { name: "BOLA", img: "../assets/images/objetos/bola.png" },
        { name: "TESOURA", img: "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=200&h=200&fit=crop" },
        { name: "REGUA", img: "https://images.unsplash.com/photo-1586075010633-2470ac20283b?w=200&h=200&fit=crop" },
        { name: "CADERNO", img: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=200&h=200&fit=crop" },
        { name: "CANETA", img: "https://images.unsplash.com/photo-1585336139118-89c15310f669?w=200&h=200&fit=crop" },
        { name: "MESA", img: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=200&h=200&fit=crop" },
        { name: "RELOGIO", img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=200&h=200&fit=crop" },
        { name: "TELEFONE", img: "https://images.unsplash.com/photo-1520923179270-e0a537c3e574?w=200&h=200&fit=crop" },
        { name: "PRATO", img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=200&fit=crop" },
        { name: "COPO", img: "https://images.unsplash.com/photo-1517254456976-ee8682099819?w=200&h=200&fit=crop" },
        { name: "GARFO", img: "https://images.unsplash.com/photo-1550332910-acc253bc86bc?w=200&h=200&fit=crop" }
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
        div.innerHTML = `<img src="${item.img}" alt="${item.name}" draggable="false" onerror="this.onerror=null; this.src='https://placehold.jp/24/5c67f2/ffffff/200x200.png?text=${item.name}';">`;
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
    
    const itemName = draggedElement.dataset.name;
    const slotMatch = this.dataset.match;

    if (itemName === slotMatch) {
        processMatch(draggedElement, this);
    } else {
        playSound('../jogo-leitura/assets/sounds/wrong.mp3');
        this.classList.add('error');
        setTimeout(() => this.classList.remove('error'), 500);
    }
}

// ── Touch Handlers ───────────────────────────────
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
    this.classList.remove('dragging');
    this.style.pointerEvents = 'auto';

    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const slot = target?.closest('.assoc-slot');

    if (slot && !slot.classList.contains('matched')) {
        if (this.dataset.name === slot.dataset.match) {
            processMatch(this, slot);
        } else {
            playSound('../jogo-leitura/assets/sounds/wrong.mp3');
            slot.classList.add('error');
            setTimeout(() => slot.classList.remove('error'), 500);
        }
    }

    this.style.position = '';
    this.style.left = '';
    this.style.top = '';
    this.style.zIndex = '';
    document.querySelectorAll('.assoc-slot').forEach(s => s.classList.remove('hover'));
}

function processMatch(item, slot) {
    item.classList.add('matched');
    slot.classList.add('matched');
    slot.innerHTML = `<div class="slot-img-container">${item.innerHTML}</div><span class="slot-label">${slot.dataset.match}</span>`;
    
    playSound('../jogo-leitura/assets/sounds/correct.mp3');

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
    const audio = new Audio(src);
    audio.volume = 0.5;
    audio.play().catch(() => {});
}

init();
