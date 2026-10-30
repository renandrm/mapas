/* Service worker dos Mapas Mentais — Concurso Fiscal
   Estratégias:
   - shell (índice, manifest, ícones): pré-cacheado na instalação
   - mapas (.html): stale-while-revalidate — abre do cache na hora e atualiza em 2º plano
   - navegação offline: cai no índice                                              */

const VERSAO = 'v2';
const CACHE_SHELL = 'mapas-shell-' + VERSAO;
const CACHE_MAPAS = 'mapas-conteudo-' + VERSAO;

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_SHELL)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(
        ks.filter(k => k !== CACHE_SHELL && k !== CACHE_MAPAS).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

function ehMapa(url) {
  return url.pathname.endsWith('.html') && !url.pathname.endsWith('/index.html');
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // mapas: responde do cache na hora, revalida em segundo plano
  if (ehMapa(url)) {
    // chave sem query string: questoes.html?a=12 e questoes.html?mat=CD usam a mesma cópia em cache
    const chave = new Request(url.origin + url.pathname);
    e.respondWith(
      caches.open(CACHE_MAPAS).then(cache =>
        cache.match(chave).then(hit => {
          const rede = fetch(req).then(res => {
            if (res && res.ok) cache.put(chave, res.clone());
            return res;
          }).catch(() => hit);
          return hit || rede;
        })
      )
    );
    return;
  }

  // navegação: rede primeiro (pega atualizações), cache como rede de segurança
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copia = res.clone();
          caches.open(CACHE_SHELL).then(c => c.put(req, copia));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // resto (ícones, manifest): cache primeiro
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.ok) {
        const copia = res.clone();
        caches.open(CACHE_SHELL).then(c => c.put(req, copia));
      }
      return res;
    }))
  );
});

/* Baixar tudo para uso offline, com progresso */
self.addEventListener('message', e => {
  const dados = e.data || {};
  if (dados.tipo !== 'BAIXAR_TUDO') return;
  const urls = dados.urls || [];
  // a resposta volta pela MessagePort enviada pela página (e.ports[0]);
  // se não houver, cai no cliente que mandou a mensagem
  const porta = (e.ports && e.ports[0]) || e.source;
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE_MAPAS);
    let feitos = 0, erros = 0;
    for (const u of urls) {
      try {
        const res = await fetch(u, { cache: 'reload' });
        if (res && res.ok) await cache.put(u, res.clone()); else erros++;
      } catch (_) { erros++; }
      feitos++;
      if (porta) porta.postMessage({ tipo: 'PROGRESSO', feitos, total: urls.length, erros });
    }
    if (porta) porta.postMessage({ tipo: 'CONCLUIDO', feitos, total: urls.length, erros });
  })());
});
