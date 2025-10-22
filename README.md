# 🚢 Nat Voyages - Plateforme de Réservation de Transport Maritime

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-9.x-FFCA28?logo=firebase)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Description

**Nat Voyages** est une plateforme web moderne de réservation de billets de transport maritime au Gabon. L'application permet aux utilisateurs de rechercher des voyages, réserver des billets pour plusieurs passagers (adultes, enfants, bébés), et gérer leurs réservations en temps réel.

### 🎯 Objectif du Projet

Digitaliser et simplifier le processus de réservation de billets de transport maritime entre les principales villes du Gabon (Libreville, Port-Gentil, Mitzic, etc.), en offrant une expérience utilisateur fluide et sécurisée.

## ✨ Fonctionnalités Principales

### Pour les Clients
- 🔍 **Recherche de Voyages** : Rechercher des voyages par ville de départ, destination et date
- 🎫 **Réservation Multi-Passagers** : Réserver des billets pour plusieurs passagers en une seule transaction
- 🔄 **Aller-Retour** : Option de réserver des voyages aller-retour avec détection automatique des correspondances
- 💺 **Classes de Voyage** : Choisir entre classe Économique et VIP
- 👶 **Types de Passagers** : Tarifs différenciés pour Adultes, Enfants et Bébés
- 📄 **Génération de Billets PDF** : Téléchargement automatique des billets avec QR Code
- 📱 **Responsive Design** : Interface optimisée pour mobile, tablette et desktop

### Gestion des Données
- 🔐 **Authentification Sécurisée** : Système d'authentification Firebase
- 💾 **Base de Données Temps Réel** : Firestore pour la gestion des données
- ✅ **Validation des Données** : Vérification automatique des champs et conversion des types
- 🎟️ **Gestion des Places** : Contrôle en temps réel de la disponibilité des places
- 🔢 **Numérotation Unique** : Génération automatique de numéros de billets uniques

## 🛠️ Technologies Utilisées

### Frontend
- **React 18.x** - Framework JavaScript pour l'interface utilisateur
- **React Router v6** - Navigation et routing
- **Bootstrap 5** - Framework CSS pour le design responsive
- **jsPDF** - Génération de PDF pour les billets
- **QRCode** - Génération de QR Codes sur les billets

### Backend & Database
- **Firebase Authentication** - Gestion des utilisateurs
- **Cloud Firestore** - Base de données NoSQL en temps réel
- **Firebase Storage** - Stockage des fichiers

### SEO & Performance
- **Meta Tags Optimisés** - SEO pour les moteurs de recherche
- **Sitemap.xml** - Plan du site pour l'indexation
- **Robots.txt** - Configuration pour les crawlers
- **PWA Ready** - Application Web Progressive
- **Schema.org JSON-LD** - Données structurées

## 📁 Structure du Projet

```
nat-voyages-client/
├── public/
│   ├── assets/
│   │   ├── images/        # Images et logos
│   │   ├── js/           # Scripts JavaScript
│   │   └── css/          # Styles CSS
│   ├── index.html        # HTML principal avec SEO
│   ├── manifest.json     # Configuration PWA
│   ├── robots.txt        # Configuration robots
│   ├── sitemap.xml       # Plan du site
│   └── .htaccess         # Configuration Apache
├── src/
│   ├── components/
│   │   ├── NavBarComponent.js      # Barre de navigation
│   │   └── FooterComponent.js      # Pied de page
│   ├── pages/
│   │   ├── Dashboard.js            # Page d'accueil et recherche
│   │   ├── DetailVoyage.js         # Détails et réservation
│   │   ├── Conditions.js           # Conditions générales
│   │   ├── Aide.js                 # Page d'aide
│   │   └── Contact.js              # Contact
│   ├── contexts/
│   │   └── AuthContext.js          # Contexte d'authentification
│   ├── firebase.js                 # Configuration Firebase
│   ├── App.js                      # Composant principal
│   └── index.js                    # Point d'entrée
├── SEO-GUIDE.md          # Guide SEO complet
├── package.json          # Dépendances npm
└── README.md            # Documentation (ce fichier)
```

## 🚀 Installation et Configuration

### Prérequis
- Node.js (version 14.x ou supérieure)
- npm ou yarn
- Compte Firebase

### 1. Cloner le Projet
```bash
git clone https://github.com/votre-repo/nat-voyages-client.git
cd nat-voyages-client
```

### 2. Installer les Dépendances
```bash
npm install
```

### 3. Configuration Firebase
Créez un fichier `src/firebase.js` avec votre configuration Firebase :

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_AUTH_DOMAIN",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_STORAGE_BUCKET",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 4. Lancer l'Application

#### Mode Développement
```bash
npm start
```
L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

#### Build de Production
```bash
npm run build
```
Les fichiers optimisés seront générés dans le dossier `build/`

## 📊 Structure de la Base de Données (Firestore)

