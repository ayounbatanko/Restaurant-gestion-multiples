/* Notifications Web Push (VAPID) même application fermée. Nécessite : sql/ + supabase/functions/push-notify + clé publique VAPID dans window.RGX_VAPID. */
(function(){var X=window.RGX;if(!X||!('serviceWorker' in navigator)||!('PushManager' in window))return;
function b64(s){var p='='.repeat((4-s.length%4)%4),r=(s+p).replace(/-/g,'+').replace(/_/g,'/'),a=atob(r);return Uint8Array.from(a,function(c){return c.charCodeAt(0)})}
X.enablePush=function(){var u=X.me();if(!u||!window.RGX_VAPID)return alert('Clé VAPID non configurée');
  Notification.requestPermission().then(function(p){if(p!=='granted')return;
    navigator.serviceWorker.ready.then(function(reg){return reg.pushManager.getSubscription()||reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(window.RGX_VAPID)})}).then(function(sub){
      var d=X.db().get(),m=d.users.find(function(x){return x.id==u.id});if(m){m.push=JSON.parse(JSON.stringify(sub));X.db().save(d);alert('🔔 Notifications activées')}})})};
X.ready(function(){var u=X.me();if(u&&window.RGX_VAPID&&Notification.permission!=='granted')X.fab('rgx-fab-push','🔔 Activer',X.enablePush,5)});
/* Appel de la fonction Edge à chaque changement de statut observé */
var last={};setInterval(function(){var u=X.me();if(!u||!window.RGX_PUSH_URL)return;X.db().get().orders.forEach(function(o){if(last[o.id]&&last[o.id]!==o.status&&u.role==='restaurant')
  fetch(window.RGX_PUSH_URL,{method:'POST',headers:{'Content-Type':'application/json',apikey:window.RGX_ANON_KEY,Authorization:'Bearer '+window.RGX_ANON_KEY},body:JSON.stringify({orderId:o.id,status:o.status})}).catch(function(){});last[o.id]=o.status})},5000);
})();
