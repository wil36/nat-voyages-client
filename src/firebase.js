// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔐 Configuration Firebase - à personnaliser avec ton propre projet
const firebaseConfig = {
  apiKey: "TA_CLÉ_API",
  authDomain: "TON_DOMAINE.firebaseapp.com",
  projectId: "TON_PROJECT_ID",
  storageBucket: "TON_BUCKET.appspot.com",
  messagingSenderId: "TON_SENDER_ID",
  appId: "TON_APP_ID",
};

// ⚙️ Initialisation de l'app Firebase
const app = initializeApp(firebaseConfig);

// 🔐 Authentification
export const auth = getAuth(app);

// 🧠 Base de données Firestore
export const db = getFirestore(app);

// 📦 Stockage de fichiers (PDF, images...)
export const storage = getStorage(app);

// 🧪 Optionnel : méthode utilitaire pour écouter l'utilisateur connecté
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
