// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔐 Configuration Firebase - à personnaliser avec ton propre projet
const firebaseConfig = {
  apiKey: "AIzaSyC4TbP5sHlzzPgBa04NpiaQBnMnDJxfojQ",
  authDomain: "nat-voyage-a37f0.firebaseapp.com",
  projectId: "nat-voyage-a37f0",
  storageBucket: "nat-voyage-a37f0.firebasestorage.app",
  messagingSenderId: "914678441346",
  appId: "1:914678441346:web:bc1368b92c5e96fad4db9b",
  measurementId: "G-7VH2TH08WR",
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
