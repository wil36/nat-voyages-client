# Nat Voyage - Plateforme de Réservation de Transport Maritime

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-11.x-FFCA28?logo=firebase)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Description

**Nat Voyage** est une plateforme web de réservation de billets de transport maritime au Gabon. Elle permet de rechercher des voyages, réserver des billets pour plusieurs passagers (adultes, enfants, bébés), payer par Mobile Money et recevoir ses billets en PDF avec QR Code.

### Objectif

Digitaliser le processus de réservation de billets de transport maritime entre les principales villes du Gabon (Libreville, Port-Gentil, Mitzic, etc.).

---

## Fonctionnalités

### Réservation
- Recherche de voyages par ville de départ, destination et date
- Réservation multi-passagers en une seule transaction
- Aller simple et aller-retour avec sélection automatique des voyages de retour
- Classes de voyage : Économique et VIP
- Types de passagers avec tarifs différenciés : Adulte, Enfant, Bébé
- Validation du montant minimum (500 FCFA) avant confirmation

### Paiement
- Intégration Mobile Money via API serveur
- Détection automatique de l'opérateur depuis le numéro de téléphone
- Suivi du statut de paiement en temps réel (Firestore listener)
- Gestion des états : En attente, Payé, Échoué

### Billets
- Génération automatique de billets PDF (jsPDF + jspdf-autotable)
- QR Code unique par passager intégré au PDF
- Numérotation de billet unique auto-générée
- Téléchargement automatique après paiement confirmé

### Sécurité
- Authentification Firebase
- Rate limiting : 3 tentatives max / 10 secondes, blocage 10 min en cas d'abus
- Validation des données côté client
- Headers de sécurité via `.htaccess`
- HTTPS forcé

---

## Technologies

### Frontend
| Technologie | Version | Usage |
|---|---|---|
| React | 19.x | Framework UI |
| React Router | 7.x | Navigation |
| Bootstrap | 5.x | Design responsive |
| jsPDF + autotable | 3.x / 5.x | Génération PDF |
| qrcode | 1.5.x | Génération QR Code |
| datatables.net-bs5 | 1.x | Tableaux de données |

### Backend & Infrastructure
| Technologie | Usage |
|---|---|
| Firebase Authentication | Gestion des utilisateurs |
| Cloud Firestore | Base de données temps réel |
| Firebase Storage | Stockage fichiers |
| API REST (serveur externe) | Initiation des paiements Mobile Money |

---

## Structure du Projet

```
nat-voyages-client/
├── public/
│   ├── assets/
│   │   ├── images/           # Images et logos
│   │   ├── js/               # Scripts JavaScript
│   │   └── css/              # Styles CSS
│   ├── index.html            # HTML principal avec balises SEO
│   ├── manifest.json         # Configuration PWA
│   ├── robots.txt
│   ├── sitemap.xml
│   └── .htaccess             # Configuration Apache (HTTPS, headers sécurité)
├── src/
│   ├── components/
│   │   ├── NavBarComponent.js
│   │   └── FooterComponent.js
│   ├── contexts/
│   │   └── AuthContext.js    # Contexte auth + hook useAuth()
│   ├── hooks/
│   │   └── useRateLimit.js   # Hook anti-abus (3 tentatives / 10s)
│   ├── pages/
│   │   ├── Dashboard.js      # Accueil et recherche de voyages
│   │   ├── DetailVoyage.js   # Détail voyage, réservation, paiement, PDF
│   │   ├── Conditions.js     # Conditions générales
│   │   ├── Aide.js           # FAQ / aide
│   │   └── Contact.js        # Contact
│   ├── utils/
│   │   └── transactionHelpers.js  # Utilitaires pour les transactions
│   ├── firebase.js           # Configuration et exports Firebase
│   ├── App.js                # Composant racine et routes
│   └── index.js              # Point d'entrée
├── package.json
└── README.md
```

---

## Installation

### Prérequis

- Node.js 14.x ou supérieur
- npm
- Compte Firebase avec Firestore activé

### 1. Cloner le projet

```bash
git clone https://github.com/votre-repo/nat-voyages-client.git
cd nat-voyages-client
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Variables d'environnement

Créez un fichier `.env` à la racine :

```env
# Firebase
REACT_APP_API_KEY=...
REACT_APP_AUTH_DOMAIN=...
REACT_APP_PROJECT_ID=...
REACT_APP_STORAGE_BUCKET=...
REACT_APP_MESSAGING_SENDER_ID=...
REACT_APP_APP_ID=...
REACT_APP_MEASUREMENT_ID=...

