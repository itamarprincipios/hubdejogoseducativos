// ── Pool de Dados ────────────────────────────────
const POOL = [
    { word: "CASA", icon: "🏠" },
    { word: "BOLA", icon: "⚽" },
    { word: "GATO", icon: "🐱" },
    { word: "SOL", icon: "☀️" },
    { word: "MAÇÃ", icon: "🍎" },
    { word: "CARRO", icon: "🚗" },
    { word: "LIVRO", icon: "📖" },
    { word: "PEIXE", icon: "🐟" },
    { word: "ÁRVORE", icon: "🌳" },
    { word: "LÁPIS", icon: "✏️" },
    { word: "MESA", icon: "🪑" },
    { word: "BOLO", icon: "🎂" },
    { word: "FLOR", icon: "🌸" },
    { word: "DADO", icon: "🎲" },
    { word: "SAPO", icon: "🐸" }
];

// ── Estado ───────────────────────────────────────
let currentLevel = "facil";
let currentQuestionIndex = 0;
let questions = [];
let score = { correct: 0, wrong: 0 };
let canAnswer = true;

// ── Elementos DOM ────────────────────────────────
const screens = {
    start: document.getElementById('screen-start'),
    game: document.getElementById('screen-game'),
    result: document.getElementById('screen-result')
};

const wordDisplay = document.getElementById('word-display');
const optionsGrid = document.getElementById('options-grid');
const progressBar = document.getElementById('progress-bar');
const counterDisplay = document.getElementById('question-counter');

// ── Inicialização ────────────────────────────────
function init() {
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            currentLevel = btn.dataset.level;
        });
    });

    document.getElementById('btn-play').addEventListener('click', startGame);
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
    currentQuestionIndex = 0;
    score = { correct: 0, wrong: 0 };
    
    // Gera 10 questões aleatórias
    questions = generateQuestions(10);
    
    showScreen('game');
    loadQuestion();
}

function generateQuestions(count) {
    const shuffled = [...POOL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(q => {
        // Pega 3 erradas
        const wrong = POOL.filter(item => item.word !== q.word)
                          .sort(() => Math.random() - 0.5)
                          .slice(0, 3);
        
        const options = [...wrong, q].sort(() => Math.random() - 0.5);
        return { ...q, options };
    });
}

function loadQuestion() {
    canAnswer = true;
    const q = questions[currentQuestionIndex];
    
    wordDisplay.textContent = q.word;
    optionsGrid.innerHTML = '';
    
    // TTS: Fala a palavra para ajudar (opcional, pode ser irritante se muito alto)
    speakWord(q.word.toLowerCase());

    q.options.forEach(opt => {
        const btn = document.createElement('div');
        btn.className = 'option-btn';
        btn.textContent = opt.icon;
        btn.addEventListener('click', () => handleAnswer(opt, btn));
        optionsGrid.appendChild(btn);
    });

    updateUI();
}

function handleAnswer(selected, element) {
    if (!canAnswer) return;
    canAnswer = false;

    const correct = questions[currentQuestionIndex];
    const isCorrect = selected.word === correct.word;

    if (isCorrect) {
        score.correct++;
        element.classList.add('correct');
        playFeedbackSound(true);
    } else {
        score.wrong++;
        element.classList.add('wrong');
        playFeedbackSound(false);
        // Mostra a correta
        Array.from(optionsGrid.children).forEach(btn => {
            if (btn.textContent === correct.icon) btn.classList.add('correct');
        });
    }

    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            finishGame();
        }
    }, 1200);
}

function updateUI() {
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
    counterDisplay.textContent = `${currentQuestionIndex + 1} / ${questions.length}`;
}

function finishGame() {
    document.getElementById('res-correct').textContent = score.correct;
    document.getElementById('res-wrong').textContent = score.wrong;
    document.getElementById('result-score').textContent = `Você acertou ${score.correct} de ${questions.length}!`;
    
    const emoji = score.correct > 7 ? "🥳" : (score.correct > 4 ? "🙂" : "😅");
    document.getElementById('result-emoji').textContent = emoji;
    
    showScreen('result');
}

// ── Utilitários ──────────────────────────────────
function speakWord(text) {
    if ('speechSynthesis' in window) {
        const ut = new SpeechSynthesisUtterance(text);
        ut.lang = 'pt-BR';
        ut.rate = 0.9;
        window.speechSynthesis.speak(ut);
    }
}

function playFeedbackSound(isCorrect) {
    // Aqui poderíamos carregar sons de assets/sounds/
    // Por enquanto, feedback visual é o foco
}

init();
