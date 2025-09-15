// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔐 Configuration Firebase - utilise les variables d'environnement
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
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
