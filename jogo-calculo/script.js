// ══════════════════════════════════════════
//  CABO DE GUERRA: CÁLCULO MENTAL — script.js
// ══════════════════════════════════════════

// ── Estado ──────────────────────────────────
const cfg = {
  classYear: 2, operation: '+', difficulty: 'units',
  noNegatives: true, exactDivision: true,
  totalRounds: 5, timePerRound: 0,   // 0 = sem limite
  teamA: 'Equipe A', teamB: 'Equipe B'
};

const game = {
  scoreA: 0, scoreB: 0,
  ropePos: 0,          // -3 (A vencendo) a +3 (B vencendo)
  roundsDone: 0,
  qA: null, qB: null,  // questões independentes
  inputA: '', inputB: '',
  timerInterval: null, timeLeft: 0,
  active: false
};

// Cada passo da corda em px no SVG (viewBox 520, flag começa em x=252)
const ROPE_STEP_PX = 30;   // cada acerto desloca 30px no SVG
const ROPE_MAX    = 3;      // ±3 = knockout

// ── Elementos DOM ────────────────────────────
const screens = {
  config: document.getElementById('screen-config'),
  game:   document.getElementById('screen-game'),
  result: document.getElementById('screen-result')
};

// Config
const selClass  = document.getElementById('sel-class');
const selOp     = document.getElementById('sel-op');
const selDiff   = document.getElementById('sel-diff');
const selRounds = document.getElementById('sel-rounds');
const selTime   = document.getElementById('sel-time');
const chkNoneg  = document.getElementById('chk-noneg');
const chkExact  = document.getElementById('chk-exact');
const inpA      = document.getElementById('team-a-name');
const inpB      = document.getElementById('team-b-name');
const btnStart  = document.getElementById('btn-start');

// Game
const phNameA    = document.getElementById('ph-name-a');
const phNameB    = document.getElementById('ph-name-b');
const phScoreA   = document.getElementById('ph-score-a');
const phScoreB   = document.getElementById('ph-score-b');
const qA         = document.getElementById('q-a');
const qB         = document.getElementById('q-b');
const ansA       = document.getElementById('ans-a');
const ansB       = document.getElementById('ans-b');
const fbA        = document.getElementById('fb-a');
const fbB        = document.getElementById('fb-b');
const arenaScoreA= document.getElementById('arena-score-a');
const arenaScoreB= document.getElementById('arena-score-b');
const arenaTimer = document.getElementById('arena-timer');
const arenaRound = document.getElementById('arena-round');
const ropeFlag   = document.getElementById('rope-flag');
const barMarker  = document.getElementById('bar-marker');
const tugSvg     = document.getElementById('tug-svg');

// Result
const rsNameA  = document.getElementById('rs-name-a');
const rsNameB  = document.getElementById('rs-name-b');
const rsScoreA = document.getElementById('rs-score-a');
const rsScoreB = document.getElementById('rs-score-b');
const resTit   = document.getElementById('result-title');
const resSub   = document.getElementById('result-subtitle');
const resEmoji = document.getElementById('result-emoji');
const btnAgain = document.getElementById('btn-again');
const btnCfg   = document.getElementById('btn-config');

// ── Helpers ──────────────────────────────────
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function fmtNum(n) {
  return n.toLocaleString('pt-BR');
}
function showScreen(name, updateHistory = true) {
  Object.entries(screens).forEach(([k, el]) => {
    el.classList.toggle('active', k === name);
  });
  if (updateHistory) {
    history.pushState({ screen: name }, "");
  }
}
function selectBtn(group, value) {
  group.querySelectorAll('.sel-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.v === String(value));
  });
}

// ── Config listeners ─────────────────────────
function initConfig() {
  // Defaults
  selectBtn(selClass,  '2');
  selectBtn(selOp,     '+');
  selectBtn(selRounds, '5');
  selectBtn(selTime,   '0');

  selClass.querySelectorAll('.sel-btn').forEach(b =>
    b.addEventListener('click', () => { cfg.classYear = +b.dataset.v; selectBtn(selClass, b.dataset.v); }));

  selOp.querySelectorAll('.sel-btn').forEach(b =>
    b.addEventListener('click', () => { cfg.operation = b.dataset.v; selectBtn(selOp, b.dataset.v); }));

  selRounds.querySelectorAll('.sel-btn').forEach(b =>
    b.addEventListener('click', () => { cfg.totalRounds = +b.dataset.v; selectBtn(selRounds, b.dataset.v); }));

  selTime.querySelectorAll('.sel-btn').forEach(b =>
    b.addEventListener('click', () => { cfg.timePerRound = +b.dataset.v; selectBtn(selTime, b.dataset.v); }));

  btnStart.addEventListener('click', startGame);
}

