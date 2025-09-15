# 🚀 Guide de Déploiement - Nat Voyages

## 📋 Prérequis
- Compte Vercel
- Repository Git (GitHub, GitLab, ou Bitbucket)
- Clés Firebase configurées

## 🔧 Configuration Firebase
Les variables d'environnement suivantes doivent être configurées dans Vercel :

```
REACT_APP_FIREBASE_API_KEY=AIzaSyC4TbP5sHlzzPgBa04NpiaQBnMnDJxfojQ
REACT_APP_FIREBASE_AUTH_DOMAIN=nat-voyage-a37f0.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=nat-voyage-a37f0
REACT_APP_FIREBASE_STORAGE_BUCKET=nat-voyage-a37f0.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=914678441346
REACT_APP_FIREBASE_APP_ID=1:914678441346:web:bc1368b92c5e96fad4db9b
REACT_APP_FIREBASE_MEASUREMENT_ID=G-7VH2TH08WR
```

## 🚀 Déploiement sur Vercel

### Méthode 1: Via l'interface Vercel
1. Connectez-vous sur [vercel.com](https://vercel.com)
2. Cliquez sur "New Project"
3. Importez votre repository Git
4. Configurez les variables d'environnement dans les "Environment Variables"
5. Déployez

### Méthode 2: Via Vercel CLI
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel --prod
```

## 🔒 Sécurité
- Le fichier `.env` est ignoré par Git
- Les clés Firebase sont configurées via les variables d'environnement
- Ne jamais commiter les clés dans le code

## 🌐 Autres plateformes de déploiement

### Netlify
1. Connectez votre repository
2. Build command: `npm run build`
3. Publish directory: `build`
4. Ajoutez les variables d'environnement

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## ⚠️ Problèmes courants
- **Build échoue**: Vérifiez que toutes les variables d'environnement sont définies
- **Firebase erreur**: Vérifiez la configuration des règles Firestore
- **Routing 404**: Le fichier `vercel.json` gère le SPA routing

## 📝 Notes
- Le projet utilise React Router pour la navigation
- Les routes sont gérées par le fichier `vercel.json`
- Bootstrap 5 est inclus pour le style