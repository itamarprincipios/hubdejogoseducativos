// ============================================================
// EVALUATION MODULE — Evaluator.js
// Compara palavra reconhecida com a esperada usando:
//   1. Normalização de texto (lower, trim, NFC, remove acentos)
//   2. Distância de Levenshtein
//   3. Threshold de similaridade (padrão 80%)
// ============================================================

/**
 * Normaliza um texto para comparação:
 * - minúsculas, trim
 * - remove acentos (NFD + regex)
 * - remove caracteres não alfabéticos
 */
export function normalize(text) {
    if (!text) return "";
    return text
        .toLowerCase()
        .trim()
        .normalize("NFD")                         // decompõe caracteres acentuados
        .replace(/[\u0300-\u036f]/g, "")          // remove marcas diacríticas
        .replace(/[^a-z0-9\s]/g, "")             // remove pontuação
        .replace(/\s+/g, " ");
}

/**
 * Calcula a distância de Levenshtein entre duas strings.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function levenshtein(a, b) {
    const m = a.length;
    const n = b.length;
    // Cria matriz (m+1) × (n+1)
    const dp = Array.from({ length: m + 1 }, (_, i) =>
        Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (a[i - 1] === b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }
    return dp[m][n];
}

/**
 * Calcula similaridade entre 0 e 1, baseada na distância de Levenshtein.
 * @param {string} a
 * @param {string} b
 * @returns {number} entre 0.0 e 1.0
 */
export function similarity(a, b) {
    if (a === b) return 1;
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    const dist = levenshtein(a, b);
    return 1 - dist / maxLen;
}

/**
 * Avalia se a palavra reconhecida bate com a esperada.
 * @param {string} recognized - texto bruto vindo do recognizer
 * @param {string} expected   - palavra exibida no bloco
 * @param {number} threshold  - padrão 0.80 (80%)
 * @returns {{ match: boolean, score: number, normalizedRecognized: string, normalizedExpected: string }}
 */
export function evaluate(recognized, expected) {
    const normRec = normalize(recognized);
    const normExp = normalize(expected);

    // Threshold dinâmico: palavras curtas são mais difíceis de captar perfeitamente.
    // 1-3 letras: 65% de similaridade
    // 4-5 letras: 75%
    // 6+ letras: 82%
    let threshold = 0.82;
    if (normExp.length <= 3) threshold = 0.65;
    else if (normExp.length <= 5) threshold = 0.75;

    // Tenta match exato ou em qualquer token da frase reconhecida
    const tokens = normRec.split(" ");
    let bestScore = similarity(normRec, normExp);
    
    for (const token of tokens) {
        // Se for um match exato em um dos tokens, retorna 1.0 imediatamente
        if (token === normExp) {
            bestScore = 1.0;
            break;
        }
        const s = similarity(token, normExp);
        if (s > bestScore) bestScore = s;
    }

    return {
        match: bestScore >= threshold,
        score: bestScore,
        normalizedRecognized: normRec,
        normalizedExpected: normExp,
    };
}
