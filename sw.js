// ============================================================
// GLOBAL SERVICE WORKER — sw.js
// Cacheia todos os jogos do Hub para uso offline.
// ============================================================

const CACHE_NAME = "hub-jogos-v8";
const VOSK_CACHE = "vosk-model-v1";

const STATIC_ASSETS = [
    "./",
    "./index.html",
    
    // Jogo de Leitura
    "./jogo-leitura/",
    "./jogo-leitura/index.html",
    "./jogo-leitura/index.css",
    "./jogo-leitura/main.js",
    "./jogo-leitura/js/recognition/SpeechRecognizer.js",
    "./jogo-leitura/js/evaluation/Evaluator.js",
    
    // Jogo de Cálculo
    "./jogo-calculo/",
    "./jogo-calculo/index.html",
    "./jogo-calculo/style.css",
    "./jogo-calculo/script.js",
    
    // Jogo de Associação
    "./jogo-associacao/",
    "./jogo-associacao/index.html",
    "./jogo-associacao/style.css",
    "./jogo-associacao/script.js",
    
    // Jogo de Quiz
    "./jogo-quiz/",
    "./jogo-quiz/index.html",
    "./jogo-quiz/style.css",
    "./jogo-quiz/script.js",
    
    // Jogo de Balão
    "./jogo-balao/",
    "./jogo-balao/index.html",
    "./jogo-balao/style.css",
    "./jogo-balao/script.js",
    
    // Assets Comuns
    "./jogo-leitura/assets/sounds/correct.mp3",
    "./jogo-leitura/assets/sounds/wrong.mp3",
    "./jogo-leitura/assets/sounds/land.mp3"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME && k !== VOSK_CACHE)
                    .map(k => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const url = event.request.url;

    // Modelo Vosk e CDN assets → cache-first
    if (url.includes("vosk") || url.includes("alphacephei")) {
        event.respondWith(
            caches.open(VOSK_CACHE).then(async cache => {
                const cached = await cache.match(event.request);
                if (cached) return cached;
                const response = await fetch(event.request);
                if (response.ok) cache.put(event.request, response.clone());
                return response;
            })
        );
        return;
    }

    // Estratégia Network-First para o resto (para garantir atualizações de lógica)
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
