// src/pages/LoginPage.js
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const handleNavigationLogin = () => {
    navigate("/login");
  };

  return (
    <>
      <div className="nk-app-root nk-body bg-white npc-default pg-auth">
        {/* main @s */}
        <div className="nk-main ">
          {/* wrap @s */}
          <div className="nk-wrap nk-wrap-nosidebar">
            {/* content @s */}

            <form onSubmit={handleSignup}>
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
                        <h4 className="nk-block-title">S'inscrire</h4>
                        <div className="nk-block-des">
                          <p>S'inscrire pour accéder à votre compte.</p>
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="form-label-group">
                        <label className="form-label" htmlFor="default-01">
                          Nom
                        </label>
                      </div>
                      <div className="form-control-wrap">
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="default-01"
                          placeholder="Entrez votre nom d'utilisateur"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="form-label-group">
                        <label className="form-label" htmlFor="default-01">
                          Prénom
                        </label>
                      </div>
                      <div className="form-control-wrap">
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="default-01"
                          placeholder="Entrez votre prénom"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="form-label-group">
                        <label className="form-label" htmlFor="default-01">
                          Email
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
                        <label className="form-label" htmlFor="default-01">
                          Téléphone
                        </label>
                      </div>
                      <div className="form-control-wrap">
                        <input
                          type="phone"
                          className="form-control form-control-lg"
                          id="default-01"
                          placeholder="Entrez votre numéro de téléphone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="form-label-group">
                        <label className="form-label" htmlFor="password">
                          Mot de passe
                        </label>
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
                      <div className="form-group">
                        <div className="form-label-group">
                          <label
                            className="form-label"
                            htmlFor="confirm-password"
                          >
                            Confirmation du mot de passe
                          </label>
                        </div>
                        <div className="form-control-wrap">
                          <a
                            href="#"
                            className="form-icon form-icon-right passcode-switch lg"
                            data-target="confirm-password"
                          >
                            <em className="passcode-icon icon-show icon ni ni-eye" />
                            <em className="passcode-icon icon-hide icon ni ni-eye-off" />
                          </a>
                          <input
                            type="password"
                            className="form-control form-control-lg"
                            id="confirm-password"
                            placeholder="Confirmer votre mot de passe"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-note text-center pt-4">
                        En vous inscrivant, vous acceptez nos
                        <a href="#"> conditions d'utilisation</a> et notre
                        <a href="#"> politique de confidentialité</a>.
                      </div>
                    </div>
                    <div className="form-group">
                      <button className="btn btn-lg btn-primary btn-block">
                        S'inscrire
                      </button>
                    </div>
                  </div>
                  <div className="form-note-s2 text-center pt-4">
                    {" "}
                    Déjà sur notre plateform ?{" "}
                    <a href="#" onClick={handleNavigationLogin}>
                      Se connecter
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