### Collection `voyages`
```javascript
{
  libelle_bateau: string,
  date_voyage: timestamp,
  status: string, // "Actif" ou "Inactif"
  agence_name: string,
  agence_reference: reference,
  place_disponible_eco: number,
  place_disponible_vip: number,
  place_prise_eco: number,
  place_prise_vip: number,
  trajet: [
    {
      LieuDeDepartLibelle: string,
      LieuDArriverLibelle: string,
      tarif_adulte: number,
      tarif_adulte_vip: number,
      tarif_enfant: number,
      tarif_enfant_vip: number,
      tarif_bb: number,
      tarif_bb_vip: number,
      tva: number,
      oprag: number,
      promotion: number
    }
  ]
}
```

### Collection `lieux`
```javascript
{
  libelle_lieux: string,
  statut: string // "active" ou "inactive"
}
```

### Collection `ventes`
```javascript
{
  numero_billet: string,
  noms: string,
  prenoms: string,
  tel: string,
  adresse: string,
  numero: string, // numéro de pièce
  type_piece: string,
  date_voyage: timestamp,
  type_passager: string, // "Adulte", "Enfant", "Bébé"
  classe: string, // "Economie" ou "VIP"
  montant_ttc: number,
  status: string, // "Payer", etc.
  type_voyage: string, // "aller_simple" ou "aller_retour"
  sens_voyage: string, // "aller" ou "retour"
  trajet: array,
  voyage_reference: reference,
  client_reference: reference,
  create_time: timestamp
}
```

## 🔧 Configuration SEO

Le projet est entièrement optimisé pour le référencement naturel. Consultez le [Guide SEO](SEO-GUIDE.md) pour plus de détails.

### Points Clés SEO
- ✅ Meta tags optimisés (title, description, keywords)
- ✅ Open Graph pour réseaux sociaux
- ✅ Structured Data (Schema.org)
- ✅ Sitemap.xml et robots.txt
- ✅ URLs canoniques
- ✅ Performance optimisée

### Mots-clés Ciblés
- Transport maritime Gabon
- Bateau Gabon
- Réservation billet bateau
- Libreville Port-Gentil
- Nat Voyages

## 📱 Progressive Web App (PWA)

L'application est configurée comme PWA et peut être installée sur les appareils mobiles :
- ✅ Manifest.json configuré
- ✅ Service Worker (optionnel)
- ✅ Mode offline (à implémenter)
- ✅ Icônes adaptatives

## 🔒 Sécurité

### Mesures de Sécurité Implémentées
- 🔐 Authentification Firebase
- ✅ Règles de sécurité Firestore
- ✅ Validation des données côté client
- ✅ Headers de sécurité (.htaccess)
- ✅ Protection XSS et CSRF
- ✅ HTTPS forcé

## 🎨 Design et UX

- **Responsive Design** : Compatible mobile, tablette, desktop
- **Navigation Fixe** : Navbar fixe lors du scroll
- **Feedback Visuel** : Messages de confirmation et d'erreur
- **Loading States** : Indicateurs de chargement
- **Modal Optimisés** : Interface de réservation claire

## 📈 Améliorations Futures

### Fonctionnalités Prévues
- [ ] Système de paiement en ligne (Mobile Money, Carte bancaire)
- [ ] Notifications par email/SMS
- [ ] Historique des réservations pour les clients
- [ ] Espace client avec profil
- [ ] Système de fidélité et promotions
- [ ] Chat en direct avec support client
- [ ] Mode hors ligne avec synchronisation
- [ ] Application mobile native (React Native)
- [ ] Suivi GPS des bateaux en temps réel
- [ ] Système d'avis et notations

### Optimisations Techniques
- [ ] Lazy loading des images
- [ ] Code splitting
- [ ] Service Worker pour cache
- [ ] Compression d'images automatique
- [ ] Tests unitaires et d'intégration
- [ ] CI/CD avec GitHub Actions

## 🐛 Débogage et Support

### Problèmes Courants

**Problème : Les dates s'affichent comme "Timestamp(...)"**
- Solution : Vérifier que `date_voyage` est converti en Date JavaScript

**Problème : Les tarifs sont enregistrés comme chaînes vides**
- Solution : La validation des champs numériques est maintenant implémentée

**Problème : Navbar trop haute**
- Solution : Ajuster `minHeight` dans NavBarComponent.js

## 📞 Contact et Support

- **Email** : contact@natvoyages.ga
- **Téléphone** : +241-XX-XX-XX-XX
- **Site Web** : https://www.natvoyages.ga

## 👥 Contributeurs

- **Développeur Principal** : [Votre Nom]
- **Design** : [Nom Designer]
- **Product Owner** : [Nom PO]

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- React Team pour le framework
- Firebase pour l'infrastructure backend
- Bootstrap pour le framework CSS
- La communauté open source

---

**Version** : 1.0.0
**Dernière mise à jour** : 22 Janvier 2025

**Made with ❤️ for Gabon** 🇬🇦
