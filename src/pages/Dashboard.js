// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import NavBarComponent from "../components/NavBarComponent";

export default function Dashboard() {
  const { user } = useAuth();
  const [voyages, setVoyages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVoyages = async () => {
      if (!user) return;

      try {
        // ✅ On utilise la collection 'users' maintenant
        // const clientRef = doc(db, "users", user.uid);

        const q = query(
          collection(db, "ventes")
          // where("date_voyage", "<=", new Date())
        );

        const querySnapshot = await getDocs(q);
        const result = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          result.push({
            id: doc.id,
            libelle_bateau: data.libelle_bateau || "Inconnu",
            bateau_reference: data.bateau_reference || "",
            date_voyage: data.date_voyage?.toDate().toLocaleDateString() || "",
            statut: data.status,
            montant: data.montant_ttc,
          });
        });

        setVoyages(result);
        setLoading(false);
      } catch (err) {
        console.error("Erreur chargement voyages :", err);
      }
    };

    fetchVoyages();
  }, [user]);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-grow text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );

  const handleRedirect = async (e) => {
    e.preventDefault();
    try {
      navigate("/detail-voyage/:id");
      // navigate("/dashboard");
    } catch (err) {}
  };

  return (
    <div className=" nk-body bg-lighter npc-default">
      <div className="nk-app-root ">
        {/* main @s */}
        <div className="nk-main ">
          {/* wrap @s */}
          <div className="nk-wrap ">
            <NavBarComponent />
            {/* content @s */}
            <div className="nk-content ">
              <div className="container">
                <div className="nk-content-inner">
                  <div className="nk-content-body">
                    <div className="nk-block-head nk-block-head-sm">
                      <div className="nk-block-between g-3">
                        <div className="nk-block-head-content">
                          <h3 className="nk-block-title page-title">
                            Voyage Disponible
                          </h3>

                          <div className="nk-block-des text-soft">
                            <p>
                              Recherchez votre voyage et trouvez le voyage
                              parfait pour vous.
                            </p>
                          </div>
                        </div>
                        <a
                          href="#"
                          className="btn btn-icon btn-lg btn-outline-primary m-1"
                        >
                          <em className="icon ni ni-search"></em>
                        </a>
                      </div>
                    </div>
                    {/* .nk-block-head */}
                    <div className="nk-block">
                      <div className="row g-gs">
                        {voyages.length === 0 ? (
                          <div className="d-flex justify-content-center">
                            <p className="fs-4">Aucun voyage trouvé.</p>
                          </div>
                        ) : (
                          voyages.map((v) => (
                            <div className="col-md-6 col-xxl-3" key={v.id}>
                              <div className="card card-bordered pricing">
                                <div className="pricing-head">
                                  <div className="pricing-title">
                                    <h4 className="card-title title">
                                      Starter
                                    </h4>
                                    <p className="sub-text">
                                      Recherchez votre voyage et trouvez le
                                      voyage parfait pour vous.
                                    </p>
                                  </div>
                                  <div className="card-text">
                                    <div className="row">
                                      <div className="col-6">
                                        <span className="h4 fw-500">1.67%</span>
                                        <span className="sub-text">
                                          Daily Interest
                                        </span>
                                      </div>
                                      <div className="col-6">
                                        <span className="h4 fw-500">30</span>
                                        <span className="sub-text">
                                          Term Days
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="pricing-body">
                                  <ul className="pricing-features">
                                    <li>
                                      <span className="w-50">Min Deposit</span>{" "}
                                      - <span className="ml-auto">$250</span>
                                    </li>
                                    <li>
                                      <span className="w-50">Max Deposit</span>{" "}
                                      - <span className="ml-auto">$1,999</span>
                                    </li>
                                    <li>
                                      <span className="w-50">
                                        Deposit Return
                                      </span>{" "}
                                      - <span className="ml-auto">Yes</span>
                                    </li>
                                    <li>
                                      <span className="w-50">Total Return</span>{" "}
                                      - <span className="ml-auto">125%</span>
                                    </li>
                                  </ul>
                                  <div className="pricing-action">
                                    <button
                                      className="btn btn-outline-light"
                                      onClick={handleRedirect}
                                    >
                                      Voir le voyage
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    {/* .nk-block */}
                  </div>
                </div>
              </div>
            </div>
            {/* content @e */}
            {/* footer @s */}
            <div className="nk-footer">
              <div className="container-fluid">
                <div className="nk-footer-wrap">
                  <div className="nk-footer-copyright">
                    {" "}
                    © 2020 DashLite. Template by{" "}
                    <a href="https://softnio.com" target="_blank">
                      Softnio
                    </a>
                  </div>
                  <div className="nk-footer-links">
                    <ul className="nav nav-sm">
                      <li className="nav-item">
                        <a className="nav-link" href="#">
                          Terms
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#">
                          Privacy
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#">
                          Help
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {/* footer @e */}
          </div>
          {/* wrap @e */}
        </div>
        {/* main @e */}
      </div>
      {/* app-root @e */}
      {/* JavaScript */}
    </div>
  );
}
