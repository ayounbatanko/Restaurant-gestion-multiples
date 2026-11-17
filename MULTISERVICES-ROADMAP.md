# RestoGest Multiservices — plan de livraison

## Principe
Une identité commune, des organisations et établissements séparés, des modules métier indépendants et des services transversaux partagés.

## Ordre de réalisation recommandé
1. Audit de la version 1.9.4 et sauvegarde.
2. Authentification serveur et migration contrôlée des profils.
3. Organisations, établissements, adhésions, rôles et permissions.
4. Catalogue public, recherche et pages de détail.
5. Commerce : catalogue, panier, commande, stock et retours.
6. Livraison : affectation, suivi, preuve de remise et incidents.
7. Hôtel et réservations : disponibilité, acompte, arrivée et départ.
8. Services et événements : demandes, devis, rendez-vous et annulations.
9. Paiement via prestataires agréés, rapprochement et remboursements.
10. Pays, devises, langues, fiscalité et règles locales.
11. Agro, tourisme, mobilité et modules complémentaires.
12. Tests de charge, sécurité, conformité et lancement pays par pays.

## Conditions de mise en production
- Politiques RLS testées avec plusieurs organisations et rôles.
- Opérations sensibles validées côté serveur, jamais uniquement dans le navigateur.
- Journal d'audit et sauvegardes restaurables.
- Idempotence des paiements et webhooks vérifiés.
- Tests de concurrence sur stocks et réservations.
- Conditions générales, politique de confidentialité et processus de support par pays.
