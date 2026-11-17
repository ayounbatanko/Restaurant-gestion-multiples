/* Pont Supabase Auth (GoTrue) : inscription/connexion avec vrai hachage de mot de passe côté serveur.
   Identifiant = téléphone transformé en e-mail technique. À utiliser avec sql/v2_securite_rls.sql (étape 2). */
(function(){var X=window.RGX;if(!X)return;var A=X.auth={},U=window.RGX_SUPABASE_URL+'/auth/v1',K=window.RGX_ANON_KEY;
function mail(phone){return String(phone).replace(/\D/g,'')+'@restogest.app'}
function call(path,body){return fetch(U+path,{method:'POST',headers:{apikey:K,'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json()})}
A.signUp=function(phone,password,meta){return call('/signup',{email:mail(phone),password:password,data:meta||{}})};
A.signIn=function(phone,password){return call('/token?grant_type=password',{email:mail(phone),password:password}).then(function(j){if(j.access_token){try{localStorage.setItem('rgx_jwt',j.access_token);localStorage.setItem('rgx_refresh',j.refresh_token)}catch(e){}}return j})};
A.token=function(){try{return localStorage.getItem('rgx_jwt')}catch(e){return null}};
A.signOut=function(){try{localStorage.removeItem('rgx_jwt');localStorage.removeItem('rgx_refresh')}catch(e){}};
A.reset=function(phone){return call('/recover',{email:mail(phone)})};
})();
