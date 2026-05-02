// Estado do Jogo
const state = {
    config: {
        classYear: 2,
        operation: '+',
        difficulty: 'units',
        noNegatives: true,
        allowRegroup: false,
        exactDivision: true,
        progressiveDifficulty: false,
        totalRounds: 5,
        teamAName: 'Equipe A',
        teamBName: 'Equipe B',
        teamAName: 'Equipe A',
        teamBName: 'Equipe B',
        splitKeyboard: false,
        tabletMode: false
    },
    game: {
        currentRound: 0,
        scoreA: 0,
        scoreB: 0,
        currentQuestion: null,
        isRoundActive: false
    }
};

// Elementos DOM
const screens = {
    config: document.getElementById('config-screen'),
    game: document.getElementById('game-screen'),
    result: document.getElementById('result-screen')
};

// Configuração UI
const configUI = {
    classBtns: document.querySelectorAll('#class-selection .btn-select'),
    opBtns: document.querySelectorAll('#operation-selection .btn-select'),
    diffSelect: document.getElementById('difficulty-select'),
    roundsBtns: document.querySelectorAll('#rounds-selection .btn-select'),
    inputs: {
        noNegatives: document.getElementById('no-negatives'),
        allowRegroup: document.getElementById('allow-regroup'),
        exactDivision: document.getElementById('exact-division'),
        progressiveDifficulty: document.getElementById('progressive-difficulty'),
        progressiveDifficulty: document.getElementById('progressive-difficulty'),
        splitKeyboard: document.getElementById('split-keyboard'),
        tabletMode: document.getElementById('tablet-mode'),
        teamAName: document.getElementById('team-a-name'),
        teamBName: document.getElementById('team-b-name')
    },
    startBtn: document.getElementById('start-game-btn')
};

// Game UI
const gameUI = {
    currentRound: document.getElementById('current-round'),
    totalRounds: document.getElementById('total-rounds'),
    inputA: document.getElementById('input-team-a'),
    inputB: document.getElementById('input-team-b'),
    feedbackA: document.getElementById('feedback-a'),
    feedbackB: document.getElementById('feedback-b'),
    scoreA: document.getElementById('score-a'),
    scoreB: document.getElementById('score-b'),
    nameA: document.querySelector('.team-a .team-name'),
    nameB: document.querySelector('.team-b .team-name'),
    num1: document.getElementById('num1'),
    num2: document.getElementById('num2'),
    opSymbol: document.getElementById('op-symbol'),
    winnerAnnouncement: document.getElementById('winner-announcement'),
    correctAnswerDisplay: document.getElementById('correct-answer-display'),
    correctAnswerDisplay: document.getElementById('correct-answer-display'),
    correctVal: document.getElementById('correct-val'),
    keypadA: document.getElementById('keypad-a'),
    keypadB: document.getElementById('keypad-b')
};

// Result UI
const resultUI = {
    finalScoreA: document.getElementById('final-score-a'),
    finalScoreB: document.getElementById('final-score-b'),
    finalNameA: document.querySelector('.final-score-card.team-a h3'),
    finalNameB: document.querySelector('.final-score-card.team-b h3'),
    winnerMsg: document.getElementById('final-winner-msg'),
    playAgainBtn: document.getElementById('play-again-btn'),
    configBtn: document.getElementById('config-btn')
};

// Inicialização
function init() {
    setupConfigListeners();
    setupGameListeners();
    setupResultListeners();

    // Seleção padrão
    selectButton(configUI.classBtns, '2');
    selectButton(configUI.opBtns, '+');
    selectButton(configUI.roundsBtns, '5');
}

