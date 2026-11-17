/* Statistiques avancées + export CSV : heures de pointe, plats les plus vendus, CA par jour. */
(function(){var X=window.RGX;if(!X)return;
X.stats=function(restId){var d=X.db().get(),os=d.orders.filter(function(o){return o.status=='terminée'&&(!restId||o.restId==restId)});
  var hours=new Array(24).fill(0),dishes={},days={},ca=0;
  os.forEach(function(o){hours[new Date(o.created).getHours()]++;var k=new Date(o.created).toISOString().slice(0,10);days[k]=(days[k]||0)+o.total;ca+=o.total;
    (o.items||[]).forEach(function(i){var n=i.name||i.n;dishes[n]=(dishes[n]||0)+(i.qty||i.q||1)})});
  var top=Object.keys(dishes).map(function(k){return[k,dishes[k]]}).sort(function(a,b){return b[1]-a[1]}).slice(0,10);
  return{orders:os.length,revenue:ca,avg:os.length?ca/os.length:0,peakHour:hours.indexOf(Math.max.apply(null,hours)),hours:hours,top:top,days:days}};
X.openStats=function(restId){var s=X.stats(restId),mx=Math.max.apply(null,s.hours.concat(1));
  X.panel('rgx-stats','Statistiques','<p>Commandes livrées : <b>'+s.orders+'</b> · CA : <b>'+X.money(s.revenue)+'</b> · Panier moyen : <b>'+X.money(s.avg)+'</b><br>Heure de pointe : <b>'+s.peakHour+'h</b></p><div style="display:flex;align-items:flex-end;height:80px;gap:2px">'+s.hours.map(function(h,i){return '<div title="'+i+'h : '+h+'" style="flex:1;background:#26417a;height:'+Math.round(h/mx*100)+'%;min-height:2px"></div>'}).join('')+'</div><small>0h → 23h</small><h4>Top plats</h4>'+(s.top.map(function(t){return '<div>'+X.esc(t[0])+' — <b>'+t[1]+'</b></div>'}).join('')||'—')+'<button id="e" style="margin-top:12px;width:100%;padding:10px;border:0;border-radius:10px;background:#12a36b;color:#fff;font-weight:700">Exporter (CSV)</button>').querySelector('#e').onclick=function(){
    var rows=[['Date','Chiffre d\'affaires']].concat(Object.keys(s.days).sort().map(function(k){return[k,s.days[k]]})),csv='\ufeff'+rows.map(function(r){return r.join(';')}).join('\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='statistiques.csv';a.click()}};
X.ready(function(){var u=X.me();if(!u)return;if(u.role==='owner'||(u.role==='restaurant'&&typeof isOwnerAccount==='function'&&isOwnerAccount(u)))X.fab('rgx-fab-st','📊 Stats',function(){X.openStats()},1);
  else if(u.role==='restaurant'){var r=X.db().get().rests.find(function(x){return x.ownerId==u.id||x.userId==u.id||x.id==u.restId});if(r)X.fab('rgx-fab-st','📊 Stats',function(){X.openStats(r.id)},4)}});
})();
