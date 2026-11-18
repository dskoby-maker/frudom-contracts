/* Контракты ФД — приложение на телефоне.
 * Принимает файл закупки из меню «Поделиться» (share_target в manifest.webmanifest):
 * кладёт его в кэш «fdc-share» и открывает калькулятор, а тот сам загружает расчёт. */
const SHARE = 'fdc-share', KEY = 'pending';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method === 'POST' && u.pathname.endsWith('/share-target')) {
    e.respondWith((async () => {
      const items = [];
      try {
        const fd = await e.request.formData();
        for (const f of fd.getAll('file')) {
          if (f && typeof f !== 'string' && f.size && f.size < 3e6) items.push({ name: f.name || 'файл', text: await f.text() });
        }
        const t = [fd.get('text'), fd.get('title')].filter(x => typeof x === 'string' && x.trim()).join('\n');
        if (!items.length && t) items.push({ name: 'текст', text: t });
      } catch (err) { /* пусто */ }
      const c = await caches.open(SHARE);
      await c.put(KEY, new Response(JSON.stringify({ at: Date.now(), items }), { headers: { 'content-type': 'application/json' } }));
      return Response.redirect(new URL('./?share=1', self.registration.scope).href, 303);
    })());
  }
});
