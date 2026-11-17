/* Avis & notes : le client note restaurant + livreur après une commande « terminée ». Stockage : d.reviews dans la fiche (rg_rests.data.reviews). */
(function(){var X=window.RGX;if(!X)return;
function rev(r){return r.reviews||(r.reviews=[])}
X.avg=function(r){var a=rev(r);if(!a.length)return null;return Math.round(a.reduce(function(s,x){return s+x.stars},0)/a.length*10)/10};
X.reviewable=function(){var u=X.me();if(!u||u.role!=='client')return[];var d=X.db().get();
  return d.orders.filter(function(o){return o.clientId==u.id&&o.status=='terminée'&&!o.reviewed}).reverse()};
X.openReviews=function(){var l=X.reviewable(),d=X.db().get();
  var h=l.length?l.map(function(o){var r=d.rests.find(function(r){return r.id==o.restId});
    return '<div style="border-bottom:1px solid #e3e6ef;padding:10px 0"><b>'+X.esc(r?r.name:'Restaurant')+'</b> · '+X.money(o.total)+'<div data-o="'+o.id+'"><select data-s style="font-size:18px;margin:6px 0"><option value="5">⭐⭐⭐⭐⭐</option><option value="4">⭐⭐⭐⭐</option><option value="3">⭐⭐⭐</option><option value="2">⭐⭐</option><option value="1">⭐</option></select><input data-c placeholder="Commentaire (facultatif)" style="width:100%;padding:8px;margin-bottom:6px"><button data-go style="padding:8px 14px;border:0;border-radius:10px;background:#12a36b;color:#fff;font-weight:700">Envoyer</button></div></div>'}).join(''):'<p>Aucune commande à noter pour le moment.</p>';
  var b=X.panel('rgx-rev','Noter mes commandes',h);
  b.querySelectorAll('[data-go]').forEach(function(btn){btn.onclick=function(){
    var w=btn.parentNode,id=w.getAttribute('data-o'),d=X.db().get(),o=d.orders.find(function(x){return x.id==id}),r=d.rests.find(function(x){return x.id==o.restId}),u=X.me();
    rev(r).push({id:X.uid(),orderId:id,clientId:u.id,clientName:u.name,stars:+w.querySelector('[data-s]').value,comment:w.querySelector('[data-c]').value.trim().slice(0,300),driverId:o.driverId||null,at:Date.now()});
    o.reviewed=true;X.db().save(d);w.innerHTML='✅ Merci !'}})};
X.reviewsOf=function(restId){var r=X.db().get().rests.find(function(x){return x.id==restId});return r?rev(r).slice().reverse():[]};
X.ready(function(){var u=X.me();if(u&&u.role==='client'&&X.reviewable().length)X.fab('rgx-fab-rev','⭐ Noter',X.openReviews,0)});
})();