# API paiement
REACT_APP_API_URL_BASE=https://votre-api.com
REACT_APP_FRONTEND_API_KEY=...

# Référentiels statiques
REACT_APP_STATIC_ID_AGENT_NAT_VOYAGE=...
REACT_APP_STATIC_ID_AGENCE_NAT_VOYAGE=...

# Règles métier
REACT_APP_MONTANT_MINIMUM_DE_TRANSACTION=500
```

### 4. Lancer en développement

```bash
npm start
```

Application accessible sur [http://localhost:3000](http://localhost:3000)

### 5. Build de production

```bash
npm run build
```

Les fichiers optimisés sont générés dans `build/`.

---

## Modèle de Données Firestore

### Collection `voyages`

```javascript
{
  libelle_bateau: string,
  date_voyage: timestamp,
  status: string,              // "Actif" | "Inactif"
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

### Collection `ventes`

```javascript
{
  numero_billet: string,
  id_vente: string,
  noms: string,
  prenoms: string,
  tel: string,
  adresse: string,
  numero: string,              // numéro de pièce d'identité
  type_piece: string,
  date_voyage: timestamp,
  type_passager: string,       // "Adulte" | "Enfant" | "Bébé"
  classe: string,              // "Economie" | "VIP"
  montant_ttc: number,
  status: string,              // "Payer" | "En attente" | "Échouer"
  type_voyage: string,         // "aller_simple" | "aller_retour"
  sens_voyage: string,         // "aller" | "retour"
  trajet: array,
  reservationId: string,
  paymentPending: boolean,
  paymentInitiated: boolean,
  paymentInitiatedAt: timestamp,
  paymentConfirmedAt: timestamp,
  voyage_reference: reference,
  client_reference: reference,
  create_time: timestamp
}
```

### Collection `lieux`

```javascript
{
  libelle_lieux: string,
  statut: string               // "active" | "inactive"
}
```

---

## SEO

- Meta tags optimisés (title, description, keywords)
- Open Graph pour réseaux sociaux
- Données structurées Schema.org (JSON-LD)
- Sitemap.xml et robots.txt
- URLs canoniques

---

## Revue de code & Problèmes connus

### ✅ Corrections appliquées

| # | Description |
|---|---|
| 1 | `genererFacturePDF` : variable `numeroReference` non définie → remplacée par `donneesVente.numero_billet \|\| venteId` |
| 3 | Env var `MONTANT_MINIMUM_DE_TRANSACTION` → `REACT_APP_MONTANT_MINIMUM_DE_TRANSACTION` |
| 5 | Double `;;` en fin de `handleTicketSubmit` supprimé |
| 8 | Fuite mémoire listener `onSnapshot` → corrigé via `useRef` + cleanup `useEffect` |
| 9 | `obtenirTarifTrajet` dupliquée → extraite hors du composant |
| 10 | Nettoyage données `vente` dupliqué → extrait en `nettoyerVente()` |
| 11 | `useEffect` dépendances instables → stabilisé via sérialisation du tableau en string |
| 12 | `recupererVoyagesRetour()` appelée trop tôt → appel redondant supprimé, le `useEffect` prend le relais |
| 13 | `.map()` utilisé pour un effet de bord (`console.log`) → supprimé |
| 14 | `alert()` natif → remplacé par `Swal.fire()` uniformément |
| 16 | Commentaire `TODO` en production → supprimé |
| — | `genererFacturePDF` / `genererFactureMultiPassagers` : date affichée comme `N/A` ou Timestamp brut → conversion Firestore Timestamp corrigée |
| — | `validateForm` : crash `Cannot read properties of undefined (reading 'trim')` → guards `\|\| ""` ajoutés sur tous les champs |
| — | Réinitialisation du formulaire après paiement : champ `numero_paiement_mobile` manquant → ajouté |

### 🟠 Problèmes à traiter (backend / refactoring majeur)

| # | Description |
|---|---|
| 6 | Validation du montant minimum uniquement côté client — à dupliquer côté serveur |
| 7 | `verifierDisponibilite()` fait un `getDoc` hors transaction — redondant avec la transaction Firestore |
| 15 | Manipulation directe du DOM Bootstrap — nécessaire car le modal n'est pas un composant React contrôlé. À refactoriser si le modal est migré |

---

## Contact

- **Email** : contact@natvoyages.ga
- **Site Web** : https://www.natvoyages.ga

---

**Dernière mise à jour** : Mars 2026

**Made with ❤️ for Gabon** 🇬🇦
