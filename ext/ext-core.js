/* RestoGest v2 - noyau des extensions. Charger APRÈS db.js. Aucune modification des pages existantes requise. */
(function(){
var X=window.RGX=window.RGX||{};
X.db=function(){return window.RGDB};
X.me=function(){try{return typeof me==='function'?me():null}catch(e){return null}};
X.uid=function(){return Math.random().toString(36).slice(2,9)};
X.esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
X.money=function(n){return (Math.round(n*100)/100).toLocaleString('fr-FR')};
/* distance à vol d'oiseau (km) */
X.haversine=function(a,b,c,d){var R=6371,r=Math.PI/180,x=(c-a)*r,y=(d-b)*r,h=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)*Math.sin(y/2);return 2*R*Math.asin(Math.sqrt(h))};
/* panneau flottant réutilisable */
X.panel=function(id,title,html){
  var o=document.getElementById(id);if(o)o.remove();
  o=document.createElement('div');o.id=id;
  o.style.cssText='position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.5);display:flex;align-items:flex-end;justify-content:center';
  o.innerHTML='<div style="background:#fff;color:#16213d;width:100%;max-width:520px;max-height:88vh;overflow:auto;border-radius:18px 18px 0 0;padding:16px;font:14px system-ui"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b style="font-size:17px">'+X.esc(title)+'</b><button data-x style="border:0;background:#e8ecf8;border-radius:999px;padding:6px 12px;font-weight:700">✕</button></div><div data-b>'+html+'</div></div>';
  o.addEventListener('click',function(e){if(e.target===o||e.target.hasAttribute('data-x'))o.remove()});
  document.body.appendChild(o);return o.querySelector('[data-b]');
};
/* Outils regroupés : plus de boutons flottants sur l'écran.
   Chaque module déclare son outil avec X.fab() ; tous sont réunis dans une seule tuile « Outils & options »
   (dans la grille du tableau de bord, ou dans la barre d'onglets du client). */
var META={
 'rgx-fab-rev':['⭐','Noter mes commandes','Donnez votre avis sur vos livraisons'],
 'rgx-fab-promo':['🎟️','Codes promo','Créer et gérer vos offres'],
 'rgx-fab-kds':['👨‍🍳','Écran cuisine','Suivre les commandes à préparer'],
 'rgx-fab-folio':['🏨','Notes de chambre','Factures par chambre, export CSV'],
 'rgx-fab-st':['📊','Statistiques','Ventes, heures de pointe, plats populaires'],
 'rgx-fab-dark':['🌙','Mode sombre','Changer l\u2019apparence de l\u2019application'],
 'rgx-fab-trk':['🛵','Suivre ma commande','Position du livreur en direct'],
 'rgx-fab-push':['🔔','Notifications','Être alerté même application fermée']};
X.fab=function(id,label,fn){
  var s=document.getElementById(id);
  if(!s){s=document.createElement('span');s.id=id;s.hidden=true;s.setAttribute('data-rgx-tool','1');document.body.appendChild(s)}
  s._fn=fn;s._label=label;X.mountHub()};
X.tools=function(){return [].slice.call(document.querySelectorAll('[data-rgx-tool]'))};
X.openHub=function(){
  var t=X.tools(),h=t.length?t.map(function(s,i){var m=META[s.id]||[String(s._label||'🔧').split(' ')[0],s._label||'Outil',''];
    return '<button data-i="'+i+'" style="display:flex;gap:12px;align-items:center;width:100%;text-align:start;padding:12px;margin:0 0 8px;border:0;border-radius:14px;background:#f2f4fa;color:#16213d;font:inherit;cursor:pointer"><span style="font-size:26px">'+m[0]+'</span><span><b style="display:block;font-size:15px">'+X.esc(m[1])+'</b><small style="opacity:.7">'+X.esc(m[2])+'</small></span></button>'}).join(''):'<p>Aucun outil disponible pour le moment.</p>';
  var b=X.panel('rgx-hub','🧰 Outils & options',h);
  b.querySelectorAll('button[data-i]').forEach(function(btn){btn.onclick=function(){var s=t[+btn.getAttribute('data-i')],o=document.getElementById('rgx-hub');if(o)o.remove();if(s&&s._fn)s._fn()}})};
var mt=null;
function mount(){
  var has=document.querySelector('[data-rgx-hub]');
  if(!X.tools().length){if(has)has.remove();return}
  if(has)return;
  var g=document.querySelector('.home-grid');
  if(g){var b=document.createElement('button');b.className='hg-btn';b.setAttribute('data-rgx-hub','1');b.innerHTML='<span class="ico">🧰</span><span>Outils &amp; options</span>';b.onclick=X.openHub;
    var last=g.lastElementChild;g.insertBefore(b,last&&last.classList.contains('full')?last:null);return}
  var n=document.getElementById('nav');
  if(n&&n.children.length){var c=document.createElement('button');c.setAttribute('data-rgx-hub','1');c.textContent='🧰 Outils';c.onclick=X.openHub;n.appendChild(c)}}
X.mountHub=function(){clearTimeout(mt);mt=setTimeout(mount,120)};
try{new MutationObserver(X.mountHub).observe(document.documentElement,{childList:true,subtree:true})}catch(e){}
X.patchOrder=function(id,patch){var d=X.db().get(),o=d.orders.find(function(x){return x.id==id});if(!o)return false;Object.assign(o,patch);X.db().save(d);return true};
X.ready=function(fn){if(document.readyState!=='loading')setTimeout(fn,300);else document.addEventListener('DOMContentLoaded',function(){setTimeout(fn,300)})};
})();
