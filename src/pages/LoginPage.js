// src/pages/LoginPage.js
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      if (err.code === "auth/invalid-credential") {
        alert("Échec de connexion : utilisateur non trouvé");
      } else if (err.code === "auth/wrong-password") {
        alert("Échec de connexion : mot de passe incorrect");
      } else if (err.code === "auth/invalid-email") {
        alert("Échec de connexion : adresse email invalide");
      } else {
        alert(`Échec de connexion : ${err.message}`);
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2>Connexion Client</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label>Mot de passe</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn btn-primary">Se connecter</button>
      </form>
    </div>
  );
}
