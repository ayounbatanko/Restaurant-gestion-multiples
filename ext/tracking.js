/* Suivi de livraison en direct (carte Leaflet) + itinéraire/distance réels (OSRM). Utilise o.driverPos déjà publié par driver.html. */
(function(){var X=window.RGX;if(!X)return;
var OSRM='https://router.project-osrm.org/route/v1/driving/';
X.route=function(a,b){ /* a,b = [lat,lng] ; retourne Promise {km,min,line} */
  return fetch(OSRM+a[1]+','+a[0]+';'+b[1]+','+b[0]+'?overview=full&geometries=geojson').then(function(r){return r.json()}).then(function(j){
    var r=j.routes&&j.routes[0];if(!r)throw 0;return{km:Math.round(r.distance/100)/10,min:Math.round(r.duration/60),line:r.geometry.coordinates.map(function(c){return[c[1],c[0]]})}})
  .catch(function(){var k=X.haversine(a[0],a[1],b[0],b[1]);return{km:Math.round(k*10)/10,min:Math.round(k/25*60),line:[a,b]}})};
function leaflet(cb){if(window.L)return cb();
  var l=document.createElement('link');l.rel='stylesheet';l.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(l);
  var s=document.createElement('script');s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.min.js';s.onload=cb;document.head.appendChild(s)}
X.track=function(orderId){
  var b=X.panel('rgx-trk','Suivi en direct','<div id="rgx-map" style="height:340px;border-radius:12px"></div><p id="rgx-eta" style="font-weight:700"></p>');
  leaflet(function(){var d=X.db().get(),o=d.orders.find(function(x){return x.id==orderId}),r=d.rests.find(function(x){return x.id==o.restId});
    var map=L.map('rgx-map').setView([r.lat||0,r.lng||0],14);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);
    var mr=L.marker([r.lat,r.lng]).addTo(map).bindPopup('🍽️ '+r.name),mc=o.cLat!=null?L.marker([o.cLat,o.cLng]).addTo(map).bindPopup('📍 Vous'):null,md=null,pl=null;
    function upd(){var o=X.db().get().orders.find(function(x){return x.id==orderId});if(!o||!document.getElementById('rgx-map'))return clearInterval(iv);
      if(o.driverPos){if(!md)md=L.marker(o.driverPos,{icon:L.divIcon({html:'🛵',className:'',iconSize:[28,28]})}).addTo(map);else md.setLatLng(o.driverPos);
        if(o.cLat!=null)X.route(o.driverPos,[o.cLat,o.cLng]).then(function(rt){if(pl)map.removeLayer(pl);pl=L.polyline(rt.line,{color:'#26417a'}).addTo(map);var e=document.getElementById('rgx-eta');if(e)e.textContent='🕒 Arrivée estimée : '+rt.min+' min ('+rt.km+' km)'});
        var pts=[o.driverPos];if(mc)pts.push([o.cLat,o.cLng]);map.fitBounds(pts,{padding:[40,40],maxZoom:16})}
      else document.getElementById('rgx-eta').textContent='En attente de la prise en charge par le livreur…'}
    upd();var iv=setInterval(upd,5000)})};
/* Ajoute un bouton « Suivre » sur les commandes en route (client) */
X.ready(function(){var u=X.me();if(!u||u.role!=='client')return;setInterval(function(){
  var o=X.db().get().orders.filter(function(x){return x.clientId==u.id&&x.status=='en route'&&x.deliveryMode!=='room'}).pop();var b=document.getElementById('rgx-fab-trk');
  if(o&&!b)X.fab('rgx-fab-trk','🛵 Suivre ma commande',function(){X.track(o.id)},2);if(!o&&b)b.remove()},4000)});
})();
