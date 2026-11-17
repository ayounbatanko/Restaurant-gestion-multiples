(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let activeFilter='all',lastFocus=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderModules(){
 const q=$('#search').value.trim().toLocaleLowerCase('fr');
 const list=SAHEL_MODULES.filter(m=>(activeFilter==='all'||(activeFilter==='live'&&m.status==='live')||m.group===activeFilter)&&(!q||(m.name+' '+m.description+' '+m.label).toLocaleLowerCase('fr').includes(q)));
 $('#modules').innerHTML=list.length?list.map(m=>`<article class="module">
 <div class="module-top"><span class="module-icon">${m.icon}</span><span class="module-code">PÔLE ${m.code}</span></div>
 <h3>${esc(m.name)}</h3><p>${esc(m.description)}</p>
 <div class="module-bottom"><span class="module-tag">${esc(m.label)}</span><span class="module-state ${m.status}">${m.status==='live'?'Disponible via RestoGest':m.status==='pilot'?'Espace pilote':m.status==='blocked'?'Configuration requise':'En préparation'}</span>
 <button type="button" data-module="${m.id}">${m.status==='live'?'Accéder →':m.status==='pilot'?'Ouvrir l’espace pilote →':'En savoir plus →'}</button></div></article>`).join(''):'<p class="empty">Aucun service ne correspond à votre recherche.</p>';
}
function openModal(m){
 lastFocus=document.activeElement;
 $('#modalIcon').textContent=m.icon;$('#modalCode').textContent='PÔLE '+m.code+' · '+m.label;
 $('#modalTitle').textContent=m.name;$('#modalDescription').textContent=m.description;
 $('#modalNotice').textContent=m.note;$('#modalNotice').className='notice '+m.status;
 const a=$('#modalOpen');a.hidden=!(m.status==='live'||m.status==='pilot');if(m.status==='live'||m.status==='pilot'){a.href=m.url;a.textContent=(m.status==='live'?m.cta:'Ouvrir l’espace pilote')+' →'}
 const modal=$('#moduleModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');
 const close=modal.querySelector('.modal-x');close.focus();
}
function closeModal(){const modal=$('#moduleModal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true');if(lastFocus&&lastFocus.focus)lastFocus.focus()}
$('#filters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;activeFilter=b.dataset.filter;$$('#filters button').forEach(x=>x.classList.toggle('active',x===b));renderModules()});
$('#search').addEventListener('input',renderModules);
$('#modules').addEventListener('click',e=>{const b=e.target.closest('[data-module]');if(b){const m=SAHEL_MODULES.find(x=>x.id===b.dataset.module);if(m)openModal(m)}});
document.addEventListener('click',e=>{if(e.target.closest('[data-close]'))closeModal()});
$('#moduleModal').addEventListener('click',e=>{if(e.target===$('#moduleModal'))closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
$('#menuBtn').addEventListener('click',()=>{const nav=$('#mainNav'),open=nav.classList.toggle('open');$('#menuBtn').setAttribute('aria-expanded',String(open))});
$$('#mainNav a').forEach(a=>a.addEventListener('click',()=>{$('#mainNav').classList.remove('open');$('#menuBtn').setAttribute('aria-expanded','false')}));
$('#year').textContent=new Date().getFullYear();renderModules();
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
})();