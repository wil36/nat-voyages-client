// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  orderBy,
} from "firebase/firestore";
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
  const [voyagesDuJour, setVoyagesDuJour] = useState([]);
  const [autresVoyages, setAutresVoyages] = useState([]);
  const [dateReference, setDateReference] = useState(null);

  // Fonction pour séparer les voyages en deux blocs
  const separerVoyages = (
    voyagesList,
    dateRecherche = null,
    isSearchResult = false
  ) => {
    if (isSearchResult && dateRecherche) {
      // Mode recherche : afficher les résultats dans le premier bloc
      const voyagesRecherche = voyagesList;

      // Trouver les autres voyages avec les mêmes lieux mais dates différentes
      const autresVoyagesSimilaires = originalVoyages.filter((voyage) => {
        // Exclure les voyages déjà dans les résultats de recherche
        const dejaInclus = voyagesRecherche.some((v) => v.id === voyage.id);
        if (dejaInclus) return false;

        // Vérifier si ce voyage a les mêmes lieux de départ/arrivée
        const memesDepartArrivee = voyage.trajet?.some((etape) => {
          return (
            (!filters.depart ||
              etape.LieuDeDepartReference?.id === filters.depart) &&
            (!filters.arrivee ||
              etape.LieuDArriverReference?.id === filters.arrivee)
          );
        });

        return memesDepartArrivee;
      });

      setVoyagesDuJour(voyagesRecherche);
      setAutresVoyages(autresVoyagesSimilaires);
      setDateReference(dateRecherche);
    } else {
      // Mode normal : séparer par date (aujourd'hui vs autres)
      const today = new Date();
      const todayString = today.toLocaleDateString("fr-FR");

      const dateRef = dateRecherche || todayString;
      const duJour = voyagesList.filter(
        (voyage) => voyage.date_voyage === dateRef
      );
      const autres = voyagesList.filter(
        (voyage) => voyage.date_voyage !== dateRef
      );

      setVoyagesDuJour(duJour);
      setAutresVoyages(autres);
      setDateReference(dateRef);
    }
  };

  // Update your fetchVoyages function to save the original voyages
  const fetchVoyages = async () => {
    if (!user) return;

    try {
      const q = query(collection(db, "voyages"));
      const querySnapshot = await getDocs(q);
      const result = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        referenceDoc: doc.ref.path,
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
    separerVoyages(originalVoyages, null, false); // Séparer les voyages en deux blocs (mode normal)
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

        const today = new Date();
        // today.setHours(0, 0, 0, 0);

        console.log(today);

        const q = query(
          collection(db, "voyages"),
          where("date_voyage", ">=", today),
          where("status", "==", "Actif"),
          orderBy("date_voyage", "desc")
        );

        const querySnapshot = await getDocs(q);
        const result = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          result.push({
            id: doc.id,
            referenceDoc: doc.ref.path,
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
        setOriginalVoyages(result); // Save the original list
        separerVoyages(result, null, false); // Séparer en deux blocs (mode normal)
        setLoading(false);
      } catch (err) {
        console.error("Erreur chargement voyages :", err);
      }
    };

    fetchVoyages();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    try {
      console.log("Début de la recherche avec filtres:", filters);
      console.log("Voyages originaux:", originalVoyages.length);

      // Filter client-side using originalVoyages
      let result = originalVoyages.filter((voyage) => {
        let matchesFilter = true;

        // Date filter
        if (filters.date) {
          const searchDate = new Date(filters.date + "T00:00:00");
          const searchDateString = searchDate.toLocaleDateString("fr-FR");
          console.log("Date de recherche:", searchDateString);
          console.log("Date du voyage:", voyage.date_voyage);

          if (voyage.date_voyage !== searchDateString) {
            matchesFilter = false;
            console.log("Date non correspondante:", voyage.date_voyage);
          }
        }

        // Departure filter - check if departure location exists in trajet
        if (filters.depart && matchesFilter) {
          const hasDepart = voyage.trajet?.some((etape) => {
            return etape.LieuDeDepartReference.id === filters.depart;
          });
          if (!hasDepart) {
            matchesFilter = false;
          }
        }

        // Arrival filter - check if arrival location exists in trajet
        if (filters.arrivee && matchesFilter) {
          const hasArrivee = voyage.trajet?.some(
            (etape) => etape.LieuDArriverReference.id === filters.arrivee
          );
          if (!hasArrivee) {
            matchesFilter = false;
          }
        }

        return matchesFilter;
      });

      console.log("Résultats de la recherche:", result.length);
      setVoyages(result);
      // Passer la date de recherche si elle existe
      const dateRecherche = filters.date
        ? new Date(filters.date + "T00:00:00").toLocaleDateString("fr-FR")
        : null;
      separerVoyages(result, dateRecherche, true); // Séparer les résultats de recherche aussi
      setHasSearched(true);

      // Close the modal avec nettoyage complet
      setTimeout(() => {
        const modalElement = document.getElementById("modalForm");
        if (modalElement) {
          try {
            if (window.bootstrap) {
              const modalInstance =
                window.bootstrap.Modal.getInstance(modalElement);
              if (modalInstance) {
                modalInstance.hide();
              }
            }
          } catch (modalError) {
            console.log("Bootstrap modal error:", modalError);
          }

          // Force close et nettoyage complet
          modalElement.classList.remove("show", "fade");
          modalElement.style.display = "none";
          modalElement.setAttribute("aria-hidden", "true");
          modalElement.removeAttribute("aria-modal");

          // Nettoyer le body
          document.body.classList.remove("modal-open");
          document.body.style.overflow = "";
          document.body.style.paddingRight = "";

          // Supprimer tous les backdrops
          const backdrops = document.querySelectorAll(".modal-backdrop");
          backdrops.forEach((backdrop) => {
            backdrop.remove();
          });
        }
      }, 100);
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

  const handleRedirect = (voyage) => {
    try {
      // Clean the voyage object to remove non-serializable properties
      const cleanVoyage = {
        id: voyage.id,
        libelle_bateau: voyage.libelle_bateau,
        agence_name: voyage.agence_name,
        date_voyage: voyage.date_voyage,
        statut: voyage.statut,
        montant: voyage.montant,
        chauffeur: voyage.chauffeur,
        hotesse1: voyage.hotesse1,
        hotesse2: voyage.hotesse2,
        mecanicien: voyage.mecanicien,
        place_disponible_eco: voyage.place_disponible_eco,
        place_disponible_vip: voyage.place_disponible_vip,
        place_prise_eco: voyage.place_prise_eco,
        place_prise_vip: voyage.place_prise_vip,
        trajet: voyage.trajet
          ? voyage.trajet.map((etape) => ({
              LieuDeDepart: etape.LieuDeDepart,
              LieuDeDepartLibelle: etape.LieuDeDepartLibelle,
              LieuDArriver: etape.LieuDArriver,
              LieuDArriverLibelle: etape.LieuDArriverLibelle,
              heure_depart: etape.heure_depart,
            }))
          : [],
      };

      navigate(`/detail-voyage/${voyage.id}`, {
        state: { voyage: cleanVoyage },
      });
    } catch (err) {
      console.error("Navigation error:", err);
    }
  };

  return (
    <div className=" nk-body bg-lighter npc-default npc-landing">
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
                                            value={filters.date}
                                            onChange={(e) =>
                                              setFilters({
                                                ...filters,
                                                date: e.target.value,
                                              })
                                            }
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

                    {/* Bloc des voyages du jour */}
                    <div className="nk-block">
                      <div className="nk-block-head">
                        <h5 className="nk-block-title">
                          {(() => {
                            const today = new Date().toLocaleDateString(
                              "fr-FR"
                            );
                            if (!dateReference || dateReference === today) {
                              return "Voyages d'aujourd'hui";
                            } else {
                              return `Voyages du ${dateReference}`;
                            }
                          })()}
                        </h5>
                      </div>
                      <div className="row g-gs">
                        {voyagesDuJour.length === 0 ? (
                          <div className="col-12">
                            <div className="alert alert-info">
                              <p className="mb-0">
                                Aucun voyage pour cette journée.
                              </p>
                            </div>
                          </div>
                        ) : (
                          voyagesDuJour.map((v) => (
                            <div
                              className="col-md-6 col-xxl-3"
                              key={v.referenceDoc}
                            >
                              <div className="card card-bordered pricing">
                                <div className="pricing-head">
                                  <div className="pricing-title">
                                    <h4 className="card-title title">
                                      {v.agence_name}
                                    </h4>
                                    <p className="sub-text">
                                      {v.date_voyage}
                                      {v.trajet &&
                                      v.trajet.length > 0 &&
                                      v.trajet[0].heure_depart
                                        ? ` à ${v.trajet[0].heure_depart}`
                                        : ""}{" "}
                                      - {v.libelle_bateau}
                                    </p>
                                  </div>
                                  <div className="card-text center">
                                    <div className="trajet-list">
                                      {v.trajet && v.trajet.length > 0 ? (
                                        v.trajet.map((etape, index) => (
                                          <div
                                            key={index}
                                            className="trajet-etape d-flex align-items-center mb-1"
                                          >
                                            <span className="sub-text">
                                              {etape.LieuDeDepartLibelle}
                                            </span>
                                            <em className="icon ni ni-arrow-right mx-2"></em>
                                            <span className="sub-text">
                                              {etape.LieuDArriverLibelle}
                                            </span>
                                            {etape.heure_depart && (
                                              <small className="text-muted ms-2">
                                                ({etape.heure_depart})
                                              </small>
                                            )}
                                          </div>
                                        ))
                                      ) : (
                                        <span className="sub-text">
                                          Trajet non défini
                                        </span>
                                      )}
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
                                          v.place_prise_eco}{" "}
                                        restantes
                                      </span>
                                    </li>
                                    <li>
                                      <span className="w-50">
                                        Place disponible <br /> vip
                                      </span>{" "}
                                      -
                                      <span className="ml-auto">
                                        {v.place_disponible_vip -
                                          v.place_prise_vip}{" "}
                                        restantes
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
                                      onClick={() => handleRedirect(v)}
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

                    {/* Bloc des autres voyages */}
                    <div className="nk-block">
                      <div className="nk-block-head">
                        <h5 className="nk-block-title">
                          {hasSearched ? "Autres voyages" : "Futures voyages"}
                        </h5>
                      </div>
                      <div className="row g-gs">
                        {autresVoyages.length === 0 ? (
                          <div className="col-12">
                            <div className="alert alert-light">
                              <p className="mb-0">
                                Aucun autre voyage disponible.
                              </p>
                            </div>
                          </div>
                        ) : (
                          autresVoyages.map((v) => (
                            <div
                              className="col-md-6 col-xxl-3"
                              key={v.referenceDoc}
                            >
                              <div className="card card-bordered pricing">
                                <div className="pricing-head">
                                  <div className="pricing-title">
                                    <h4 className="card-title title">
                                      {v.agence_name}
                                    </h4>
                                    <p className="sub-text">
                                      {v.date_voyage}
                                      {v.trajet &&
                                      v.trajet.length > 0 &&
                                      v.trajet[0].heure_depart
                                        ? ` à ${v.trajet[0].heure_depart}`
                                        : ""}{" "}
                                      - {v.libelle_bateau}
                                    </p>
                                  </div>
                                  <div className="card-text center">
                                    <div className="trajet-list">
                                      {v.trajet && v.trajet.length > 0 ? (
                                        v.trajet.map((etape, index) => (
                                          <div
                                            key={index}
                                            className="trajet-etape d-flex align-items-center mb-1"
                                          >
                                            <span className="sub-text">
                                              {etape.LieuDeDepartLibelle}
                                            </span>
                                            <em className="icon ni ni-arrow-right mx-2"></em>
                                            <span className="sub-text">
                                              {etape.LieuDArriverLibelle}
                                            </span>
                                            {etape.heure_depart && (
                                              <small className="text-muted ms-2">
                                                ({etape.heure_depart})
                                              </small>
                                            )}
                                          </div>
                                        ))
                                      ) : (
                                        <span className="sub-text">
                                          Trajet non défini
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="pricing-body">
                                  <ul className="pricing-features">
                                    <li>
                                      <span className="w-50">
                                        Places économiques
                                      </span>{" "}
                                      -{" "}
                                      <span className="ml-auto">
                                        {Math.max(
                                          0,
                                          (v.place_disponible_eco || 0) -
                                            (v.place_prise_eco || 0)
                                        )}{" "}
                                        restantes
                                      </span>
                                    </li>
                                    <li>
                                      <span className="w-50">Places VIP</span> -{" "}
                                      <span className="ml-auto">
                                        {Math.max(
                                          0,
                                          (v.place_disponible_vip || 0) -
                                            (v.place_prise_vip || 0)
                                        )}{" "}
                                        restantes
                                      </span>
                                    </li>
                                  </ul>
                                  <div className="pricing-action">
                                    <button
                                      className="btn btn-outline-light"
                                      onClick={() => handleRedirect(v)}
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
