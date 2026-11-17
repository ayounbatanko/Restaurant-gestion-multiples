/* RestoGest v2 - chargeur unique des extensions. Ajouter dans chaque page, APRÈS db.js :
   <script src="ext-loader.js"></script>                                                       */
(function(){
/* ===== CONFIGURATION ===== */
window.RGX_SUPABASE_URL='https://azfunhfjmybekzakhtbu.supabase.co';
window.RGX_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6ZnVuaGZqbXliZWt6YWtodGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0Njg1MTYsImV4cCI6MjExMDA0NDUxNn0.Dz_8eSYVUfSqZQ3rA93FPclg1_zc8kdlyUxNkcDJ_0I';            /* clé publique anon, identique à db.js */
window.RGX_VAPID='';                                      /* clé publique VAPID (voir README_V2) ; vide = push désactivé */
window.RGX_PUSH_URL=window.RGX_SUPABASE_URL+'/functions/v1/push-notify';
var ON={reviews:1,promo:1,dispatch:1,tracking:1,kds:1,stock:1,'room-billing':1,theme:1,stats:1,realtime:0,push:0,'auth-bridge':0};
/* ========================= */
var base=document.currentScript.src.replace(/[^\/]*$/,'');
function load(n,cb){var s=document.createElement('script');s.src=base+'ext/'+n+'.js';s.onload=cb;s.onerror=cb;document.head.appendChild(s)}
load('ext-core',function(){Object.keys(ON).forEach(function(k){if(ON[k])load(k)})});
})();
