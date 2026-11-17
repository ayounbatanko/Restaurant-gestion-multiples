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
/* bouton flottant d'accès rapide */
X.fab=function(id,label,fn,slot){
  if(document.getElementById(id))return;
  var b=document.createElement('button');b.id=id;b.textContent=label;
  b.style.cssText='position:fixed;right:12px;bottom:'+(70+(slot||0)*54)+'px;z-index:9990;border:0;border-radius:999px;padding:12px 16px;background:#26417a;color:#fff;font:700 14px system-ui;box-shadow:0 6px 18px rgba(20,33,61,.35)';
  b.onclick=fn;document.body.appendChild(b);
};
X.patchOrder=function(id,patch){var d=X.db().get(),o=d.orders.find(function(x){return x.id==id});if(!o)return false;Object.assign(o,patch);X.db().save(d);return true};
X.ready=function(fn){if(document.readyState!=='loading')setTimeout(fn,300);else document.addEventListener('DOMContentLoaded',function(){setTimeout(fn,300)})};
})();
