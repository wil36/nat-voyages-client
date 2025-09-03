// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import NavBarComponent from "../components/NavBarComponent";
import FooterComponent from "../components/FooterComponent";

export default function Dashboard() {
  const { user } = useAuth();
  const [voyages, setVoyages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [lieux, setLieux] = useState([]);
  const [filters, setFilters] = useState({
    depart: "",
    arrivee: "",
    date: "",
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [originalVoyages, setOriginalVoyages] = useState([]);

  // Update your fetchVoyages function to save the original voyages
  const fetchVoyages = async () => {
    if (!user) return;

    try {
      const q = query(collection(db, "voyages"));
      const querySnapshot = await getDocs(q);
      const result = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setVoyages(result);
      setOriginalVoyages(result); // Save the original list
      setLoading(false);
    } catch (error) {
      console.error("Error fetching voyages: ", error);
      setLoading(false);
    }
  };

  // Add this reset function
  const resetVoyages = () => {
    setVoyages(originalVoyages);
    // fetchVoyages();
    setHasSearched(false);
    // Reset the form
    setFilters({
      depart: "",
      arrivee: "",
      date: "",
    });
  };

  useEffect(() => {
    const fetchVoyages = async () => {
      if (!user) return;

      try {
        // ✅ On utilise la collection 'users' maintenant
        // const clientRef = doc(db, "users", user.uid);

        const q = query(
          collection(db, "voyages")
          // .where("date_voyage", "<=", new Date())
          // .orderBy("date_voyage", "asc")
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
            montant: data.montant_ttc || 0,
            agence_name: data.agence_name || "",
            agence_reference: data.agence_reference || "",
            chauffeur: data.chauffeur || "",
            chauffeur_reference: data.chauffeur_reference || "",
            hotesse1: data.hotesse1 || "",
            hotesse1_reference: data.hotesse1_reference || "",
            hotesse2: data.hotesse2 || "",
            hotesse2_reference: data.hotesse2_reference || "",
            mecanicien: data.mecanicien || "",
            mecanicien_reference: data.mecanicien_reference || "",
            place_disponible_eco: data.place_disponible_eco || 0,
            place_disponible_vip: data.place_disponible_vip || 0,
            place_prise_eco: data.place_prise_eco || 0,
            place_prise_vip: data.place_prise_vip || 0,
            trajet: data.trajet || [],
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

  const handleSearch = async (e) => {
    e.preventDefault();
    console.log(doc(db, "lieux", filters.depart));
    console.log(doc(db, "lieux", filters.arrivee));
    try {
      // Convert date to Firestore timestamp if needed
      const dateFilter = filters.date ? new Date(filters.date) : null;

      // Build the query
      let q = query(collection(db, "voyages"));

      // Add filters
      // const conditions = [];
      // if (filters.depart) {
      //   conditions.push(
      //     where("lieu_depart", "==", doc(db, "lieux", filters.depart))
      //   );
      // }
      // if (filters.arrivee) {
      //   conditions.push(
      //     where("lieu_arrivee", "==", doc(db, "lieux", filters.arrivee))
      //   );
      // }
      // // if (dateFilter) {
      // //   conditions.push(where("date_voyage", ">=", dateFilter));
      // // }

      // // Apply all conditions
      // if (conditions.length > 0) {
      //   q = query(q, ...conditions);
      // }

      const querySnapshot = await getDocs(q);
      const result = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setVoyages(result);
      setHasSearched(true);
      // Close the modal
      const modal = document.getElementById("modalForm");
      const modalClose = new bootstrap.Modal(modal);
      modalClose.hide();
    } catch (error) {
      console.error("Error searching voyages: ", error);
    }
  };

  useEffect(() => {
    const fetchLieux = async () => {
      try {
        const q = query(collection(db, "lieux"));
        const querySnapshot = await getDocs(q);
        const lieuxList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLieux(lieuxList);
      } catch (error) {
        console.error("Error fetching locations: ", error);
      }
    };

    fetchLieux();
  }, []);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-grow text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );

  const handleRedirect = async (id) => {
    try {
      navigate(`/detail-voyage/${id}`);
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
                        <div>
                          <div className="dropdown">
                            <a
                              href="#"
                              className="btn btn-icon btn-lg btn-outline-primary m-1dropdown-toggle"
                              type="button"
                              data-toggle="modal"
                              data-target="#modalForm"
                            >
                              <em className="icon ni ni-search"></em>
                            </a>
                            {hasSearched && (
                              <button
                                type="button"
                                className="ml-1 btn btn-icon btn-lg btn-outline-primary"
                                onClick={resetVoyages}
                              >
                                <em className="icon ni ni-reload"></em>{" "}
                              </button>
                            )}

                            {/* <div className="filter-wg dropdown-menu dropdown-menu-xl dropdown-menu-right">
                              <div className="dropdown-head">
                                <span className="sub-title dropdown-title">
                                  Advance Filter
                                </span>
                                <div className="dropdown">
                                  <a href="#" className="link link-light">
                                    <em className="icon ni ni-more-h" />
                                  </a>
                                </div>
                              </div>
                              <div className="dropdown-body dropdown-body-rg">
                                <div className="row gx-6 gy-4">
                                  <div className="col-6">
                                    <div className="form-group">
                                      <label className="overline-title overline-title-alt">
                                        Type
                                      </label>
                                      <select className="form-select">
                                        <option value="any">Any Type</option>
                                        <option value="deposit">Deposit</option>
                                        <option value="buy">Buy Coin</option>
                                        <option value="sell">Sell Coin</option>
                                        <option value="transfer">
                                          Transfer
                                        </option>
                                        <option value="withdraw">
                                          Withdraw
                                        </option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="form-group">
                                      <label className="overline-title overline-title-alt">
                                        Status
                                      </label>
                                      <select className="form-select">
                                        <option value="any">Any Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="cancel">Cancel</option>
                                        <option value="process">Process</option>
                                        <option value="completed">
                                          Completed
                                        </option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="form-group">
                                      <label className="overline-title overline-title-alt">
                                        Pay Currency
                                      </label>
                                      <select className="form-select">
                                        <option value="any">Any Coin</option>
                                        <option value="bitcoin">Bitcoin</option>
                                        <option value="ethereum">
                                          Ethereum
                                        </option>
                                        <option value="litecoin">
                                          Litecoin
                                        </option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="form-group">
                                      <label className="overline-title overline-title-alt">
                                        Method
                                      </label>
                                      <select className="form-select">
                                        <option value="any">Any Method</option>
                                        <option value="paypal">PayPal</option>
                                        <option value="bank">Bank</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="form-group">
                                      <div className="custom-control custom-control-sm custom-checkbox">
                                        <input
                                          type="checkbox"
                                          className="custom-control-input"
                                          id="includeDel"
                                        />
                                        <label
                                          className="custom-control-label"
                                          htmlFor="includeDel"
                                        >
                                          {" "}
                                          Including Deleted
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12">
                                    <div className="form-group">
                                      <button
                                        type="button"
                                        className="btn btn-secondary"
                                      >
                                        Filter
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="dropdown-foot between">
                                <a className="clickable" href="#">
                                  Reset Filter
                                </a>
                                <a href="#savedFilter" data-toggle="modal">
                                  Save Filter
                                </a>
                              </div>
                            </div> */}
                            <div className="modal fade" id="modalForm">
                              <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                  <div className="modal-header">
                                    <h5 className="modal-title">
                                      Recherche de voyage
                                    </h5>
                                    <a
                                      href="#"
                                      className="close"
                                      data-dismiss="modal"
                                      aria-label="Close"
                                    >
                                      <em className="icon ni ni-cross" />
                                    </a>
                                  </div>
                                  <div className="modal-body">
                                    <form
                                      action="#"
                                      className="form-validate is-alter"
                                      onSubmit={handleSearch}
                                    >
                                      <div className="form-group">
                                        <label
                                          className="form-label"
                                          htmlFor="date"
                                        >
                                          Date du voyage
                                        </label>
                                        <div className="form-control-wrap">
                                          <input
                                            type="date"
                                            className="form-control"
                                            id="date"
                                            required=""
                                          />
                                        </div>
                                      </div>
                                      <div className="form-group">
                                        <label
                                          className="form-label"
                                          htmlFor="depart"
                                        >
                                          Lieu de départ
                                        </label>
                                        <div className="form-control-wrap">
                                          <select
                                            className="form-control form-select"
                                            id="depart"
                                            value={filters.depart}
                                            data-search=""
                                            onChange={(e) =>
                                              setFilters({
                                                ...filters,
                                                depart: e.target.value,
                                              })
                                            }
                                            required
                                          >
                                            <option value="">
                                              Sélectionner un lieu de départ
                                            </option>
                                            {lieux.map((lieu) => (
                                              <option
                                                key={`depart-${lieu.id}`}
                                                value={lieu.id}
                                              >
                                                {lieu.libelle_lieux}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>
                                      <div className="form-group">
                                        <label
                                          className="form-label"
                                          htmlFor="destination"
                                        >
                                          Lieu d'arrivée
                                        </label>
                                        <div className="form-control-wrap">
                                          <select
                                            className="form-control form-select"
                                            id="destination"
                                            value={filters.arrivee}
                                            onChange={(e) =>
                                              setFilters({
                                                ...filters,
                                                arrivee: e.target.value,
                                              })
                                            }
                                            required
                                          >
                                            <option value="">
                                              Sélectionner un lieu d'arrivée
                                            </option>
                                            {lieux.map((lieu) => (
                                              <option
                                                key={`arrivee-${lieu.id}`}
                                                value={lieu.id}
                                              >
                                                {lieu.libelle_lieux}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>
                                      <div className="form-group">
                                        <button
                                          type="submit"
                                          className="btn btn-lg btn-primary"
                                        >
                                          Rechercher
                                        </button>
                                      </div>
                                    </form>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* .filter-wg */}
                          </div>
                          {/* .dropdown */}
                        </div>
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
                                      {v.agence_name}
                                    </h4>
                                    <p className="sub-text">
                                      {v.date_voyage} - {v.libelle_bateau}
                                    </p>
                                  </div>
                                  <div className="card-text">
                                    <div className="row">
                                      <div className="col-4">
                                        <span className="h4 fw-500"></span>
                                        <span className="sub-text">
                                          {v.trajet[0].LieuDeDepartLibelle}
                                        </span>
                                      </div>
                                      <div className="col-4">
                                        <em className="icon ni ni-arrow-right"></em>
                                      </div>
                                      <div className="col-4">
                                        <span className="h4 fw-500"></span>
                                        <span className="sub-text">
                                          {
                                            v.trajet[v.trajet.length - 1]
                                              .LieuDArriverLibelle
                                          }
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="pricing-body">
                                  <ul className="pricing-features">
                                    <li>
                                      <span className="w-50">
                                        Place disponible <br /> eco
                                      </span>{" "}
                                      -{" "}
                                      <span className="ml-auto">
                                        {v.place_disponible_eco -
                                          v.place_prise_eco}
                                      </span>
                                    </li>
                                    <li>
                                      <span className="w-50">
                                        Place disponible <br /> vip
                                      </span>{" "}
                                      -
                                      <span className="ml-auto">
                                        {v.place_disponible_vip -
                                          v.place_prise_vip}
                                      </span>
                                    </li>
                                    {/* <li>
                                      <span className="w-50">
                                        Deposit Return
                                      </span>{" "}
                                      - <span className="ml-auto">Yes</span>
                                    </li>
                                    <li>
                                      <span className="w-50">Total Return</span>{" "}
                                      - <span className="ml-auto">125%</span>
                                    </li> */}
                                  </ul>
                                  <div className="pricing-action">
                                    <button
                                      className="btn btn-outline-light"
                                      onClick={() => handleRedirect(v.id)}
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
            <FooterComponent />
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
