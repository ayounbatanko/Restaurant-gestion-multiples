RestoGest — prototype web/PWA.

Les données de cette version sont stockées dans le navigateur (localStorage). Les changements ne sont PAS synchronisés entre plusieurs téléphones ou comptes/appareils.

Livraison : le restaurant accepte et prépare la commande, puis attribue un livreur. Le livreur valide successivement : colis récupéré, en route, arrivé, terminée. Le livreur peut modifier son mot de passe depuis son espace.

Position client : au moment de commander, RestoGest demande l’autorisation GPS et enregistre automatiquement les coordonnées actuelles du client (avec précision et date de capture). Le client peut ouvrir sa position dans Google Maps. Le livreur reçoit les coordonnées et ouvre l’itinéraire Google Maps. Le champ adresse sert de complément (quartier, porte, repère). La géolocalisation nécessite HTTPS et l’autorisation du navigateur. Le livreur ouvre l’itinéraire Google Maps depuis sa position GPS si elle est autorisée.

Pour une vraie mise en production multi-appareils : backend sécurisé (par exemple Supabase/PostgreSQL), authentification, règles d’accès par restaurant, synchronisation temps réel, stockage des photos et configuration Google Maps. Ne pas utiliser localStorage comme base de données de production.
