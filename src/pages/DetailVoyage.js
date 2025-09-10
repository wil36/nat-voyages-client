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
  
  // État pour le formulaire de billet
  const [ticketForm, setTicketForm] = useState({
    type_voyage: 'aller_simple', // aller_simple ou aller_retour
    type_passager: 'adulte', // adulte, enfant, bebe
    classe: 'economique', // economique ou vip
    type_piece: 'cni', // cni, passeport, permis
    numero_piece: '',
    nom: '',
    prenom: '',
    sexe: 'M', // M ou F
    telephone: '',
    adresse: '',
    trajets_selectionnes: [], // tableau des indices des trajets sélectionnés
  });
  
  const [montantTotal, setMontantTotal] = useState(0);
  const handleBackNavigation = () => {
    navigate("/");
  };

  // Fonction pour mettre à jour le formulaire de billet
  const handleTicketFormChange = (field, value) => {
    setTicketForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonction pour gérer la sélection des trajets
  const handleTrajetSelection = (trajetIndex, isSelected) => {
    setTicketForm(prev => {
      const newTrajets = isSelected 
        ? [...prev.trajets_selectionnes, trajetIndex]
        : prev.trajets_selectionnes.filter(index => index !== trajetIndex);
      
      return {
        ...prev,
        trajets_selectionnes: newTrajets
      };
    });
  };

  // Calcul automatique du montant total
  React.useEffect(() => {
    if (!voyage || !ticketForm.trajets_selectionnes.length) {
      setMontantTotal(0);
      return;
    }

    let total = 0;
    const prixBase = voyage.montant || 25000; // Prix de base par trajet
    
    // Multiplicateur selon le type de passager
    const multiplicateurPassager = {
      'adulte': 1,
      'enfant': 0.5,
      'bebe': 0.1
    };
    
    // Multiplicateur selon la classe
    const multiplicateurClasse = {
      'economique': 1,
      'vip': 1.5
    };
    
    // Multiplicateur selon le type de voyage
    const multiplicateurVoyage = {
      'aller_simple': 1,
      'aller_retour': 1.8
    };
    
    total = ticketForm.trajets_selectionnes.length * prixBase * 
            multiplicateurPassager[ticketForm.type_passager] * 
            multiplicateurClasse[ticketForm.classe] * 
            multiplicateurVoyage[ticketForm.type_voyage];
    
    setMontantTotal(Math.round(total));
  }, [ticketForm, voyage]);

  // Fonction pour soumettre le formulaire
  const handleTicketSubmit = (e) => {
    e.preventDefault();
    console.log('Données du billet:', {
      ...ticketForm,
      montant_total: montantTotal,
      voyage_id: voyage.id
    });
    // Ici, vous pourrez ajouter la logique pour enregistrer le billet
    alert(`Billet réservé pour un montant de ${montantTotal.toLocaleString()} FCFA`);
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
                                  <button 
                                    className="btn btn-primary btn-sm"
                                    data-toggle="modal"
                                    data-target="#ticketModal"
                                  >
                                    Acheter un billet
                                  </button>
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

      {/* Modal de vente de billets */}
      <div className="modal fade" id="ticketModal" tabIndex="-1" role="dialog" aria-labelledby="ticketModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="ticketModalLabel">
                Réservation de billet - {voyage?.libelle_bateau}
              </h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleTicketSubmit}>
                {/* Informations sur le voyage */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title">Places disponibles</h6>
                        <p className="mb-1">Économique: {(voyage?.place_disponible_eco || 0) - (voyage?.place_prise_eco || 0)}</p>
                        <p className="mb-0">VIP: {(voyage?.place_disponible_vip || 0) - (voyage?.place_prise_vip || 0)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <h6 className="card-title">Montant total</h6>
                        <h4 className="mb-0">{montantTotal.toLocaleString()} FCFA</h4>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Type de voyage */}
                <div className="form-group mb-3">
                  <label className="form-label">Type de voyage</label>
                  <div className="custom-control-group">
                    <div className="custom-control custom-radio">
                      <input
                        type="radio"
                        id="aller_simple"
                        name="type_voyage"
                        className="custom-control-input"
                        checked={ticketForm.type_voyage === 'aller_simple'}
                        onChange={() => handleTicketFormChange('type_voyage', 'aller_simple')}
                      />
                      <label className="custom-control-label" htmlFor="aller_simple">Aller simple</label>
                    </div>
                    <div className="custom-control custom-radio">
                      <input
                        type="radio"
                        id="aller_retour"
                        name="type_voyage"
                        className="custom-control-input"
                        checked={ticketForm.type_voyage === 'aller_retour'}
                        onChange={() => handleTicketFormChange('type_voyage', 'aller_retour')}
                      />
                      <label className="custom-control-label" htmlFor="aller_retour">Aller-retour</label>
                    </div>
                  </div>
                </div>

                {/* Type de passager */}
                <div className="form-group mb-3">
                  <label className="form-label">Type de passager</label>
                  <div className="custom-control-group">
                    <div className="custom-control custom-radio">
                      <input
                        type="radio"
                        id="adulte"
                        name="type_passager"
                        className="custom-control-input"
                        checked={ticketForm.type_passager === 'adulte'}
                        onChange={() => handleTicketFormChange('type_passager', 'adulte')}
                      />
                      <label className="custom-control-label" htmlFor="adulte">Adulte</label>
                    </div>
                    <div className="custom-control custom-radio">
                      <input
                        type="radio"
                        id="enfant"
                        name="type_passager"
                        className="custom-control-input"
                        checked={ticketForm.type_passager === 'enfant'}
                        onChange={() => handleTicketFormChange('type_passager', 'enfant')}
                      />
                      <label className="custom-control-label" htmlFor="enfant">Enfant (50% du prix)</label>
                    </div>
                    <div className="custom-control custom-radio">
                      <input
                        type="radio"
                        id="bebe"
                        name="type_passager"
                        className="custom-control-input"
                        checked={ticketForm.type_passager === 'bebe'}
                        onChange={() => handleTicketFormChange('type_passager', 'bebe')}
                      />
                      <label className="custom-control-label" htmlFor="bebe">Bébé (10% du prix)</label>
                    </div>
                  </div>
                </div>

                {/* Classe */}
                <div className="form-group mb-3">
                  <label className="form-label" htmlFor="classe">Classe</label>
                  <select
                    className="form-control"
                    id="classe"
                    value={ticketForm.classe}
                    onChange={(e) => handleTicketFormChange('classe', e.target.value)}
                  >
                    <option value="economique">Économique</option>
                    <option value="vip">VIP (+50% du prix)</option>
                  </select>
                </div>

                <div className="row">
                  {/* Type de pièce d'identité */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="type_piece">Type de pièce d'identité</label>
                      <select
                        className="form-control"
                        id="type_piece"
                        value={ticketForm.type_piece}
                        onChange={(e) => handleTicketFormChange('type_piece', e.target.value)}
                        required
                      >
                        <option value="cni">Carte Nationale d'Identité</option>
                        <option value="passeport">Passeport</option>
                        <option value="permis">Permis de conduire</option>
                      </select>
                    </div>
                  </div>

                  {/* Numéro de pièce */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="numero_piece">Numéro de pièce d'identité</label>
                      <input
                        type="text"
                        className="form-control"
                        id="numero_piece"
                        value={ticketForm.numero_piece}
                        onChange={(e) => handleTicketFormChange('numero_piece', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  {/* Nom */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="nom">Nom</label>
                      <input
                        type="text"
                        className="form-control"
                        id="nom"
                        value={ticketForm.nom}
                        onChange={(e) => handleTicketFormChange('nom', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Prénom */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="prenom">Prénom</label>
                      <input
                        type="text"
                        className="form-control"
                        id="prenom"
                        value={ticketForm.prenom}
                        onChange={(e) => handleTicketFormChange('prenom', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Sexe */}
                <div className="form-group mb-3">
                  <label className="form-label">Sexe</label>
                  <div className="custom-control-group">
                    <div className="custom-control custom-radio">
                      <input
                        type="radio"
                        id="sexe_m"
                        name="sexe"
                        className="custom-control-input"
                        checked={ticketForm.sexe === 'M'}
                        onChange={() => handleTicketFormChange('sexe', 'M')}
                      />
                      <label className="custom-control-label" htmlFor="sexe_m">Masculin</label>
                    </div>
                    <div className="custom-control custom-radio">
                      <input
                        type="radio"
                        id="sexe_f"
                        name="sexe"
                        className="custom-control-input"
                        checked={ticketForm.sexe === 'F'}
                        onChange={() => handleTicketFormChange('sexe', 'F')}
                      />
                      <label className="custom-control-label" htmlFor="sexe_f">Féminin</label>
                    </div>
                  </div>
                </div>

                <div className="row">
                  {/* Téléphone */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="telephone">Numéro de téléphone</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="telephone"
                        value={ticketForm.telephone}
                        onChange={(e) => handleTicketFormChange('telephone', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Adresse */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="adresse">Adresse</label>
                      <input
                        type="text"
                        className="form-control"
                        id="adresse"
                        value={ticketForm.adresse}
                        onChange={(e) => handleTicketFormChange('adresse', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Sélection des trajets */}
                <div className="form-group mb-4">
                  <label className="form-label">Sélectionner les trajets</label>
                  <div className="border rounded p-3">
                    {voyage?.trajet && voyage.trajet.length > 0 ? (
                      voyage.trajet.map((etape, index) => (
                        <div key={index} className="custom-control custom-checkbox mb-2">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id={`trajet_${index}`}
                            checked={ticketForm.trajets_selectionnes.includes(index)}
                            onChange={(e) => handleTrajetSelection(index, e.target.checked)}
                          />
                          <label className="custom-control-label" htmlFor={`trajet_${index}`}>
                            <strong>{etape.LieuDeDepartLibelle}</strong>
                            <em className="icon ni ni-arrow-right mx-2"></em>
                            <strong>{etape.LieuDArriverLibelle}</strong>
                            {etape.heure_depart && (
                              <small className="text-muted ml-2">
                                (Départ: {etape.heure_depart})
                              </small>
                            )}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">Aucun trajet disponible</p>
                    )}
                  </div>
                </div>

                {/* Montant total (lecture seule) */}
                <div className="form-group mb-3">
                  <label className="form-label" htmlFor="montant_total">Montant total à payer</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    id="montant_total"
                    value={`${montantTotal.toLocaleString()} FCFA`}
                    disabled
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-dismiss="modal">Annuler</button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={!ticketForm.trajets_selectionnes.length || !ticketForm.nom || !ticketForm.prenom}
                  >
                    Réserver le billet
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
