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

        // Vérifier si ce voyage a les mêmes lieux de départ/arrivée avec un chemin logique
        const memesDepartArrivee = checkTrajetPath(voyage.trajet, filters.depart, filters.arrivee);

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
      // Temporaire : enlever la vérification user pour permettre l'accès sans authentification
      // if (!user) return;

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
            date_voyage: data.date_voyage
              ? `${data.date_voyage
                  .toDate()
                  .toLocaleDateString()} ${data.date_voyage
                  .toDate()
                  .toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
              : "",
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

  // Fonction pour vérifier s'il existe un chemin logique dans le trajet
  const checkTrajetPath = (trajet, departId, arriveeId) => {
    if (!trajet || trajet.length === 0) return false;
    
    // Si aucun filtre de lieu, retourner true
    if (!departId && !arriveeId) return true;
    
    // Si seulement le départ est spécifié
    if (departId && !arriveeId) {
      return trajet.some(etape => etape.LieuDeDepartReference?.id === departId);
    }
    
    // Si seulement l'arrivée est spécifiée
    if (!departId && arriveeId) {
      return trajet.some(etape => etape.LieuDArriverReference?.id === arriveeId);
    }
    
    // Si les deux sont spécifiés, vérifier le chemin logique
    let departIndex = -1;
    let arriveeIndex = -1;
    
    // Trouver l'index de l'étape où le lieu de départ apparaît
    for (let i = 0; i < trajet.length; i++) {
      if (trajet[i].LieuDeDepartReference?.id === departId) {
        departIndex = i;
        break;
      }
    }
    
    // Trouver l'index de l'étape où le lieu d'arrivée apparaît
    for (let i = 0; i < trajet.length; i++) {
      if (trajet[i].LieuDArriverReference?.id === arriveeId) {
        arriveeIndex = i;
        break;
      }
    }
    
    // Vérifications supplémentaires pour les points intermédiaires
    // Un lieu peut être point d'arrivée d'une étape ET point de départ de la suivante
    if (departIndex === -1) {
      for (let i = 0; i < trajet.length; i++) {
        if (trajet[i].LieuDArriverReference?.id === departId) {
          departIndex = i;
          break;
        }
      }
    }
    
    if (arriveeIndex === -1) {
      for (let i = 0; i < trajet.length; i++) {
        if (trajet[i].LieuDeDepartReference?.id === arriveeId) {
          arriveeIndex = i;
          break;
        }
      }
    }
    
    // Pour qu'un trajet soit valide, le départ doit apparaître avant ou à la même étape que l'arrivée
    return departIndex !== -1 && arriveeIndex !== -1 && departIndex <= arriveeIndex;
  };

  const handleSearch = (e) => {
    e.preventDefault();

    // Vérifier que la date est obligatoire
    if (!filters.date) {
      alert("La date de voyage est obligatoire pour effectuer une recherche.");
      return;
    }

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

        // Departure and Arrival filter - check if there's a logical path
        if ((filters.depart || filters.arrivee) && matchesFilter) {
          const hasValidPath = checkTrajetPath(voyage.trajet, filters.depart, filters.arrivee);
          if (!hasValidPath) {
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
        // Trier les lieux par ordre alphabétique
        const lieuxTries = lieuxList.sort((a, b) =>
          a.libelle_lieux.localeCompare(b.libelle_lieux, "fr", {
            ignorePunctuation: true,
            numeric: true,
          })
        );
        setLieux(lieuxTries);
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
  //TODO voir la transmission de la liste des voyages à la page détail voyage
  const handleRedirect = (voyage) => {
    try {
      // Function to deeply clean objects of non-serializable properties
      const cleanObject = (obj, visited = new WeakSet()) => {
        if (obj === null || obj === undefined) return obj;
        if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') return obj;
        
        // Protection contre les références circulaires
        if (typeof obj === 'object' && visited.has(obj)) {
          return {};
        }
        
        if (Array.isArray(obj)) {
          visited.add(obj);
          const result = obj.map(item => cleanObject(item, visited));
          visited.delete(obj);
          return result;
        }
        
        if (typeof obj === 'object') {
          visited.add(obj);
          const cleaned = {};
          for (const key in obj) {
            const value = obj[key];
            // Skip Firestore references and functions
            if (value && typeof value === 'object' && value.constructor && 
                (value.constructor.name === 'DocumentReference' || 
                 value.constructor.name === 'Timestamp' ||
                 typeof value === 'function')) {
              continue;
            }
            cleaned[key] = cleanObject(value, visited);
          }
          visited.delete(obj);
          return cleaned;
        }
        return obj;
      };

      const cleanVoyage = cleanObject(voyage);
      const cleanVoyages = originalVoyages.map(cleanObject);

      navigate(`/detail-voyage/${voyage.id}`, {
        state: { voyage: cleanVoyage, voyages: cleanVoyages },
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

            {/* Hero Section @s */}
            <div
              className="hero-section pt-5"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "500px",
                display: "flex",
                alignItems: "center",
                color: "white",
              }}
            >
              <div className="container">
                <div className="row justify-content-center">
                  <div className="col-lg-8 text-center">
                    <h1
                      className="hero-title"
                      style={{
                        fontSize: "3rem",
                        fontWeight: "bold",
                        marginBottom: "1rem",
                        color: "white",
                      }}
                    >
                      Où souhaitez-vous aller au Gabon ?
                    </h1>
                    <p
                      className="hero-subtitle"
                      style={{
                        fontSize: "1.2rem",
                        marginBottom: "2rem",
                        opacity: 0.9,
                      }}
                    >
                      Voyagez en bus, bateau, train ou avion. Nous vous y
                      emmenons en toute simplicité !
                    </p>

                    {/* Search Form */}
                    <div
                      className="search-card mb-5"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.95)",
                        borderRadius: "15px",
                        padding: "30px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                        color: "#333",
                      }}
                    >
                      <div className="row g-3 align-items-end justify-content-center">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label
                              className="form-label"
                              style={{
                                fontWeight: "600",
                                color: "#666",
                                textAlign: "left",
                                display: "block",
                              }}
                            >
                              Départ
                            </label>
                            <div className="form-control-wrap">
                              <select
                                className="form-control form-select"
                                value={filters.depart}
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    depart: e.target.value,
                                  })
                                }
                                style={{ paddingRight: "30px", height: "46px" }}
                              >
                                <option value="">Toutes les villes</option>
                                {lieux.map((lieu) => (
                                  <option
                                    key={`hero-depart-${lieu.id}`}
                                    value={lieu.id}
                                  >
                                    {lieu.libelle_lieux}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label
                              className="form-label"
                              style={{
                                fontWeight: "600",
                                color: "#666",
                                textAlign: "left",
                                display: "block",
                              }}
                            >
                              Arrivée
                            </label>
                            <div className="form-control-wrap">
                              <select
                                className="form-control form-select"
                                value={filters.arrivee}
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    arrivee: e.target.value,
                                  })
                                }
                                style={{ paddingRight: "30px", height: "46px" }}
                              >
                                <option value="">Toutes les villes</option>
                                {lieux.map((lieu) => (
                                  <option
                                    key={`hero-arrivee-${lieu.id}`}
                                    value={lieu.id}
                                  >
                                    {lieu.libelle_lieux}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label
                              className="form-label"
                              style={{
                                fontWeight: "600",
                                color: "#666",
                                textAlign: "left",
                                display: "block",
                              }}
                            >
                              Date
                            </label>
                            <div className="form-control-wrap">
                              <input
                                type="date"
                                className="form-control"
                                value={filters.date}
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    date: e.target.value,
                                  })
                                }
                                style={{ height: "46px" }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-md-2">
                          <div className="form-group d-flex ">
                            {/* <button
                              className="btn btn-primary"
                              onClick={handleSearch}
                              style={{ flex: 1 }}
                            >
                              <em className="icon ni ni-search"></em>
                              <span>Rechercher</span>
                            </button>
                            <button
                              className="btn btn-outline-light"
                              onClick={() => {
                                setFilters({
                                  depart: "",
                                  arrivee: "",
                                  date: "",
                                });
                                setHasSearched(false);
                                setVoyagesDuJour(originalVoyages.slice(0, 6));
                                setAutresVoyages(originalVoyages.slice(6));
                              }}
                              style={{ minWidth: "45px" }}
                            >
                              <em className="icon ni ni-reload"></em>
                            </button> */}
                            <button
                              className="ml-1 btn btn-icon btn-lg btn-outline-primary"
                              type="button"
                              onClick={handleSearch}
                            >
                              <em className="icon ni ni-search"></em>
                            </button>
                            {hasSearched && (
                              <button
                                type="button"
                                className="ml-1 btn btn-icon btn-lg btn-outline-primary"
                                onClick={resetVoyages}
                              >
                                <em className="icon ni ni-reload"></em>{" "}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Hero Section @e */}

            {/* content @s */}
            <div className="nk-content" style={{ paddingBottom: "80px" }}>
              <div className="container">
                <div className="nk-content-inner">
                  <div className="nk-content-body">
                    {/* <div className="nk-block-head nk-block-head-sm">
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
                            </div> }
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
                                            required
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

                          </div>
                        </div>
                      </div>
                    </div> */}
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
