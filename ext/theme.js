/* Mode sombre (bascule mémorisée) + indicateur hors-ligne. */
(function(){var X=window.RGX;if(!X)return;var K='rgx_dark';
var st=document.createElement('style');st.textContent='html.rgx-dark{filter:invert(1) hue-rotate(180deg)}html.rgx-dark img,html.rgx-dark video,html.rgx-dark canvas,html.rgx-dark iframe{filter:invert(1) hue-rotate(180deg)}';document.head.appendChild(st);
function set(v){document.documentElement.classList.toggle('rgx-dark',v);try{localStorage.setItem(K,v?'1':'0')}catch(e){}}
try{if(localStorage.getItem(K)==='1')set(true)}catch(e){}
X.toggleDark=function(){set(!document.documentElement.classList.contains('rgx-dark'))};
X.ready(function(){X.fab('rgx-fab-dark','🌙',X.toggleDark,4)});
function net(){var b=document.getElementById('rgx-off');if(navigator.onLine){if(b)b.remove();return}
  if(!b){b=document.createElement('div');b.id='rgx-off';b.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:#fb8500;color:#fff;text-align:center;padding:6px;font:700 13px system-ui';b.textContent='📡 Hors ligne : vos actions seront envoyées au retour du réseau';document.body.appendChild(b)}}
window.addEventListener('online',net);window.addEventListener('offline',net);X.ready(net);
})();
