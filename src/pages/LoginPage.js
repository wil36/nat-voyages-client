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
      navigate("/");
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

  const handleNavigationSignup = () => {
    navigate("/signup");
  };

  return (
    <>
      <div className="nk-app-root nk-body bg-white npc-default pg-auth">
        {/* main @s */}
        <div className="nk-main ">
          {/* wrap @s */}
          <div className="nk-wrap nk-wrap-nosidebar">
            {/* content @s */}

            <form onSubmit={handleLogin}>
              <div className="nk-content ">
                <div className="nk-block nk-block-middle nk-auth-body  wide-xs">
                  <div className="brand-logo pb-4 text-center">
                    <a href="html/index.html" className="logo-link">
                      <img
                        className="logo-light logo-img logo-img-lg"
                        src="/src/assets/images/logo.png"
                        srcSet="/src/assets/images/logo2x.png 2x"
                        alt="logo"
                      />
                      <img
                        className="logo-dark logo-img logo-img-lg"
                        src="/src/assets/images/logo-dark.png"
                        srcSet="/src/assets/images/logo-dark2x.png 2x"
                        alt="logo-dark"
                      />
                    </a>
                  </div>
                  <div className="card card-inner card-inner-lg">
                    <div className="nk-block-head">
                      <div className="nk-block-head-content">
                        <h4 className="nk-block-title">Connexion</h4>
                        <div className="nk-block-des">
                          <p>Se connecter pour accéder à votre compte.</p>
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="form-label-group">
                        <label className="form-label" htmlFor="default-01">
                          Email ou Nom d'utilisateur
                        </label>
                      </div>
                      <div className="form-control-wrap">
                        <input
                          type="email"
                          className="form-control form-control-lg"
                          id="default-01"
                          placeholder="Entrez votre email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="form-label-group">
                        <label className="form-label" htmlFor="password">
                          Mot de passe
                        </label>
                        <a
                          className="link link-primary link-sm"
                          href="html/pages/auths/auth-reset-v2.html"
                        >
                          Mot de passe oublié?
                        </a>
                      </div>
                      <div className="form-control-wrap">
                        <a
                          href="#"
                          className="form-icon form-icon-right passcode-switch lg"
                          data-target="password"
                        >
                          <em className="passcode-icon icon-show icon ni ni-eye" />
                          <em className="passcode-icon icon-hide icon ni ni-eye-off" />
                        </a>
                        <input
                          type="password"
                          className="form-control form-control-lg"
                          id="password"
                          placeholder="Entrez votre mot de passe"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <button className="btn btn-lg btn-primary btn-block">
                        Se connecter
                      </button>
                    </div>
                  </div>
                  <div className="form-note-s2 text-center pt-4">
                    {" "}
                    Nouveau sur notre plateform ?{" "}
                    <a href="#" onClick={handleNavigationSignup}>
                      Créer un compte
                    </a>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
        {/* wrap @e */}
      </div>
      {/* content @e */}
    </>
  );
}
