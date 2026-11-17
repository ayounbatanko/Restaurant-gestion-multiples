/* Codes promo + fidélité. Le restaurant crée ses codes (rest.promos), le client les applique au panier. */
(function(){var X=window.RGX;if(!X)return;
/* Calcul de remise : retourne {ok, discount, msg} */
X.applyPromo=function(rest,code,subtotal){
  code=String(code||'').trim().toUpperCase();var p=(rest.promos||[]).find(function(x){return x.code===code&&x.active!==false});
  if(!p)return{ok:false,discount:0,msg:'Code invalide'};
  if(p.expires&&Date.now()>p.expires)return{ok:false,discount:0,msg:'Code expiré'};
  if(p.min&&subtotal<p.min)return{ok:false,discount:0,msg:'Minimum '+p.min+' requis'};
  if(p.maxUses&&(p.used||0)>=p.maxUses)return{ok:false,discount:0,msg:'Code épuisé'};
  var disc=p.type==='percent'?subtotal*p.value/100:p.value;disc=Math.min(Math.round(disc),subtotal);
  return{ok:true,discount:disc,msg:'-'+X.money(disc),promo:p}};
X.consumePromo=function(restId,code){var d=X.db().get(),r=d.rests.find(function(x){return x.id==restId}),p=r&&(r.promos||[]).find(function(x){return x.code===String(code).toUpperCase()});if(p){p.used=(p.used||0)+1;X.db().save(d)}};
/* Fidélité : 1 point par tranche de 1000 dépensés ; 100 points = 1 bon de 1000 */
X.loyalty=function(clientId){var d=X.db().get(),pts=0;d.orders.forEach(function(o){if(o.clientId==clientId&&o.status=='terminée')pts+=Math.floor(o.total/1000)});return{points:pts,vouchers:Math.floor(pts/100)}};
/* Écran de gestion côté restaurant */
X.openPromos=function(){var u=X.me();if(!u||u.role!=='restaurant')return;var d=X.db().get(),r=d.rests.find(function(x){return x.ownerId==u.id||x.userId==u.id||x.id==u.restId});if(!r)return alert('Fiche restaurant introuvable');
  r.promos=r.promos||[];
  var list=r.promos.map(function(p,i){return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e3e6ef"><span><b>'+X.esc(p.code)+'</b> '+(p.type==='percent'?p.value+'%':X.money(p.value))+' · utilisé '+(p.used||0)+'</span><button data-del="'+i+'">🗑</button></div>'}).join('')||'<p>Aucun code.</p>';
  var b=X.panel('rgx-promo','Codes promo',list+'<hr><input id="pc" placeholder="CODE (ex: BIENVENUE10)" style="width:100%;padding:8px;margin:4px 0"><select id="pt" style="width:100%;padding:8px;margin:4px 0"><option value="percent">Pourcentage</option><option value="amount">Montant fixe</option></select><input id="pv" type="number" placeholder="Valeur" style="width:100%;padding:8px;margin:4px 0"><input id="pm" type="number" placeholder="Minimum de commande (facultatif)" style="width:100%;padding:8px;margin:4px 0"><button id="pa" style="width:100%;padding:10px;border:0;border-radius:10px;background:#26417a;color:#fff;font-weight:700">Ajouter</button>');
  b.querySelector('#pa').onclick=function(){var c=b.querySelector('#pc').value.trim().toUpperCase(),v=+b.querySelector('#pv').value;if(!c||!v)return alert('Code et valeur requis');
    var d=X.db().get(),r=d.rests.find(function(x){return x.id==r0.id});r.promos=r.promos||[];r.promos.push({code:c,type:b.querySelector('#pt').value,value:v,min:+b.querySelector('#pm').value||0,active:true,used:0});X.db().save(d);X.openPromos()};
  var r0=r;b.querySelectorAll('[data-del]').forEach(function(x){x.onclick=function(){var d=X.db().get(),r=d.rests.find(function(y){return y.id==r0.id});r.promos.splice(+x.getAttribute('data-del'),1);X.db().save(d);X.openPromos()}})};
X.ready(function(){var u=X.me();if(u&&u.role==='restaurant')X.fab('rgx-fab-promo','🎟️ Promos',X.openPromos,1)});
})();
