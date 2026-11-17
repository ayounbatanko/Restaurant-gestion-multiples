/* Gestion de stock : chaque plat peut avoir un stock (dish.stock). Épuisé = indisponible. Décrémenté à la livraison. */
(function(){var X=window.RGX;if(!X)return;
X.isSoldOut=function(dish){return (dish.stock!=null&&dish.stock<=0)||dish.soldOut===true};
X.decrementStock=function(order){var d=X.db().get(),r=d.rests.find(function(x){return x.id==order.restId});if(!r)return;
  (order.items||[]).forEach(function(it){var m=(r.menu||[]).find(function(x){return x.n==it.n||x.name==it.name});if(m&&m.stock!=null)m.stock=Math.max(0,m.stock-(it.q||it.qty||1))});
  X.db().save(d)};
/* Décrémente une seule fois chaque commande terminée */
setInterval(function(){var d=X.db().get(),todo=d.orders.filter(function(o){return o.status=='terminée'&&!o.stockDone});
  if(!todo.length)return;var u=X.me();if(!u||u.role!=='restaurant')return;
  todo.filter(function(o){return d.rests.some(function(r){return r.id==o.restId&&(r.ownerId==u.id||r.userId==u.id||r.id==u.restId)})}).forEach(function(o){X.decrementStock(o);X.patchOrder(o.id,{stockDone:true})})},6000);
})();