// Lógica de Configuração
function setupConfigListeners() {
    // Seleção de Turma
    configUI.classBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectButton(configUI.classBtns, btn.dataset.value);
            state.config.classYear = parseInt(btn.dataset.value);
        });
    });

    // Seleção de Operação
    configUI.opBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectButton(configUI.opBtns, btn.dataset.value);
            state.config.operation = btn.dataset.value;
        });
    });

    // Seleção de Rodadas
    configUI.roundsBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectButton(configUI.roundsBtns, btn.dataset.value);
            state.config.totalRounds = parseInt(btn.dataset.value);
        });
    });

    // Botão Iniciar
    configUI.startBtn.addEventListener('click', startGame);
}

function selectButton(nodeList, value) {
    nodeList.forEach(btn => {
        if (btn.dataset.value === value) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

function readConfigInputs() {
    state.config.difficulty = configUI.diffSelect.value;
    state.config.noNegatives = configUI.inputs.noNegatives.checked;
    state.config.allowRegroup = configUI.inputs.allowRegroup.checked;
    state.config.exactDivision = configUI.inputs.exactDivision.checked;
    state.config.progressiveDifficulty = configUI.inputs.progressiveDifficulty.checked;
    state.config.progressiveDifficulty = configUI.inputs.progressiveDifficulty.checked;
    state.config.splitKeyboard = configUI.inputs.splitKeyboard.checked;
    state.config.tabletMode = configUI.inputs.tabletMode.checked;
    state.config.teamAName = configUI.inputs.teamAName.value.trim() || 'Equipe A';
    state.config.teamBName = configUI.inputs.teamBName.value.trim() || 'Equipe B';
}

// Lógica do Jogo
function startGame() {
    readConfigInputs();

    // Atualizar nomes na UI
    gameUI.nameA.textContent = state.config.teamAName;
    gameUI.nameB.textContent = state.config.teamBName;
    gameUI.inputA.placeholder = "?";
    gameUI.inputB.placeholder = "?";

    state.game.currentRound = 0;
    state.game.scoreA = 0;
    state.game.scoreB = 0;

    updateScoreBoard();

    switchScreen('game');
    nextRound();
}

function switchScreen(screenName) {
    Object.values(screens).forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    screens[screenName].classList.remove('hidden');
    setTimeout(() => screens[screenName].classList.add('active'), 10);
}

function nextRound() {
    state.game.currentRound++;

    if (state.game.currentRound > state.config.totalRounds) {
        endGame();
        return;
    }

    // Reset UI da rodada
    gameUI.currentRound.textContent = state.game.currentRound;
    gameUI.totalRounds.textContent = state.config.totalRounds;

    gameUI.inputA.value = '';
    gameUI.inputB.value = '';
    gameUI.inputA.disabled = false;
    gameUI.inputB.disabled = false;

    // Se modo teclado dividido estiver ativo, inputs são readonly para evitar foco manual atrapalhando
    if (state.config.splitKeyboard) {
        gameUI.inputA.setAttribute('readonly', true);
        gameUI.inputB.setAttribute('readonly', true);
        gameUI.inputA.placeholder = "Use Números";
        gameUI.inputB.placeholder = "Use Numpad";
    } else if (state.config.tabletMode) {
        gameUI.inputA.setAttribute('readonly', true);
        gameUI.inputB.setAttribute('readonly', true);
        gameUI.inputA.placeholder = "Use Teclado";
        gameUI.inputB.placeholder = "Use Teclado";
        gameUI.keypadA.classList.remove('hidden');
        gameUI.keypadB.classList.remove('hidden');
    } else {
        gameUI.inputA.removeAttribute('readonly');
        gameUI.inputB.removeAttribute('readonly');
        gameUI.inputA.placeholder = "?";
        gameUI.inputB.placeholder = "?";
        gameUI.keypadA.classList.add('hidden');
        gameUI.keypadB.classList.add('hidden');
    }

    gameUI.inputA.classList.remove('correct', 'wrong');
    gameUI.inputB.classList.remove('correct', 'wrong');
    gameUI.feedbackA.textContent = '';
    gameUI.feedbackB.textContent = '';

    gameUI.winnerAnnouncement.classList.add('hidden');
    gameUI.correctAnswerDisplay.classList.add('hidden');

    generateQuestion();
    state.game.isRoundActive = true;

    // Foco automático no input A (opcional, melhor deixar sem foco forçado para não atrapalhar touch)
}

function generateQuestion() {
    let min, max;

    // Definir range baseado na dificuldade
    switch (state.config.difficulty) {
        case 'units': min = 1; max = 9; break;
        case 'tens': min = 10; max = 99; break;
        case 'hundreds': min = 100; max = 999; break;
        case 'thousands': min = 1000; max = 9999; break;
        case 'ten_thousands': min = 10000; max = 99999; break;
        default: min = 1; max = 9;
    }

    let num1 = getRandomInt(min, max);
    let num2 = getRandomInt(min, max);
    let op = state.config.operation;

    // Ajustes de Regras
    if (op === '-') {
        if (state.config.noNegatives && num1 < num2) {
            [num1, num2] = [num2, num1]; // Swap
        }
    } else if (op === '/') {
        // Garantir divisão exata se necessário
        if (state.config.exactDivision) {
            // Gerar num2 primeiro, depois multiplicar para achar num1
            // Para evitar números gigantes, reduzimos o range do divisor
            let divisorMax = Math.min(max, 20); // Divisor menor para ser mentalmente viável
            if (state.config.difficulty === 'units') divisorMax = 9;

            num2 = getRandomInt(2, divisorMax);
            let multiplier = getRandomInt(1, 10); // Resultado simples
            if (state.config.difficulty !== 'units') {
                multiplier = getRandomInt(min, max); // Resultado dentro do range de dificuldade
            }

            // Recalcular num1
            num1 = num2 * multiplier;
        }
    }

    // Renderizar
    gameUI.num1.textContent = formatNumber(num1);
    gameUI.num2.textContent = formatNumber(num2);

    let symbol = op;
    if (op === '*') symbol = '×';
    if (op === '/') symbol = '÷';
    gameUI.opSymbol.textContent = symbol;

    // Calcular resposta correta
    let answer;
    switch (op) {
        case '+': answer = num1 + num2; break;
        case '-': answer = num1 - num2; break;
        case '*': answer = num1 * num2; break;
        case '/': answer = num1 / num2; break;
    }

    state.game.currentQuestion = { num1, num2, op, answer };
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatNumber(num) {
    return num.toLocaleString('pt-BR');
}

function setupGameListeners() {
    // Listener Global para Modo Dividido
    document.addEventListener('keydown', handleGlobalKeydown);

    // Listeners padrão (caso não use modo dividido ou para Enter no foco)
    gameUI.inputA.addEventListener('keydown', (e) => {
        if (!state.config.splitKeyboard && e.key === 'Enter') checkAnswer('A', gameUI.inputA.value);
    });

    // Listeners para Input B
    gameUI.inputB.addEventListener('keydown', (e) => {
        if (!state.config.splitKeyboard && e.key === 'Enter') checkAnswer('B', gameUI.inputB.value);
    });

    // Listeners para Teclado Virtual
    setupKeypadListeners(gameUI.keypadA, 'A');
    setupKeypadListeners(gameUI.keypadB, 'B');
}

function setupKeypadListeners(keypad, team) {
    const input = team === 'A' ? gameUI.inputA : gameUI.inputB;

    keypad.querySelectorAll('.key-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!state.game.isRoundActive) return;

            // Prevenir comportamento padrão de foco
            e.preventDefault();

            const key = btn.dataset.key;

            if (key === 'backspace') {
                input.value = input.value.slice(0, -1);
            } else if (key === 'enter') {
                checkAnswer(team, input.value);
            } else {
                input.value += key;
            }
        });
    });
}

function handleGlobalKeydown(e) {
    if (!state.game.isRoundActive || !state.config.splitKeyboard) return;

    // Time A: Digit0-9, Backspace, Enter
    if (e.code.startsWith('Digit')) {
        gameUI.inputA.value += e.key;
    } else if (e.code === 'Backspace') {
        gameUI.inputA.value = gameUI.inputA.value.slice(0, -1);
    } else if (e.code === 'Enter') {
        checkAnswer('A', gameUI.inputA.value);
    }

    // Time B: Numpad0-9, Delete, NumpadEnter
    if (e.code.startsWith('Numpad') && e.key >= '0' && e.key <= '9') {
        gameUI.inputB.value += e.key;
    } else if (e.code === 'Delete' || e.code === 'NumpadDecimal') {
        gameUI.inputB.value = gameUI.inputB.value.slice(0, -1);
    } else if (e.code === 'NumpadEnter') {
        checkAnswer('B', gameUI.inputB.value);
    }
}

function checkAnswer(team, value) {
    if (!state.game.isRoundActive) return;

    const numVal = parseFloat(value);

    if (isNaN(numVal)) return;

    if (numVal === state.game.currentQuestion.answer) {
        // Acerto!
        handleCorrectAnswer(team);
    } else {
        // Erro
        handleWrongAnswer(team);
    }
}

function handleCorrectAnswer(team) {
    state.game.isRoundActive = false;

    // Atualizar Pontos
    if (team === 'A') state.game.scoreA++;
    else state.game.scoreB++;

    updateScoreBoard();

    // UI Feedback
    const input = team === 'A' ? gameUI.inputA : gameUI.inputB;
    input.classList.add('correct');

    const winnerName = team === 'A' ? state.config.teamAName : state.config.teamBName;
    gameUI.winnerAnnouncement.textContent = `${winnerName} respondeu primeiro!`;
    gameUI.winnerAnnouncement.classList.remove('hidden');

    gameUI.correctVal.textContent = state.game.currentQuestion.answer;
    gameUI.correctAnswerDisplay.classList.remove('hidden');

    // Travar inputs
    gameUI.inputA.disabled = true;
    gameUI.inputB.disabled = true;

    // Próxima rodada
    setTimeout(nextRound, 3000);
}

function handleWrongAnswer(team) {
    const input = team === 'A' ? gameUI.inputA : gameUI.inputB;
    const feedback = team === 'A' ? gameUI.feedbackA : gameUI.feedbackB;

    input.classList.add('wrong');
    feedback.textContent = 'Tente novamente!';
    feedback.style.color = 'var(--color-red)';

    setTimeout(() => {
        input.classList.remove('wrong');
        input.value = '';
        feedback.textContent = '';
    }, 1000);
}

function updateScoreBoard() {
    gameUI.scoreA.textContent = `${state.config.teamAName}: ${state.game.scoreA}`;
    gameUI.scoreB.textContent = `${state.config.teamBName}: ${state.game.scoreB}`;
}

// Fim de Jogo
function endGame() {
    switchScreen('result');

    resultUI.finalNameA.textContent = state.config.teamAName;
    resultUI.finalNameB.textContent = state.config.teamBName;
    resultUI.finalScoreA.textContent = state.game.scoreA;
    resultUI.finalScoreB.textContent = state.game.scoreB;

    if (state.game.scoreA > state.game.scoreB) {
        resultUI.winnerMsg.textContent = `${state.config.teamAName} Venceu!`;
        resultUI.winnerMsg.style.color = "var(--color-blue)";
    } else if (state.game.scoreB > state.game.scoreA) {
        resultUI.winnerMsg.textContent = `${state.config.teamBName} Venceu!`;
        resultUI.winnerMsg.style.color = "var(--color-yellow-dark)";
    } else {
        resultUI.winnerMsg.textContent = "Empate!";
        resultUI.winnerMsg.style.color = "var(--color-text-dark)";
    }
}

function setupResultListeners() {
    resultUI.playAgainBtn.addEventListener('click', startGame);
    resultUI.configBtn.addEventListener('click', () => {
        switchScreen('config');
    });
}

// Iniciar
init();