// ── Question Generator ───────────────────────
function genQuestion() {
  let min, max;
  switch (cfg.difficulty) {
    case 'units':    min = 1;    max = 9;    break;
    case 'tens':     min = 10;   max = 99;   break;
    case 'hundreds': min = 100;  max = 999;  break;
    case 'thousands':min = 1000; max = 9999; break;
    default:         min = 1;    max = 9;
  }

  let a = randInt(min, max);
  let b = randInt(min, max);
  const op = cfg.operation;

  if (op === '-' && cfg.noNegatives && a < b) [a, b] = [b, a];

  if (op === '/') {
    const divMax = Math.min(max, 20);
    b = randInt(2, divMax);
    const mult = (cfg.difficulty === 'units')
      ? randInt(1, 9)
      : randInt(1, Math.floor(max / b));
    a = b * mult;
  }

  let answer;
  switch (op) {
    case '+': answer = a + b; break;
    case '-': answer = a - b; break;
    case '*': answer = a * b; break;
    case '/': answer = a / b; break;
  }

  let sym = op === '*' ? '×' : op === '/' ? '÷' : op;
  return { a, b, op, sym, answer };
}

function renderQuestion(q) {
  return `${fmtNum(q.a)} ${q.sym} ${fmtNum(q.b)} = ?`;
}

// ── Rope/Flag animation ──────────────────────
function updateRope() {
  // ropePos: -3 (A) a +3 (B). Cada passo = ROPE_STEP_PX
  const dx = game.ropePos * ROPE_STEP_PX;
  ropeFlag.style.transform = `translateX(${dx}px)`;

  // Bottom bar marker: 50% + (pos/3)*33%
  const pct = 50 + (game.ropePos / ROPE_MAX) * 33;
  barMarker.style.left = `calc(${pct}% - 7px)`;

  // Bar marker color
  barMarker.style.background = game.ropePos < 0 ? '#1565C0'
                              : game.ropePos > 0 ? '#C62828' : '#555';
}

// ── Pull animation ───────────────────────────
function animatePull(team) {
  tugSvg.classList.remove('pull-a', 'pull-b');
  void tugSvg.offsetWidth; // reflow
  tugSvg.classList.add(team === 'A' ? 'pull-a' : 'pull-b');
  setTimeout(() => tugSvg.classList.remove('pull-a', 'pull-b'), 600);
}

// ── Timer ────────────────────────────────────
function startTimer() {
  clearInterval(game.timerInterval);
  if (cfg.timePerRound === 0) {
    arenaTimer.textContent = '–';
    arenaTimer.classList.remove('urgent');
    return;
  }
  game.timeLeft = cfg.timePerRound;
  updateTimerUI();

  game.timerInterval = setInterval(() => {
    game.timeLeft--;
    updateTimerUI();

    if (game.timeLeft <= 3) arenaTimer.classList.add('urgent');
    else arenaTimer.classList.remove('urgent');

    if (game.timeLeft <= 0) {
      clearInterval(game.timerInterval);
      onTimeUp();
    }
  }, 1000);
}

function updateTimerUI() {
  const s = game.timeLeft;
  arenaTimer.textContent = `⏱ ${String(s).padStart(2,'0')}s`;
}

function onTimeUp() {
  if (!game.active) return;
  // Sem movimento de corda — gera novas questões para ambos
  flashTimeout('A');
  flashTimeout('B');
  game.qA = genQuestion();
  game.qB = genQuestion();
  qA.textContent = renderQuestion(game.qA);
  qB.textContent = renderQuestion(game.qB);
  game.inputA = '';
  game.inputB = '';
  ansA.textContent = '0';
  ansB.textContent = '0';
  ansA.className = 'answer-display';
  ansB.className = 'answer-display';
  game.roundsDone++;
  updateRoundUI();
  if (game.roundsDone >= cfg.totalRounds) {
    setTimeout(endGame, 800);
    return;
  }
  startTimer();
}

function flashTimeout(team) {
  const el = team === 'A' ? ansA : ansB;
  const fb = team === 'A' ? fbA  : fbB;
  el.classList.add('wrong');
  fb.textContent = '⏱ Tempo!';
  setTimeout(() => {
    el.classList.remove('wrong');
    fb.textContent = '';
  }, 900);
}

// ── Answer handling ──────────────────────────
function handleKey(team, key) {
  if (!game.active) return;
  let val = team === 'A' ? game.inputA : game.inputB;

  if (key === 'del') {
    val = val.slice(0, -1);
  } else if (key === 'ok') {
    submitAnswer(team, val);
    return;
  } else {
    if (val.length >= 8) return;
    val += key;
  }

  if (team === 'A') { game.inputA = val; ansA.textContent = val || '0'; }
  else              { game.inputB = val; ansB.textContent = val || '0'; }
}

