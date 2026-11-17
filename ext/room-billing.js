/* Facturation sur la chambre : les commandes « Service en chambre » avec pay = « Ajouter à la note » sont cumulées par chambre. Export CSV pour la réception. */
(function(){var X=window.RGX;if(!X)return;
X.roomFolio=function(restId){var d=X.db().get(),f={};
  d.orders.filter(function(o){return o.restId==restId&&o.deliveryMode==='room'&&o.status!=='annulée'&&o.status!=='refusée'&&!o.settled}).forEach(function(o){
    var k=(o.buildingNumber||'?')+'-'+(o.roomNumber||'?');(f[k]=f[k]||{building:o.buildingNumber,room:o.roomNumber,total:0,orders:[]});f[k].total+=o.total;f[k].orders.push(o)});return f};
X.settleRoom=function(restId,key){var d=X.db().get();d.orders.forEach(function(o){if(o.restId==restId&&o.deliveryMode==='room'&&((o.buildingNumber||'?')+'-'+(o.roomNumber||'?'))==key)o.settled=Date.now()});X.db().save(d)};
X.exportFolioCSV=function(restId){var f=X.roomFolio(restId),rows=[['Bâtiment','Chambre','Commande','Date','Montant']];
  Object.keys(f).forEach(function(k){f[k].orders.forEach(function(o){rows.push([f[k].building,f[k].room,o.id,new Date(o.created).toLocaleString('fr-FR'),o.total])})});
  var csv='\ufeff'+rows.map(function(r){return r.map(function(c){return '"'+String(c).replace(/"/g,'""')+'"'}).join(';')}).join('\n'),a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='notes-chambres.csv';a.click()};
X.openFolio=function(){var u=X.me(),d=X.db().get(),r=d.rests.find(function(x){return x.ownerId==u.id||x.userId==u.id||x.id==u.restId});if(!r)return;
  var f=X.roomFolio(r.id),keys=Object.keys(f);
  var b=X.panel('rgx-folio','Notes de chambre',(keys.length?keys.map(function(k){return '<div style="display:flex;justify-content:space-between;border-bottom:1px solid #e3e6ef;padding:8px 0"><span>Bât. '+X.esc(f[k].building)+' · Ch. '+X.esc(f[k].room)+'<br><small>'+f[k].orders.length+' commande(s)</small></span><span><b>'+X.money(f[k].total)+'</b><br><button data-k="'+X.esc(k)+'">Réglée</button></span></div>'}).join(''):'<p>Aucune note en cours.</p>')+'<button id="csv" style="width:100%;margin-top:10px;padding:10px;border:0;border-radius:10px;background:#26417a;color:#fff;font-weight:700">Exporter CSV pour la réception</button>');
  b.querySelector('#csv').onclick=function(){X.exportFolioCSV(r.id)};
  b.querySelectorAll('[data-k]').forEach(function(x){x.onclick=function(){X.settleRoom(r.id,x.getAttribute('data-k'));X.openFolio()}})};
X.ready(function(){var u=X.me(),d=X.db().get();if(u&&u.role==='restaurant'){var r=d.rests.find(function(x){return x.ownerId==u.id||x.userId==u.id||x.id==u.restId});if(r&&(r.hotel||r.hotelModule||r.isHotel||u.accountType==='hotel'))X.fab('rgx-fab-folio','🏨 Notes',X.openFolio,3)}});
})();
