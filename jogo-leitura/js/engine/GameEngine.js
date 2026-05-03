// ============================================================
// ENGINE MODULE — GameEngine.js
// Loop principal do jogo, state machine, orquestração dos módulos.
//
// Estados: LOADING → START → PLAYING → PAUSED → GAMEOVER
// ============================================================

import { Block, BLOCK_HEIGHT } from "./Block.js";
import { GRADE_CONFIG, resetWordPools } from "../data/words.js";
import { Stack } from "./Stack.js";
import { AudioSystem } from "../audio/AudioSystem.js";
import { SpeechRecognizer } from "../recognition/SpeechRecognizer.js";
import { evaluate } from "../evaluation/Evaluator.js";
import { ScoreSystem } from "../scoring/ScoreSystem.js";
import { UIManager } from "../ui/UIManager.js";
import { playCorrect, playWrong, playLand, playGameOver } from "../audio/AudioSoundFX.js";

const MAX_BLOCKS_AIR = 3;   // máx de blocos simultâneos no ar

export class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.state = "LOADING";

        // Módulos
        this.ui = new UIManager();
        this.audio = new AudioSystem();
        this.recognizer = new SpeechRecognizer({
            onResult: (text, isFinal) => this._onSpeechResult(text, isFinal),
            onPartial: (text) => this.ui.setPartialText(text),
            onProgress: (pct, msg) => this.ui.updateLoadingProgress(pct, msg),
            onReady: () => this._onRecognizerReady(),
            onError: (msg) => console.error("[Recognizer]", msg),
        });
        this.score = new ScoreSystem();
        this.stack = null;

        // Turma selecionada (padrão: 1º Ano)
        this.selectedGrade = "ano1";

        // Estado do jogo
        this.blocks = [];
        this._spawnTimer = 0;
        this._lastTime = null;
        this._rafId = null;
        this._micStarted = false;
        this._lastRecognized = "";

        // Dificuldade progressiva (reseta ao iniciar)
        this._currentSpeed = 55;
        this._spawnInterval = 4.5;
        this._totalHits = 0;
        this._nextSpeedUpAt = 10;

        this.particles = [];
        this._ignoreSpeechUntil = 0; // Período para ignorar voz (evita eco do beep)
        this._bindEvents();
    }

    /**
     * Define a turma e atualiza o estado do botão selecionado.
     * Chamado pelos botões de turma na tela inicial.
     */
    setGrade(grade) {
        this.selectedGrade = grade;
        const cfg = GRADE_CONFIG[grade];
        // Atualiza todos os botões de turma na UI
        document.querySelectorAll(".grade-btn").forEach(btn => {
            const active = btn.dataset.grade === grade;
            btn.classList.toggle("selected", active);
        });
        // Atualiza label debaixo dos botões
        const desc = document.getElementById("grade-desc");
        if (desc) desc.textContent = `${cfg.label} — ${cfg.description}`;
    }

    // ─────────────────────────────────────────
    // INICIALIZAÇÃO
    // ─────────────────────────────────────────

    async init() {
        this._resize();
        window.addEventListener("resize", () => this._resize());
        
        // Suporte ao botão 'Voltar' do navegador/celular
        window.addEventListener("popstate", (e) => {
            if (this.state === "PLAYING" || this.state === "GAMEOVER") {
                this.returnToMenu(false); // false para não fazer pushState redundante
            }
        });

        // Estado inicial para o botão voltar funcionar
        history.replaceState({ screen: "START" }, "");

        await this.recognizer.init();
        this.ui.showStart();
        this.state = "START";
        this._bindEvents();
    }

    _onRecognizerReady() {
        this.ui.showLoadingOverlay(false);
        this.ui.setMicState("off");
        console.log("[GameEngine] Recognizer pronto.");
    }

    // ─────────────────────────────────────────
    // EVENTOS DE UI
    // ─────────────────────────────────────────

    _bindEvents() {
        // Botão de início
        document.getElementById("btn-start")?.addEventListener("click", () => {
            if (this.state === "START" || this.state === "GAMEOVER") this.startGame();
        });
        // Botão de jogar novamente
        document.getElementById("btn-restart")?.addEventListener("click", () => {
            if (this.state === "GAMEOVER") this.startGame();
        });
        // Botão de voltar ao menu
        document.getElementById("btn-menu")?.addEventListener("click", () => {
            if (this.state === "GAMEOVER") {
                this.returnToMenu(true);
            }
        });
        // Botões de seleção de turma
        document.querySelectorAll(".grade-btn").forEach(btn => {
            btn.addEventListener("click", () => this.setGrade(btn.dataset.grade));
        });
        // Botão de microfone
        document.getElementById("mic-btn")?.addEventListener("click", () => {
            this._toggleMic();
        });
    }

    async _toggleMic() {
        if (this.state !== "PLAYING") return;
        if (this._micStarted) {
            this.recognizer.stop();
            this.ui.setMicState("off");
            this.ui.setPartialText("");
            this._micStarted = false;
        } else {
            await this._startMic();
        }
    }

    async _startMic() {
        if (!this.recognizer.isReady) return;
        try {
            this.ui.setMicState("loading");
            this.recognizer.start();  // Web Speech API gerencia seu próprio microfone
            this.ui.setMicState("on");
            this._micStarted = true;
        } catch (err) {
            console.error("[GameEngine] Erro ao iniciar microfone:", err);
            this.ui.setMicState("error");
        }
    }

    // ─────────────────────────────────────────
    // ESTADO DO JOGO
    // ─────────────────────────────────────────

    startGame() {
        const cfg = GRADE_CONFIG[this.selectedGrade];
        this.state = "PLAYING";
        this.blocks = [];
        this.particles = [];
        this._spawnTimer = 0;
        this._lastTime = null;
        this._lastRecognized = "";
        this.recognizer.reset();
        this.score.reset();

        // Reseta pools de palavras para garantir variedade total
        resetWordPools();

        // Inicializa velocidade e intervalo a partir da turma
        this._currentSpeed = cfg.baseSpeed;
        this._spawnInterval = cfg.spawnSec;
        this._totalHits = 0;
        this._nextSpeedUpAt = 5;

        // Mostra a tela ANTES de criar a pilha (canvas.height precisa ser > 0)
        this.ui.showGame();
        this._resize();

        this.stack = new Stack(this.canvas.height);
        this.ui.updateScore(0, 0, this.score.highscore);
        this.ui.setPartialText("");
        this.ui.setGradeLabel(cfg.label);

        this._micStarted = false;
        this._startMic();

        // Adiciona entrada no histórico para o botão voltar funcionar
        history.pushState({ screen: "PLAYING" }, "");

        if (this._rafId) cancelAnimationFrame(this._rafId);
        this._rafId = requestAnimationFrame((t) => this._loop(t));
    }

    _gameOver() {
        this.state = "GAMEOVER";
        if (this._rafId) cancelAnimationFrame(this._rafId);
        this.recognizer.stop();
        this.ui.setMicState("off");
        this._micStarted = false;
        this._playSound("gameover");

        const stats = this.score.finalize();
        this.ui.showGameOver(stats);

        this.canvas.classList.add("shake");
        setTimeout(() => this.canvas.classList.remove("shake"), 600);
    }


    /**
     * Retorna ao menu inicial do jogo.
     * @param {boolean} updateHistory - se deve atualizar o histórico (pushState)
     */
    returnToMenu(updateHistory = true) {
        this.state = "START";
        if (this._rafId) cancelAnimationFrame(this._rafId);
        this.recognizer.stop();
        this.ui.setMicState("off");
        this._micStarted = false;
        this.ui.showStart();

        if (updateHistory) {
            // Se estamos voltando via botão na UI, queremos que o histórico reflita isso
            history.pushState({ screen: "START" }, "");
        }
    }


    // ─────────────────────────────────────────
    // RECONHECIMENTO DE VOZ
    // ─────────────────────────────────────────

    _onSpeechResult(text, isFinal) {
        if (this.state !== "PLAYING") return;
        
        // Se acabamos de acertar uma palavra, ignoramos a entrada por um breve momento
        // para evitar que o microfone capture o som do próprio 'beep' de acerto.
        if (Date.now() < this._ignoreSpeechUntil) return;

        if (!text) return;
        
        // Se é um resultado parcial e já processamos esse mesmo texto, ignora.
        // Se for isFinal, processamos mesmo que seja igual ao anterior para dar feedback de erro se necessário.
        if (text === this._lastRecognized && !isFinal) return;
        this._lastRecognized = text;

        // Tenta casar com algum bloco ativo no ar (não pousado)
        const airBlocks = this.blocks.filter(b => b.active && !b.landed && !b._destroying);
        // Testa do bloco mais baixo (mais próximo do chão) para o mais alto
        airBlocks.sort((a, b) => b.y - a.y);

        let matched = false;
        for (const block of airBlocks) {
            const { match } = evaluate(text, block.word);
            if (match) {
                this._destroyBlock(block);
                matched = true;
                break;
            }
        }

        // Feedback de ERRO: apenas se o reconhecedor finalizou a frase (silêncio) e não houve match.
        // Isso evita barulhos aleatórios darem feedback de erro o tempo todo.
        // Feedback de ERRO: apenas se o reconhecedor finalizou a frase (silêncio) e não houve match.
        if (isFinal && !matched && text.length > 2) {
            this._playSound("wrong");
            this.ui.showWrongGuess(text);
            airBlocks.forEach(b => b.triggerShake());
        }
        
        // Limpa o texto parcial da UI se for o resultado final OU se houver match
        if (isFinal || matched) this.ui.setPartialText("");
    }

    // ─────────────────────────────────────────
    // BLOCOS
    // ─────────────────────────────────────────

    _spawnBlock() {
        const airCount = this.blocks.filter(b => !b.landed && !b._destroying).length;
        if (airCount >= MAX_BLOCKS_AIR) return;
        const block = new Block(this.canvas.width, this._currentSpeed, this.selectedGrade);
        this.blocks.push(block);
    }

    _destroyBlock(block) {
        block.active = false;
        block.triggerDestroy();

        const pts = this.score.registerHit();
        this._totalHits++;
        this._updateDifficulty();

        this.ui.showHit(block.word, pts);
        this.ui.updateScore(this.score.score, this.score.combo, this.score.highscore);

        // Partículas de confete
        this._spawnParticles(block.x, block.y);

        // Som de acerto
        this._playSound("correct");

        // Define janela de ignorar voz (150ms é o suficiente para o beep de acerto)
        this._ignoreSpeechUntil = Date.now() + 150;
    }

    /**
     * Aumenta dificuldade a cada 10 acertos:
     * velocidade +15 px/s (máx 2.5x) e intervalo de spawn diminui.
     */
    _updateDifficulty() {
        if (this._totalHits < this._nextSpeedUpAt) return;
        this._nextSpeedUpAt += 5;

        const baseSpeed = GRADE_CONFIG[this.selectedGrade]?.baseSpeed || 55;
        const MAX_SPEED = baseSpeed * 2.8; // Aumentado o limitador máximo
        const SPEED_STEP = 18; // Antes era 12
        this._currentSpeed = Math.min(this._currentSpeed + SPEED_STEP, MAX_SPEED);

        // Redução de intervalo de spawn mais agressiva
        this._spawnInterval = Math.max(1.5, this._spawnInterval - 0.3);

        const speedLabel = Math.round((this._currentSpeed / baseSpeed) * 100);
        this.ui.showSpeedUp(`🚀 Velocidade ${speedLabel}%!`);
    }

    // ─────────────────────────────────────────
    // PARTÍCULAS
    // ─────────────────────────────────────────

    _spawnParticles(x, y) {
        const colors = ["#FFB3C6", "#B3D9FF", "#B3FFD9", "#FFE4B3", "#E4B3FF", "#FFFCB3"];
        for (let i = 0; i < 16; i++) {
            this.particles.push({
                x, y: y + BLOCK_HEIGHT / 2,
                vx: (Math.random() - 0.5) * 220,
                vy: -Math.random() * 200 - 60,
                r: 5 + Math.random() * 7,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1,
                decay: 0.9 + Math.random() * 0.5,
            });
        }
    }

    _updateParticles(dt) {
        this.particles = this.particles.filter(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 350 * dt; // gravidade
            p.life -= p.decay * dt;
            return p.life > 0;
        });
    }

    _drawParticles() {
        for (const p of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, p.life);
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    // ─────────────────────────────────────────
    // SOM
    // ─────────────────────────────────────────

    _playSound(name) {
        try {
            switch (name) {
                case "correct": playCorrect(); break;
                case "wrong": playWrong(); break;
                case "land": playLand(); break;
                case "gameover": playGameOver(); break;
            }
        } catch {/* ignora em contextos sem AudioContext */ }
    }

    // ─────────────────────────────────────────
    // LOOP PRINCIPAL
    // ─────────────────────────────────────────

    _loop(timestamp) {
        if (this.state !== "PLAYING") return;

        const dt = this._lastTime ? Math.min((timestamp - this._lastTime) / 1000, 0.1) : 0.016;
        this._lastTime = timestamp;

        // Spawn
        this._spawnTimer += dt;
        if (this._spawnTimer >= this._spawnInterval) {
            this._spawnTimer = 0;
            this._spawnBlock();
        }

        // Atualizar blocos
        this.blocks = this.blocks.filter(block => {
            const shouldRemove = block.update(dt);
            if (!shouldRemove && !block.landed) {
                // Verifica colisão com pilha
                const landed = this.stack.checkLanding(block);
                if (landed) {
                    this.score.registerMiss();
                    this.ui.showMiss(block.word);
                    this.ui.updateScore(this.score.score, this.score.combo, this.score.highscore);
                    this._playSound("land");
                    this._ignoreSpeechUntil = Date.now() + 100;
                }
            }
            return !shouldRemove;
        });

        // Partículas
        this._updateParticles(dt);

        // Renderizar
        this._draw();

        // Game over?
        if (this.stack.isGameOver()) {
            this._gameOver();
            return;
        }

        this._rafId = requestAnimationFrame((t) => this._loop(t));
    }

    // ─────────────────────────────────────────
    // RENDERIZAÇÃO
    // ─────────────────────────────────────────

    _draw() {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;

        // Fundo com gradiente
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, "#003399");
        grad.addColorStop(1, "#11003C");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Estrelinhas de fundo
        this._drawStars(ctx, W, H);

        // Pilha
        this.stack.draw(ctx);

        // Blocos
        for (const block of this.blocks) block.draw(ctx);

        // Partículas
        this._drawParticles();
    }

    _drawStars(ctx, W, H) {
        // Desenha estrelinhas pseudoaleatórias mas fixas (seed visual)
        const count = 40;
        ctx.save();
        for (let i = 0; i < count; i++) {
            const x = ((i * 97 + 13) % 100) / 100 * W;
            const y = ((i * 113 + 71) % 100) / 100 * (H * 0.6);
            const r = 0.5 + (i % 3) * 0.5;
            const alpha = 0.3 + (i % 5) * 0.12;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = "#FFFFFF";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    // ─────────────────────────────────────────
    // RESIZE
    // ─────────────────────────────────────────

    _resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;

        // Recria a pilha com novas dimensões se necessário
        if (this.stack) {
            const oldTopRatio = this.stack._stackTopY / this.stack.canvasHeight;
            this.stack = new Stack(this.canvas.height);
            this.stack._stackTopY = oldTopRatio * this.canvas.height;
        }
    }
}
