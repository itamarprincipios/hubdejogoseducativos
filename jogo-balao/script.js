import { SpeechRecognizer } from '../jogo-leitura/js/recognition/SpeechRecognizer.js';
import { Evaluator } from '../jogo-leitura/js/evaluation/Evaluator.js';

// ── Configurações ────────────────────────────────
const WORDS = ["BOLA", "CASA", "DADO", "FOCA", "GATO", "LADO", "MAÇÃ", "PATO", "RATO", "SAPO"];
const COLORS = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"];

// ── Estado ───────────────────────────────────────
let score = 0;
let lives = 3;
let gameActive = false;
let recognizer = null;
let evaluator = new Evaluator();
let balloons = [];

// ── Elementos DOM ────────────────────────────────
const container = document.getElementById('game-canvas-container');
const scoreEl = document.getElementById('val-score');
const livesEl = document.getElementById('val-lives');
const speechText = document.getElementById('recognized-text');

const screens = {
    start: document.getElementById('screen-start'),
    game: document.getElementById('screen-game'),
    result: document.getElementById('screen-result')
};

// ── Inicialização ────────────────────────────────
function init() {
    recognizer = new SpeechRecognizer({
        onResult: (text, isFinal) => handleSpeech(text, isFinal),
        onPartial: (text) => speechText.textContent = text
    });

    document.getElementById('btn-play').addEventListener('click', async () => {
        await recognizer.init();
        startGame();
    });

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
    score = 0;
    lives = 3;
    gameActive = true;
    balloons = [];
    container.innerHTML = '';
    
    updateHUD();
    showScreen('game');
    
    recognizer.start();
    gameLoop();
}

function gameLoop() {
    if (!gameActive) return;

    // Chance de criar novo balão
    if (Math.random() < 0.02 && balloons.length < 5) {
        createBalloon();
    }

    // Move balões
    balloons.forEach((b, index) => {
        b.y -= b.speed;
        b.el.style.bottom = b.y + 'px';

        // Se fugiu da tela
        if (b.y > window.innerHeight) {
            removeBalloon(index, false);
            lives--;
            updateHUD();
            if (lives <= 0) endGame();
        }
    });

    requestAnimationFrame(gameLoop);
}

function createBalloon() {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const x = Math.random() * (container.clientWidth - 80);
    
    const el = document.createElement('div');
    el.className = 'balloon';
    el.style.left = x + 'px';
    el.style.setProperty('--color', color);
    el.innerHTML = `<span class="balloon-text">${word}</span>`;
    
    container.appendChild(el);
    
    balloons.push({
        el,
        word,
        y: -120,
        speed: 1 + Math.random() * 2
    });
}

function handleSpeech(text, isFinal) {
    if (!gameActive) return;
    speechText.textContent = text;

    // Procura balão que combine com o texto reconhecido
    balloons.forEach((b, index) => {
        const similarity = evaluator.evaluate(text, b.word);
        if (similarity > 0.8) {
            popBalloon(index);
        }
    });
}

function popBalloon(index) {
    const b = balloons[index];
    b.el.classList.add('pop');
    score++;
    updateHUD();
    
    setTimeout(() => {
        removeBalloon(index, true);
    }, 300);
}

function removeBalloon(index, wasPopped) {
    const b = balloons[index];
    if (b && b.el.parentNode) {
        b.el.parentNode.removeChild(b.el);
    }
    balloons.splice(index, 1);
}

function updateHUD() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
}

function endGame() {
    gameActive = false;
    recognizer.stop();
    document.getElementById('res-total').textContent = score;
    showScreen('result');
}

init();
