/* Sahel Connect — service worker (réseau d'abord, cache en secours hors ligne) */
const CACHE='sahel-connect-v4';
const FILES=['./','./index.html','./css/styles.css?v=3','./js/modules.js?v=3','./js/app.js?v=3','./assets/logo.svg','./assets/icon-192.png','./manifest.webmanifest','./config.js','./app/index.html','./app/app.css','./app/app.js','./owner/index.html','./owner/owner.css','./owner/owner.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('sahel-connect-')&&x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy))}return res})
    .catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('./index.html'):Response.error()))));
});