function submitAnswer(team, val) {
  if (!game.active) return;
  if (val === '') return;

  const q    = team === 'A' ? game.qA : game.qB;
  const ansEl= team === 'A' ? ansA : ansB;
  const fbEl = team === 'A' ? fbA  : fbB;
  const num  = parseFloat(val.replace(',', '.'));

  if (Math.abs(num - q.answer) < 0.001) {
    // ✅ Correto!
    ansEl.classList.add('correct');
    fbEl.textContent = '✅ Certo!';
    playBeep(true);
    animatePull(team);

    if (team === 'A') { game.scoreA++; game.ropePos--; }
    else              { game.scoreB++; game.ropePos++; }

    updateScoreUI();
    updateRope();

    // Verificar knockout
    if (Math.abs(game.ropePos) >= ROPE_MAX) {
      game.active = false;
      clearInterval(game.timerInterval);
      setTimeout(endGame, 800);
      return;
    }

    // Incrementar rodada apenas quando ambas as equipes responderam?
    // Aqui: cada acerto conta como 1 "turno" da equipe
    game.roundsDone++;
    updateRoundUI();

    if (game.roundsDone >= cfg.totalRounds * 2) {
      game.active = false;
      clearInterval(game.timerInterval);
      setTimeout(endGame, 800);
      return;
    }

    // Gerar nova questão para essa equipe
    setTimeout(() => {
      if (!game.active) return;
      ansEl.classList.remove('correct');
      fbEl.textContent = '';

      if (team === 'A') {
        game.qA = genQuestion();
        qA.textContent = renderQuestion(game.qA);
        game.inputA = '';
        ansA.textContent = '0';
      } else {
        game.qB = genQuestion();
        qB.textContent = renderQuestion(game.qB);
        game.inputB = '';
        ansB.textContent = '0';
      }
    }, 900);

  } else {
    // ❌ Errado!
    ansEl.classList.add('wrong');
    fbEl.textContent = '❌ Tente de novo!';
    playBeep(false);

    setTimeout(() => {
      ansEl.classList.remove('wrong');
      fbEl.textContent = '';
      if (team === 'A') { game.inputA = ''; ansA.textContent = '0'; }
      else              { game.inputB = ''; ansB.textContent = '0'; }
    }, 700);
  }
}

// ── UI updates ───────────────────────────────
function updateScoreUI() {
  phScoreA.textContent = game.scoreA;
  phScoreB.textContent = game.scoreB;
  arenaScoreA.textContent = game.scoreA;
  arenaScoreB.textContent = game.scoreB;
}

function updateRoundUI() {
  const total = cfg.totalRounds * 2;
  const done  = Math.min(game.roundsDone, total);
  arenaRound.textContent = `Turno ${done}/${total}`;
}

// ── Sound (Web Audio API — sem arquivos) ─────
let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playBeep(correct) {
  try {
    const ctx  = getCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = correct ? 880 : 220;
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (correct ? 0.35 : 0.25));
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) { /* ignore */ }
}

// ── Confetti ─────────────────────────────────
function launchConfetti(color) {
  const wrap = document.getElementById('confetti-wrap');
  wrap.innerHTML = '';
  const colors = color === 'blue'
    ? ['#1565C0','#42A5F5','#BBDEFB','#0D47A1','#90CAF9']
    : ['#C62828','#EF5350','#FFCDD2','#B71C1C','#EF9A9A'];

  for (let i = 0; i < 80; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left     = Math.random() * 100 + 'vw';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.width    = (8 + Math.random() * 10) + 'px';
    p.style.height   = (10 + Math.random() * 14) + 'px';
    p.style.animationDuration  = (2 + Math.random() * 2.5) + 's';
    p.style.animationDelay     = (Math.random() * 1.2) + 's';
    p.style.transform = `rotateZ(${Math.random() * 360}deg)`;
    wrap.appendChild(p);
  }
}

// ── Game flow ────────────────────────────────
function startGame() {
  // Read config
  cfg.teamA         = inpA.value.trim() || 'Equipe A';
  cfg.teamB         = inpB.value.trim() || 'Equipe B';
  cfg.difficulty    = selDiff.value;
  cfg.noNegatives   = chkNoneg.checked;
  cfg.exactDivision = chkExact.checked;

  // Reset game state
  game.scoreA = 0;
  game.scoreB = 0;
  game.ropePos= 0;
  game.roundsDone = 0;
  game.inputA = '';
  game.inputB = '';
  game.active = true;

  // Update team names
  phNameA.textContent = cfg.teamA;
  phNameB.textContent = cfg.teamB;
  updateScoreUI();
  updateRoundUI();

  // Generate independent questions
  game.qA = genQuestion();
  game.qB = genQuestion();
  qA.textContent = renderQuestion(game.qA);
  qB.textContent = renderQuestion(game.qB);
  ansA.textContent = '0';
  ansB.textContent = '0';
  ansA.className = 'answer-display';
  ansB.className = 'answer-display';
  fbA.textContent = '';
  fbB.textContent = '';

  // Reset rope
  updateRope();

  showScreen('game');
  startTimer();
}

