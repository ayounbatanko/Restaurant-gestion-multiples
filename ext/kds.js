/* Écran cuisine (KDS) : colonnes Nouvelle / En préparation / Prête, pour restaurants et hôtels. */
(function(){var X=window.RGX;if(!X)return;
var COLS=[['en attente','🆕 Nouvelles'],['acceptée','👨‍🍳 En préparation'],['préparée','✅ Prêtes']];
function rest(){var u=X.me(),d=X.db().get();return d.rests.find(function(x){return x.ownerId==u.id||x.userId==u.id||x.id==u.restId})}
X.openKDS=function(){var r=rest();if(!r)return alert('Fiche introuvable');
  var o=X.panel('rgx-kds','Écran cuisine','');var b=o.parentNode.parentNode;b.firstChild.style.maxWidth='980px';b.firstChild.style.height='88vh';
  function draw(){var d=X.db().get(),list=d.orders.filter(function(x){return x.restId==r.id});
    o.innerHTML='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'+COLS.map(function(c){
      var l=list.filter(function(x){return x.status==c[0]}).sort(function(a,b){return a.created-b.created});
      return '<div style="background:#f2f4fa;border-radius:12px;padding:8px"><b>'+c[1]+' ('+l.length+')</b>'+l.map(function(x){
        var age=Math.round((Date.now()-x.created)/60000),late=age>20;
        return '<div style="background:#fff;border-radius:10px;padding:8px;margin-top:8px;border-left:5px solid '+(late?'#e63946':'#12a36b')+'"><b>#'+String(x.id).slice(0,4).toUpperCase()+'</b> · '+age+' min'+(x.roomNumber?' · 🏨 Ch. '+X.esc(x.roomNumber):'')+'<br>'+(x.items||[]).map(function(i){return (i.qty||i.q||1)+'× '+X.esc(i.name||i.n)}).join('<br>')+'<br><button data-id="'+x.id+'" data-st="'+c[0]+'" style="margin-top:6px;padding:6px 10px;border:0;border-radius:8px;background:#26417a;color:#fff;font-weight:700">'+(c[0]=='en attente'?'Accepter':c[0]=='acceptée'?'Prête':'En attente du livreur')+'</button></div>'}).join('')+'</div>'}).join('')+'</div>';
    o.querySelectorAll('button[data-id]').forEach(function(btn){btn.onclick=function(){var st=btn.getAttribute('data-st'),next={'en attente':'acceptée','acceptée':'préparée'}[st];if(!next)return;X.patchOrder(btn.getAttribute('data-id'),{status:next,stageUpdated:Date.now()});draw()}})}
  draw();var iv=setInterval(function(){if(!document.getElementById('rgx-kds'))return clearInterval(iv);draw()},5000)};
X.ready(function(){var u=X.me();if(u&&u.role==='restaurant')X.fab('rgx-fab-kds','👨‍🍳 Cuisine',X.openKDS,2)});
})();
