// Troque o número da versão sempre que alterar o app, para o celular baixar a novidade.
const VERSAO = 'pelada-v1';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(chaves => Promise.all(chaves.filter(k => k !== VERSAO).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Mostra o que está guardado na hora (funciona sem internet) e atualiza em segundo plano.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(VERSAO).then(async cache => {
    const guardado = await cache.match(e.request, { ignoreSearch: true });
    const rede = fetch(e.request)
      .then(r => { if (r && (r.ok || r.type === 'opaque')) cache.put(e.request, r.clone()); return r; })
      .catch(() => guardado || Response.error());
    e.waitUntil(rede.then(() => {}, () => {}));
    return guardado || rede;
  }));
});
