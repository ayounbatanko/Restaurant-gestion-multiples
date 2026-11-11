# RestoGest

Application de gestion de restaurant (caisse, commandes en ligne, livreurs, abonnement Pro).

## Démo en ligne (GitHub Pages)

Après activation de GitHub Pages, l’URL sera :

`https://VOTRE_PSEUDO.github.io/restogest/`

## Publier sur GitHub Pages (méthode simple)

### 1. Créer le dépôt sur GitHub
1. Allez sur [github.com/new](https://github.com/new)
2. Nom du dépôt : `restogest`
3. Public → **Create repository**

### 2. Envoyer les fichiers

Sur votre ordinateur (dans ce dossier) :

```bash
git init
git add .
git commit -m "Publication RestoGest"
git branch -M main
git remote add origin https://github.com/VOTRE_PSEUDO/restogest.git
git push -u origin main
```

### 3. Activer GitHub Pages
1. Dépôt → **Settings** → **Pages**
2. Source : **Deploy from a branch**
3. Branch : **main** / dossier **/ (root)**
4. Save

Attendez 1–2 minutes, puis ouvrez :

`https://VOTRE_PSEUDO.github.io/restogest/`

## Important

- **HTTPS** est fourni par GitHub → la géolocalisation peut fonctionner (autorisez la localisation dans le navigateur).
- Les données sont stockées dans le **navigateur** (localStorage) : chaque téléphone a ses propres données tant qu’il n’y a pas de serveur backend.
- Pour tester propriétaire + restaurant + client, utilisez le **même navigateur** (ou les mêmes outils de développement / profils avec précaution), ou prévoyez un backend plus tard.

## Structure

- `index.html` — application complète (fichier unique)
- `manifest.webmanifest` — installation type application
- `src/` — version modulaire (développement)

## Compte de test

Au premier lancement : créez d’abord le **compte propriétaire**, puis les comptes restaurant / client.
