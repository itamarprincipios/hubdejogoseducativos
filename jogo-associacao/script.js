// ── Dados do Jogo ────────────────────────────────
const DATA = {
    animais: [
        { name: "CACHORRO", icon: "🐶" },
        { name: "GATO", icon: "🐱" },
        { name: "PEIXE", icon: "🐟" },
        { name: "PÁSSARO", icon: "🐦" },
        { name: "LEÃO", icon: "🦁" }
    ],
    frutas: [
        { name: "MAÇÃ", icon: "🍎" },
        { name: "BANANA", icon: "🍌" },
        { name: "UVA", icon: "🍇" },
        { name: "MORANGO", icon: "🍓" },
        { name: "MELANCIA", icon: "🍉" }
    ],
    objetos: [
        { name: "MOCHILA", icon: "🎒" },
        { name: "LÁPIS", icon: "✏️" },
        { name: "LIVRO", icon: "📖" },
        { name: "CADEIRA", icon: "🪑" },
        { name: "BOLA", icon: "⚽" }
    ]
};

// ── Estado ───────────────────────────────────────
let currentCategory = null;
let matchedCount = 0;
let totalItems = 0;
let draggedElement = null;

// ── Elementos DOM ────────────────────────────────
const screens = {
    start: document.getElementById('screen-start'),
    game: document.getElementById('screen-game'),
    result: document.getElementById('screen-result')
};

const itemsColumn = document.getElementById('items-column');
const slotsColumn = document.getElementById('slots-column');
const btnPlay = document.getElementById('btn-play');
const statProgress = document.getElementById('stat-progress');

// ── Inicialização ────────────────────────────────
function init() {
    // Listeners de categoria
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            currentCategory = btn.dataset.cat;
            btnPlay.disabled = false;
            btnPlay.textContent = "▶ Começar!";
        });
    });

    btnPlay.addEventListener('click', startGame);
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
    if (!currentCategory) return;
    
    matchedCount = 0;
    const items = [...DATA[currentCategory]];
    totalItems = items.length;
    
    itemsColumn.innerHTML = '';
    slotsColumn.innerHTML = '';
    
    // Embaralha itens para a coluna da esquerda
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    // Embaralha slots para a coluna da direita
    const shuffledSlots = [...items].sort(() => Math.random() - 0.5);

    shuffledItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'assoc-item';
        div.textContent = item.icon;
        div.draggable = true;
        div.dataset.name = item.name;
        
        // Eventos de Drag & Drop (Mouse)
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragend', handleDragEnd);

        // Eventos de Toque (Mobile/Tablet)
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

    updateProgress();
    showScreen('game');
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
        // Feedback de erro visual opcional
        this.classList.add('error');
        setTimeout(() => this.classList.remove('error'), 500);
    }
}

// ── Touch Handlers (Mobile) ──────────────────────
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

    // Highlight slot sob o toque
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const slot = target?.closest('.assoc-slot');
    
    document.querySelectorAll('.assoc-slot').forEach(s => s.classList.remove('hover'));
    if (slot && !slot.classList.contains('matched')) {
        slot.classList.add('hover');
    }
}

function handleTouchEnd(e) {
    this.classList.remove('dragging');
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const slot = target?.closest('.assoc-slot');

    if (slot && !slot.classList.contains('matched')) {
        const itemName = this.dataset.name;
        const slotMatch = slot.dataset.match;

        if (itemName === slotMatch) {
            processMatch(this, slot);
        }
    }

    // Reset styles
    this.style.position = '';
    this.style.left = '';
    this.style.top = '';
    this.style.zIndex = '';
    document.querySelectorAll('.assoc-slot').forEach(s => s.classList.remove('hover'));
}

function processMatch(item, slot) {
    item.classList.add('matched');
    slot.classList.add('matched');
    slot.innerHTML = `<span class="slot-image">${item.textContent}</span><span class="slot-label">${slot.dataset.match}</span>`;
    
    matchedCount++;
    updateProgress();

    if (matchedCount === totalItems) {
        setTimeout(() => showScreen('result'), 600);
    }
}

function updateProgress() {
    statProgress.textContent = `${matchedCount} / ${totalItems}`;
}

init();
