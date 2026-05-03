// ============================================================
// GLOBAL SERVICE WORKER — sw.js
// Cacheia todos os jogos do Hub para uso offline.
// ============================================================

const CACHE_NAME = "hub-jogos-v17";
const VOSK_CACHE = "vosk-model-v1";
const IMAGE_CACHE = "hub-images-v1";

const STATIC_ASSETS = [
    "./",
    "./index.html",
    "./hub.css",
    
    // Jogo de Leitura
    "./jogo-leitura/",
    "./jogo-leitura/index.html",
    "./jogo-leitura/index.css",
    "./jogo-leitura/main.js",
    
    // Jogo de Associação
    "./jogo-associacao/",
    "./jogo-associacao/index.html",
    "./jogo-associacao/style.css",
    "./jogo-associacao/script.js",
    
    // Outros jogos
    "./jogo-calculo/index.html",
    "./jogo-quiz/index.html",
    "./jogo-balao/index.html",
    
    // Assets Comuns
    "./jogo-leitura/assets/sounds/correct.mp3",
    "./jogo-leitura/assets/sounds/wrong.mp3"
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
                keys.filter(k => k !== CACHE_NAME && k !== VOSK_CACHE && k !== IMAGE_CACHE)
                    .map(k => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const url = event.request.url;

    // Imagens (Locais e Externas) → Cache-First
    if (url.includes(".png") || url.includes(".jpg") || url.includes("unsplash.com")) {
        event.respondWith(
            caches.open(IMAGE_CACHE).then(async cache => {
                const cached = await cache.match(event.request);
                if (cached) return cached;
                try {
                    const response = await fetch(event.request);
                    if (response.ok) cache.put(event.request, response.clone());
                    return response;
                } catch (e) {
                    return cached;
                }
            })
        );
        return;
    }

    // Modelo Vosk → Cache-First
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

    // Estratégia Network-First para o resto
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
