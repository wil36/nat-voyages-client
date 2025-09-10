import React, { useEffect, useState } from "react";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import NavBarComponent from "../components/NavBarComponent";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import FooterComponent from "../components/FooterComponent";

export default function DetailVoyage() {
  const [voyage, setVoyage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const handleBackNavigation = () => {
    navigate("/");
  };

  useEffect(() => {
    // Check if voyage object was passed via navigation state
    if (location.state && location.state.voyage) {
      setVoyage(location.state.voyage);
      setLoading(false);
    } else {
      // Fallback: fetch from Firestore if no state passed
      const fetchVoyage = async () => {
        try {
          const docRef = doc(db, "voyages", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setVoyage(docSnap.data());
          } else {
            console.log("No such document!");
          }
          setLoading(false);
        } catch (error) {
          console.log("Error fetching voyage: ", error);
          setLoading(false);
        }
      };
      fetchVoyage();
    }
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-grow text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="nk-body bg-lighter npc-default has-sidebar ">
      <div className="nk-app-root">
        {/* main @s */}
        <div className="nk-main ">
          <div className="nk-wrap ">
            {/* main header @s */}
            <NavBarComponent />
            {/* main header @e */}
            {/* content @s */}
            <div className="nk-content ">
              <div className="container">
                <div className="nk-content-inner">
                  <div className="nk-content-body">
                    <div className="nk-block-head nk-block-head-sm">
                      <div className="nk-block-between g-3">
                        <div className="nk-block-head-content">
                          <h3 className="nk-block-title page-title">
                            Voyage /{" "}
                            <strong className="text-primary small">
                              {voyage?.libelle_bateau || voyage?.titre}
                            </strong>
                          </h3>
                          <div className="nk-block-des text-soft">
                            <ul className="list-inline">
                              <li>
                                Agence:{" "}
                                <span className="text-base">
                                  {voyage?.agence_name}
                                </span>
                              </li>
                              <li>
                                Date:{" "}
                                <span className="text-base">
                                  {voyage?.date_voyage}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div
                          className="nk-block-head-content"
                          onClick={handleBackNavigation}
                        >
                          <a
                            href="#"
                            className="btn btn-outline-light bg-white d-none d-sm-inline-flex"
                          >
                            <em className="icon ni ni-arrow-left" />
                            <span>Retour</span>
                          </a>
                          <a
                            href="#"
                            className="btn btn-icon btn-outline-light bg-white d-inline-flex d-sm-none"
                          >
                            <em className="icon ni ni-arrow-left" />
                          </a>
                        </div>
                      </div>
                    </div>
                    {/* .nk-block-head */}
                    <div className="nk-block">
                      <div className="card">
                        <div className="card-aside-wrap">
                          <div className="card-content">
                            <ul className="nav nav-tabs nav-tabs-mb-icon nav-tabs-card">
                              <li className="nav-item">
                                <a className="nav-link active" href="#">
                                  <em className="icon ni ni-user-circle" />
                                  <span>Information sur le voyage</span>
                                </a>
                              </li>
                            </ul>
                            {/* .nav-tabs */}
                            <div className="card-inner">
                              <div className="nk-block">
                                <div className="nk-block-head">
                                  <h5 className="title">
                                    Information sur le voyage
                                  </h5>
                                </div>
                                {/* .nk-block-head */}
                                <div className="profile-ud-list">
                                  <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Bateau
                                      </span>
                                      <span className="profile-ud-value">
                                        {voyage?.libelle_bateau}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Agence
                                      </span>
                                      <span className="profile-ud-value">
                                        {voyage?.agence_name}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Date du voyage
                                      </span>
                                      <span className="profile-ud-value">
                                        {voyage?.date_voyage}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Statut
                                      </span>
                                      <span className="profile-ud-value">
                                        {voyage?.statut}
                                      </span>
                                    </div>
                                  </div>
                                  {/* <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Montant TTC
                                      </span>
                                      <span className="profile-ud-value">
                                        {voyage?.montant} FCFA
                                      </span>
                                    </div>
                                  </div> */}
                                  <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Chauffeur
                                      </span>
                                      <span className="profile-ud-value">
                                        {voyage?.chauffeur}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {/* .profile-ud-list */}
                              </div>
                              {/* .nk-block */}
                              <div className="nk-block">
                                <div className="nk-block-head nk-block-head-line">
                                  <h6 className="title overline-title text-base">
                                    Équipage
                                  </h6>
                                </div>
                                {/* .nk-block-head */}
                                <div className="profile-ud-list">
                                  <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Hôtesse 1
                                      </span>
                                      <span className="profile-ud-value">
                                        {voyage?.hotesse1 || "Non assigné"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Hôtesse 2
                                      </span>
                                      <span className="profile-ud-value">
                                        {voyage?.hotesse2 || "Non assigné"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Mécanicien
                                      </span>
                                      <span className="profile-ud-value">
                                        {voyage?.mecanicien || "Non assigné"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {/* .profile-ud-list */}
                              </div>
                              {/* .nk-block */}
                              <div className="nk-divider divider md" />
                              <div className="nk-block">
                                <div className="nk-block-head nk-block-head-sm nk-block-between">
                                  <h5 className="title">Trajet</h5>
                                </div>
                                {/* .nk-block-head */}
                                <div className="trajet-details">
                                  {voyage?.trajet &&
                                  voyage.trajet.length > 0 ? (
                                    voyage.trajet.map((etape, index) => (
                                      <div
                                        key={index}
                                        className="trajet-etape mb-3 p-3 border rounded"
                                      >
                                        <div className="d-flex justify-content-between align-items-center">
                                          <div>
                                            <strong>
                                              {etape.LieuDeDepartLibelle}
                                            </strong>
                                            <em className="icon ni ni-arrow-right mx-2"></em>
                                            <strong>
                                              {etape.LieuDArriverLibelle}
                                            </strong>
                                          </div>
                                          {etape.heure_depart && (
                                            <small className="text-muted">
                                              Départ: {etape.heure_depart}
                                            </small>
                                          )}
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-muted">
                                      Aucun trajet défini
                                    </p>
                                  )}
                                </div>
                                {/* .trajet-details */}
                              </div>
                              {/* .nk-block */}
                            </div>
                            {/* .card-inner */}
                          </div>
                          {/* .card-content */}
                          <div
                            className="card-aside card-aside-right user-aside toggle-slide toggle-slide-right toggle-break-xxl"
                            data-content="userAside"
                            data-toggle-screen="xxl"
                            data-toggle-overlay="true"
                            data-toggle-body="true"
                          >
                            <div className="card-inner-group" data-simplebar="">
                              <div className="card-inner">
                                <div className="user-card user-card-s2">
                                  <div className="user-avatar lg bg-primary">
                                    <span>AB</span>
                                  </div>
                                  <div className="user-info">
                                    <div className="badge badge-outline-light badge-pill ucap">
                                      Investor
                                    </div>
                                    <h5>Abu Bin Ishtiyak</h5>
                                    <span className="sub-text">
                                      info@softnio.com
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {/* .card-inner */}
                              <div className="card-inner card-inner-sm">
                                <ul className="btn-toolbar justify-center gx-1">
                                  <li>
                                    <a
                                      href="#"
                                      className="btn btn-trigger btn-icon"
                                    >
                                      <em className="icon ni ni-shield-off" />
                                    </a>
                                  </li>
                                  <li>
                                    <a
                                      href="#"
                                      className="btn btn-trigger btn-icon"
                                    >
                                      <em className="icon ni ni-mail" />
                                    </a>
                                  </li>
                                  <li>
                                    <a
                                      href="#"
                                      className="btn btn-trigger btn-icon"
                                    >
                                      <em className="icon ni ni-download-cloud" />
                                    </a>
                                  </li>
                                  <li>
                                    <a
                                      href="#"
                                      className="btn btn-trigger btn-icon"
                                    >
                                      <em className="icon ni ni-bookmark" />
                                    </a>
                                  </li>
                                  <li>
                                    <a
                                      href="#"
                                      className="btn btn-trigger btn-icon text-danger"
                                    >
                                      <em className="icon ni ni-na" />
                                    </a>
                                  </li>
                                </ul>
                              </div>
                              {/* .card-inner */}
                              <div className="card-inner">
                                <div className="overline-title-alt mb-2">
                                  Places disponibles
                                </div>
                                <div className="profile-balance">
                                  <div className="profile-balance-group gx-4">
                                    <div className="profile-balance-sub">
                                      <div className="profile-balance-amount">
                                        <div className="number">
                                          {(voyage?.place_disponible_eco || 0) -
                                            (voyage?.place_prise_eco || 0)}
                                        </div>
                                      </div>
                                      <div className="profile-balance-subtitle">
                                        Places Économiques
                                      </div>
                                    </div>
                                    <div className="profile-balance-sub">
                                      <div className="profile-balance-amount">
                                        <div className="number">
                                          {(voyage?.place_disponible_vip || 0) -
                                            (voyage?.place_prise_vip || 0)}
                                        </div>
                                      </div>
                                      <div className="profile-balance-subtitle">
                                        Places VIP
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* .card-inner */}
                              <div className="card-inner">
                                <div className="row text-center">
                                  <div className="col-6">
                                    <div className="profile-stats">
                                      <span className="amount">
                                        {voyage?.place_disponible_eco || 0}
                                      </span>
                                      <span className="sub-text">
                                        Total Éco
                                      </span>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="profile-stats">
                                      <span className="amount">
                                        {voyage?.place_disponible_vip || 0}
                                      </span>
                                      <span className="sub-text">
                                        Total VIP
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* .card-inner */}
                              <div className="card-inner">
                                <h6 className="overline-title-alt mb-2">
                                  Additional
                                </h6>
                                <div className="row g-3">
                                  <div className="col-6">
                                    <span className="sub-text">User ID:</span>
                                    <span>UD003054</span>
                                  </div>
                                  <div className="col-6">
                                    <span className="sub-text">
                                      Last Login:
                                    </span>
                                    <span>15 Feb, 2019 01:02 PM</span>
                                  </div>
                                  <div className="col-6">
                                    <span className="sub-text">
                                      KYC Status:
                                    </span>
                                    <span className="lead-text text-success">
                                      Approved
                                    </span>
                                  </div>
                                  <div className="col-6">
                                    <span className="sub-text">
                                      {voyage?.dateFin}
                                    </span>
                                    <span>Nov 24, 2019</span>
                                  </div>
                                </div>
                              </div>
                              {/* .card-inner */}
                              <div className="card-inner">
                                <h6 className="overline-title-alt mb-3">
                                  Groups
                                </h6>
                                <ul className="g-1">
                                  <li className="btn-group">
                                    <a
                                      className="btn btn-xs btn-light btn-dim"
                                      href="#"
                                    >
                                      investor
                                    </a>
                                    <a
                                      className="btn btn-xs btn-icon btn-light btn-dim"
                                      href="#"
                                    >
                                      <em className="icon ni ni-cross" />
                                    </a>
                                  </li>
                                  <li className="btn-group">
                                    <a
                                      className="btn btn-xs btn-light btn-dim"
                                      href="#"
                                    >
                                      support
                                    </a>
                                    <a
                                      className="btn btn-xs btn-icon btn-light btn-dim"
                                      href="#"
                                    >
                                      <em className="icon ni ni-cross" />
                                    </a>
                                  </li>
                                  <li className="btn-group">
                                    <a
                                      className="btn btn-xs btn-light btn-dim"
                                      href="#"
                                    >
                                      another tag
                                    </a>
                                    <a
                                      className="btn btn-xs btn-icon btn-light btn-dim"
                                      href="#"
                                    >
                                      <em className="icon ni ni-cross" />
                                    </a>
                                  </li>
                                </ul>
                              </div>
                              {/* .card-inner */}
                            </div>
                            {/* .card-inner */}
                          </div>
                        </div>
                      </div>
                    </div>
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
    </div>
  );
}
