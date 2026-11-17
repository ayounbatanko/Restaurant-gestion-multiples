/* Attribution automatique des livreurs : à l'acceptation d'une commande de livraison, le livreur libre le plus proche reçoit la course.
   Chargé sur la page restaurant (le restaurant "accepte" -> la course est proposée). Le livreur accepte/refuse dans la page livreur. */
(function(){var X=window.RGX;if(!X)return;
var TIMEOUT=90*1000; /* délai de réponse du livreur */
function drivers(d,restId){return d.users.filter(function(u){return u.role==='driver'&&!u.disabled&&!u.inactive&&(!u.restId||u.restId==restId)})}
function busy(d,id){return d.orders.some(function(o){return o.driverId==id&&!['terminée','annulée','refusée'].includes(o.status)})}
X.pickDriver=function(d,o){var r=d.rests.find(function(x){return x.id==o.restId});if(!r)return null;var tried=o.offerTried||[];
  var c=drivers(d,o.restId).filter(function(u){return !busy(d,u.id)&&tried.indexOf(u.id)<0});
  c.forEach(function(u){u._d=(u.lat!=null&&r.lat!=null)?X.haversine(u.lat,u.lng,r.lat,r.lng):9999});
  c.sort(function(a,b){return a._d-b._d});return c[0]||null};
X.offer=function(orderId){var d=X.db().get(),o=d.orders.find(function(x){return x.id==orderId});if(!o||o.driverId||o.deliveryMode==='room')return;
  var u=X.pickDriver(d,o);if(!u){o.offer=null;X.db().save(d);return}
  o.offer={driverId:u.id,expires:Date.now()+TIMEOUT};o.offerTried=(o.offerTried||[]).concat(u.id);X.db().save(d)};
/* Surveillance côté restaurant : propose les commandes acceptées sans livreur, et passe au suivant si délai dépassé */
function tick(){var u=X.me();if(!u||u.role!=='restaurant')return;var d=X.db().get();
  d.orders.forEach(function(o){if(['acceptée','préparée'].indexOf(o.status)<0||o.driverId||o.deliveryMode==='room'||o.serviceType==='À emporter')return;
    if(!o.offer||o.offer.expires<Date.now())X.offer(o.id)})}
/* Côté livreur : bannière d'offre */
X.driverAccept=function(id){var u=X.me();var d=X.db().get(),o=d.orders.find(function(x){return x.id==id});if(!o||o.driverId||!o.offer||o.offer.driverId!=u.id)return;o.driverId=u.id;o.offer=null;X.db().save(d)};
X.driverRefuse=function(id){var d=X.db().get(),o=d.orders.find(function(x){return x.id==id});if(o&&o.offer){o.offer.expires=0;X.db().save(d)}};
function driverTick(){var u=X.me();if(!u||u.role!=='driver')return;var d=X.db().get();
  var o=d.orders.find(function(x){return x.offer&&x.offer.driverId==u.id&&x.offer.expires>Date.now()&&!x.driverId});var b=document.getElementById('rgx-offer');
  if(!o){if(b)b.remove();return}
  if(!b){b=document.createElement('div');b.id='rgx-offer';b.style.cssText='position:fixed;left:8px;right:8px;top:8px;z-index:99998;background:#14213d;color:#fff;border-radius:14px;padding:12px;font:14px system-ui;box-shadow:0 8px 24px rgba(0,0,0,.4)';document.body.appendChild(b)}
  b.innerHTML='🛵 <b>Nouvelle course</b> · '+X.money(o.total)+'<br>'+X.esc(o.addr||'')+(o.distKm?' · '+o.distKm+' km':'')+'<br><button style="margin:8px 6px 0 0;padding:8px 14px;border:0;border-radius:10px;background:#12a36b;color:#fff;font-weight:700" onclick="RGX.driverAccept(\''+o.id+'\');this.parentNode.remove()">Accepter</button><button style="padding:8px 14px;border:0;border-radius:10px;background:#e63946;color:#fff;font-weight:700" onclick="RGX.driverRefuse(\''+o.id+'\');this.parentNode.remove()">Refuser</button>'}
setInterval(function(){tick();driverTick()},4000);
/* Le livreur publie sa position de disponibilité */
X.ready(function(){var u=X.me();if(u&&u.role==='driver'&&navigator.geolocation)navigator.geolocation.watchPosition(function(p){var d=X.db().get(),m=d.users.find(function(x){return x.id==u.id});if(m&&(m.lat==null||Math.abs(m.lat-p.coords.latitude)>0.0005||Math.abs(m.lng-p.coords.longitude)>0.0005)){m.lat=p.coords.latitude;m.lng=p.coords.longitude;X.db().save(d)}},function(){},{enableHighAccuracy:true,maximumAge:30000})});
})();