function endGame() {
  clearInterval(game.timerInterval);
  game.active = false;

  // Fill result screen
  rsNameA.textContent  = cfg.teamA;
  rsNameB.textContent  = cfg.teamB;
  rsScoreA.textContent = game.scoreA;
  rsScoreB.textContent = game.scoreB;

  const knockout = Math.abs(game.ropePos) >= ROPE_MAX;
  let confColor = null;

  if (game.scoreA > game.scoreB || game.ropePos <= -ROPE_MAX) {
    resTit.textContent  = `${cfg.teamA} Venceu! 🎉`;
    resSub.textContent  = knockout ? 'Vitória por Knockout! 💪' : 'Mais acertos no total!';
    resEmoji.textContent= '🏆';
    confColor = 'blue';
    document.getElementById('rs-score-a').style.color = '#1565C0';
  } else if (game.scoreB > game.scoreA || game.ropePos >= ROPE_MAX) {
    resTit.textContent  = `${cfg.teamB} Venceu! 🎉`;
    resSub.textContent  = knockout ? 'Vitória por Knockout! 💪' : 'Mais acertos no total!';
    resEmoji.textContent= '🏆';
    confColor = 'red';
    document.getElementById('rs-score-b').style.color = '#C62828';
  } else {
    resTit.textContent  = 'Empate!';
    resSub.textContent  = 'Força igual dos dois lados! 🤝';
    resEmoji.textContent= '🤝';
  }

  showScreen('result');
  if (confColor) launchConfetti(confColor);
}

// ── Keypad setup — Multi-touch real ──────────
// touchstart + preventDefault impede o evento click subsequente,
// permitindo que DOIS dedos em DOIS painéis disparem ao mesmo tempo.
function setupKeypad(kpId, team) {
  document.getElementById(kpId).querySelectorAll('.key').forEach(btn => {

    // Toque (tablet/celular) — processa imediatamente e bloqueia click duplicado
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();          // ← impede o click fantasma pós-touch
      e.stopPropagation();
      handleKey(team, btn.dataset.k);
      btn.classList.add('key-touching');
    }, { passive: false });

    btn.addEventListener('touchend', () => {
      btn.classList.remove('key-touching');
    }, { passive: true });

    // Mouse / fallback para não-touch
    btn.addEventListener('click', () => {
      handleKey(team, btn.dataset.k);
    });
  });
}

// Physical keyboard (split mode: A=row0-9, B=numpad)
document.addEventListener('keydown', e => {
  if (!game.active) return;
  const code = e.code;

  // Team A: digit row + Enter + Backspace
  if (code.startsWith('Digit')) {
    e.preventDefault();
    handleKey('A', e.key);
  } else if (code === 'Enter') {
    e.preventDefault();
    handleKey('A', 'ok');
  } else if (code === 'Backspace') {
    e.preventDefault();
    handleKey('A', 'del');
  }

  // Team B: numpad
  if (code.startsWith('Numpad') && e.key >= '0' && e.key <= '9') {
    e.preventDefault();
    handleKey('B', e.key);
  } else if (code === 'NumpadEnter') {
    e.preventDefault();
    handleKey('B', 'ok');
  } else if (code === 'Delete' || code === 'NumpadDecimal') {
    e.preventDefault();
    handleKey('B', 'del');
  }
});

// ── Result buttons ────────────────────────────
btnAgain.addEventListener('click', startGame);
btnCfg.addEventListener('click', () => showScreen('config'));

// ── Init ──────────────────────────────────────
initConfig();
setupKeypad('kp-a', 'A');
setupKeypad('kp-b', 'B');

// Estado inicial para navegação
history.replaceState({ screen: 'config' }, "");

window.addEventListener('popstate', (e) => {
  if (e.state && e.state.screen) {
    showScreen(e.state.screen, false);
    // Para o timer se voltar para config
    if (e.state.screen === 'config') {
        clearInterval(game.timerInterval);
        game.active = false;
    }
  } else {
    // Se não houver estado, volta para config por padrão
    showScreen('config', false);
    clearInterval(game.timerInterval);
    game.active = false;
  }
});
