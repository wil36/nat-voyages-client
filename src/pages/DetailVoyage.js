import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
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
    type_voyage: "aller_simple", // aller_simple ou aller_retour
    type_passager: "Adulte", // adulte, enfant, bebe
    classe: "Economie", // economique ou vip
    type_piece: "Carte d'identité ", // cni, passeport, permis
    numero_piece: "",
    nom: "",
    prenom: "",
    sexe: "Masculin", // Masculin ou Feminin
    telephone: "",
    adresse: "",
    trajets_selectionnes: [], // tableau des indices des trajets sélectionnés
    numero_billet_parent: "", // pour les bébés
  });

  const [montantTotal, setMontantTotal] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBackNavigation = () => {
    navigate("/");
  };

  // Fonction pour générer et télécharger le reçu PDF
  const genererFacturePDF = async (venteId, donneesVente) => {
    const doc = new jsPDF();

    // Génération du QR code
    const numeroReference = venteId.substring(0, 8).toUpperCase();
    const qrData = `Réf: ${numeroReference} | Montant: ${donneesVente.montant_ttc}F | Client: ${donneesVente.prenoms} ${donneesVente.noms}`;
    const qrDataUrl = await QRCode.toDataURL(qrData);

    // Titre principal
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("NAT VOYAGES - TRANSPORT MARITIME", 20, 20);

    // Infos de l'entreprise
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Agence: ${donneesVente.agence_name || "Agence Principale"}`,
      20,
      28
    );
    doc.text("Tél: +225 XX XX XX XX", 20, 34);
    doc.text("Email: contact@natvoyages.ci", 20, 40);

    // Ligne séparatrice
    doc.line(20, 45, 190, 45);

    // Sous-titre
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("BILLET ELECTRONIQUE", 20, 55);

    // Détails du voyage
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("DETAILS DU VOYAGE", 20, 65);

    // Extraire les villes de départ et d'arrivée
    const premierTrajet = donneesVente.trajet?.[0];
    const dernierTrajet = donneesVente.trajet?.[donneesVente.trajet.length - 1];
    const villeDepart =
      premierTrajet?.LieuDeDepartLibelle || premierTrajet?.lieu_depart || "N/A";
    const villeArrivee =
      dernierTrajet?.LieuDArriverLibelle ||
      dernierTrajet?.lieu_arrivee ||
      "N/A";

    doc.text(`Ville de départ : ${villeDepart}`, 20, 72);
    doc.text(`Ville d'arrivée : ${villeArrivee}`, 20, 78);
    doc.text(`Date de voyage : ${voyage?.date_voyage || "N/A"}`, 20, 84);
    doc.text("Franchise de bagage : 20kgs", 20, 90);

    // Réservation
    doc.setFont("helvetica", "bold");
    doc.text("DETAILS DE LA RESERVATION", 20, 105);
    doc.setFont("helvetica", "normal");
    doc.text(`Numéro de référence : ${numeroReference}`, 20, 112);
    doc.text(
      `Nom et prénom du passager : ${donneesVente.prenoms} ${donneesVente.noms}`,
      20,
      118
    );
    doc.text(`Tel : ${donneesVente.tel}`, 20, 124);
    doc.text(`Type de passager : ${donneesVente.type_passager}`, 20, 130);
    doc.text(`Classe : ${donneesVente.classe}`, 20, 136);
    doc.text(
      `Montant TTC : ${donneesVente.montant_ttc.toLocaleString()}F`,
      20,
      142
    );
    doc.text(`Encaissé par : Système NAT VOYAGES`, 20, 148);

    // Informations additionnelles si bébé
    if (donneesVente.numero_billet_parent) {
      doc.text(`Ticket parent : ${donneesVente.numero_billet_parent}`, 20, 154);
    }

    // Infos additionnelles
    doc.setFont("helvetica", "bold");
    doc.text("INFORMATIONS ADDITIONNELLES", 20, 170);
    doc.setFont("helvetica", "normal");
    doc.text("Billet non remboursable valable 3 mois", 20, 177);
    doc.text("Pénalité changement de date : à partir de 5000 FCFA", 20, 183);
    doc.text("Pénalité départ manqué : 8000 FCFA", 20, 189);
    doc.text("Pénalité autre modification : 5000 FCFA", 20, 195);

    // Date et heure d'émission
    const dateEmission = new Date().toLocaleString("fr-FR");
    doc.setFontSize(8);
    doc.text(`Émis le : ${dateEmission}`, 20, 210);

    // Insertion du QR code
    doc.addImage(qrDataUrl, "PNG", 150, 60, 40, 40);

    // Sauvegarde du PDF
    const nomFichier = `Recu_${numeroReference}_${donneesVente.noms}.pdf`;
    doc.save(nomFichier);

    return {
      numeroFacture: numeroReference,
      dateFacture: new Date().toLocaleDateString("fr-FR"),
      client: donneesVente.client_name,
      montant: donneesVente.montant_ttc,
    };
  };

  // Fonction de validation des champs obligatoires
  const validateForm = () => {
    const newErrors = {};

    // Vérification des champs obligatoires
    if (!ticketForm.nom.trim()) {
      newErrors.nom = "Le nom est obligatoire";
    }
    if (!ticketForm.prenom.trim()) {
      newErrors.prenom = "Le prénom est obligatoire";
    }
    if (!ticketForm.numero_piece.trim()) {
      newErrors.numero_piece = "Le numéro de pièce d'identité est obligatoire";
    }
    if (!ticketForm.telephone.trim()) {
      newErrors.telephone = "Le numéro de téléphone est obligatoire";
    }
    if (!ticketForm.adresse.trim()) {
      newErrors.adresse = "L'adresse est obligatoire";
    }
    if (ticketForm.trajets_selectionnes.length === 0) {
      newErrors.trajets = "Vous devez sélectionner au moins un trajet";
    }
    if (
      ticketForm.type_passager === "Bébé" &&
      !ticketForm.numero_billet_parent.trim()
    ) {
      newErrors.numero_billet_parent =
        "Le numéro de billet du parent est obligatoire pour un bébé";
    }

    // Validation du téléphone (format simple)
    if (
      ticketForm.telephone &&
      !/^[0-9+\-\s]{8,}$/.test(ticketForm.telephone)
    ) {
      newErrors.telephone = "Le numéro de téléphone n'est pas valide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fonction pour mettre à jour le formulaire de billet
  const handleTicketFormChange = (field, value) => {
    setTicketForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fonction pour gérer la sélection des trajets
  const handleTrajetSelection = (trajetIndex, isSelected) => {
    setTicketForm((prev) => {
      const newTrajets = isSelected
        ? [...prev.trajets_selectionnes, trajetIndex]
        : prev.trajets_selectionnes.filter((index) => index !== trajetIndex);

      return {
        ...prev,
        trajets_selectionnes: newTrajets,
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
      Adulte: 1,
      Enfant: 0.5,
      Bébé: 0.1,
    };

    // Multiplicateur selon la classe
    const multiplicateurClasse = {
      Economie: 1,
      Vip: 1.5,
    };

    // Le type de voyage est fixé à aller_simple
    total =
      ticketForm.trajets_selectionnes.length *
      prixBase *
      multiplicateurPassager[ticketForm.type_passager] *
      multiplicateurClasse[ticketForm.classe];

    setMontantTotal(Math.round(total));
  }, [ticketForm, voyage]);

  // Fonction pour vérifier la disponibilité des places
  const verifierDisponibilite = async () => {
    const voyageRef = doc(db, "voyages", voyage.id);
    const voyageSnapshot = await getDoc(voyageRef);

    if (!voyageSnapshot.exists()) {
      throw new Error("Voyage introuvable");
    }

    const voyageData = voyageSnapshot.data();
    const placesDisponibles =
      ticketForm.classe === "Economie"
        ? (voyageData.place_disponible_eco || 0) -
          (voyageData.place_prise_eco || 0)
        : (voyageData.place_disponible_vip || 0) -
          (voyageData.place_prise_vip || 0);

    if (placesDisponibles < 1) {
      throw new Error(
        `Plus de places disponibles en classe ${ticketForm.classe}`
      );
    }

    return voyageData;
  };

  // Fonction pour soumettre le formulaire
  const handleTicketSubmit = async (e) => {
    e.preventDefault();

    // Validation avant soumission
    if (!validateForm()) {
      alert("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Début de l'enregistrement du billet...");

      // Vérifier la disponibilité des places en temps réel
      const voyageActuel = await verifierDisponibilite();

      // Utilisation d'une transaction atomique Firebase
      const result = await runTransaction(db, async (transaction) => {
        // 1. Mettre à jour les places prises dans la collection Voyage
        const voyageRef = doc(db, "voyages", voyage.id);
        const placeField =
          ticketForm.classe === "Economie"
            ? "place_prise_eco"
            : "place_prise_vip";
        const currentPlaces =
          ticketForm.classe === "Economie"
            ? voyageActuel.place_prise_eco || 0
            : voyageActuel.place_prise_vip || 0;

        transaction.update(voyageRef, {
          [placeField]: currentPlaces + 1,
        });
        console.log("Places mises à jour dans le voyage");

        // 2. Vérifier/créer le client dans la collection clients
        let clientReference = null;
        const clientsQuery = query(
          collection(db, "clients"),
          where("type_piece", "==", ticketForm.type_piece),
          where("numero_piece", "==", ticketForm.numero_piece)
        );

        const clientsSnapshot = await getDocs(clientsQuery);

        if (!clientsSnapshot.empty) {
          // Client existe déjà
          const clientDoc = clientsSnapshot.docs[0];
          clientReference = clientDoc.id;
          console.log("Client existant trouvé:", clientReference);
        } else {
          // Créer nouveau client
          const nouveauClient = {
            nom: ticketForm.nom,
            prenom: ticketForm.prenom,
            adresse: ticketForm.adresse,
            telephone: ticketForm.telephone,
            numero_piece: ticketForm.numero_piece,
            type_de_piece: ticketForm.type_piece,
            sexe: ticketForm.sexe,
            createAt: serverTimestamp(),
            display_name: ticketForm.nom + " " + ticketForm.prenom,
          };

          const clientDocRef = doc(collection(db, "clients"));
          transaction.set(clientDocRef, nouveauClient);
          clientReference = clientDocRef.id;
          console.log("Nouveau client créé:", clientReference);
        }

        // 3. Enregistrer la vente dans la collection vente
        const nouvelleVente = {
          noms: ticketForm.nom || "",
          prenoms: ticketForm.prenom || "",
          adresse: ticketForm.adresse || "",
          tel: ticketForm.telephone || "",
          numero: ticketForm.numero_piece || "",
          type_piece: ticketForm.type_piece || "",
          montant_ttc: montantTotal || 0,
          numero_billet_parent:
            ticketForm.type_passager === "Bébé"
              ? ticketForm.numero_billet_parent || ""
              : "",
          classe: ticketForm.classe || "",
          create_time: serverTimestamp(),
          statuts: "Payer",
          voyage_reference: voyageRef || "",
          trajet: (ticketForm.trajets_selectionnes || []).map((index) =>
            voyage?.trajet && voyage.trajet[index] ? voyage.trajet[index] : {}
          ),
          client_reference: clientReference || "",
          client_name: `${ticketForm.prenom || ""} ${
            ticketForm.nom || ""
          }`.trim(),
          type_paiement: "Mobile Money",
          agent_reference: "",
          agent_name: "",
          sexe_client: ticketForm.sexe || "",
          isGo: false,
          agence_reference: voyage?.agence_reference || "",
          agence_name: voyage?.agence_name || "",
          type_passager: ticketForm.type_passager || "",
          type_voyage: "Aller simple",
          createAt: serverTimestamp(),
        };

        // Nettoyer les valeurs undefined et null de manière plus robuste
        Object.keys(nouvelleVente).forEach((key) => {
          if (nouvelleVente[key] === undefined || nouvelleVente[key] === null) {
            if (key === "montant_ttc") {
              nouvelleVente[key] = 0;
            } else if (Array.isArray(nouvelleVente[key])) {
              nouvelleVente[key] = [];
            } else {
              nouvelleVente[key] = "";
            }
          }
          // Nettoyer les objets imbriqués dans trajet
          if (key === "trajet" && Array.isArray(nouvelleVente[key])) {
            nouvelleVente[key] = nouvelleVente[key].map((trajetItem) => {
              const cleanedTrajet = {};
              Object.keys(trajetItem).forEach((trajetKey) => {
                if (
                  trajetItem[trajetKey] === undefined ||
                  trajetItem[trajetKey] === null
                ) {
                  cleanedTrajet[trajetKey] = "";
                } else {
                  cleanedTrajet[trajetKey] = trajetItem[trajetKey];
                }
              });
              return cleanedTrajet;
            });
          }
        });

        const venteDocRef = doc(collection(db, "ventes"));
        transaction.set(venteDocRef, nouvelleVente);
        console.log("Vente enregistrée:", venteDocRef.id);

        // 4. Créer la sous-collection transaction AVS-820V
        const transactionData = {
          montant_total: montantTotal || 0,
          statuts: "actif",
          taxes: 0,
          createAt: serverTimestamp(),
          agentName: "",
          agentReference: "",
          agenceName: voyage?.agence_name || "",
          agenceReference: voyage?.agence_reference || "",
        };

        // Nettoyer les données de transaction
        Object.keys(transactionData).forEach((key) => {
          if (
            transactionData[key] === undefined ||
            transactionData[key] === null
          ) {
            if (key === "montant_total" || key === "taxes") {
              transactionData[key] = 0;
            } else {
              transactionData[key] = "";
            }
          }
        });

        const transactionDocRef = doc(
          collection(db, "ventes", venteDocRef.id, "transactions_vente")
        );
        transaction.set(transactionDocRef, transactionData);
        console.log("Transaction créée");

        return { venteId: venteDocRef.id, nouvelleVente };
      });

      // 5. Générer et télécharger la facture PDF
      const factureData = await genererFacturePDF(
        result.venteId,
        result.nouvelleVente
      );
      console.log("Facture générée et téléchargée:", factureData);

      alert(
        `Billet réservé avec succès pour un montant de ${montantTotal.toLocaleString()} FCFA\nNuméro de vente: ${
          result.venteId
        }\nFacture: ${
          factureData.numeroFacture
        }\n\nLa facture a été téléchargée automatiquement.`
      );

      // Fermer complètement le modal après succès
      const modalElement = document.getElementById("ticketModal");
      if (modalElement) {
        try {
          // Essayer la méthode jQuery (Bootstrap 4/5 avec jQuery)
          if (window.$ && window.$.fn.modal) {
            window.$("#ticketModal").modal("hide");
          }
          // Sinon essayer la méthode Bootstrap native
          else if (
            window.bootstrap &&
            window.bootstrap.Modal &&
            window.bootstrap.Modal.getInstance
          ) {
            const modal = window.bootstrap.Modal.getInstance(modalElement);
            if (modal) {
              modal.hide();
            }
          }
        } catch (e) {
          console.warn("Erreur lors de la fermeture du modal:", e);
        }

        // Nettoyage manuel complet (toujours exécuté pour garantir la fermeture)
        setTimeout(() => {
          modalElement.classList.remove("show", "fade");
          modalElement.style.display = "none";
          modalElement.setAttribute("aria-hidden", "true");
          modalElement.removeAttribute("aria-modal");
          modalElement.removeAttribute("role");

          // Supprimer toutes les classes modal du body
          document.body.classList.remove("modal-open");
          document.body.style.overflow = "";
          document.body.style.paddingRight = "";

          // Supprimer tous les backdrops
          const backdrops = document.querySelectorAll(".modal-backdrop");
          backdrops.forEach((backdrop) => backdrop.remove());
        }, 100);

        // Reset du formulaire
        setTicketForm({
          type_voyage: "aller_simple",
          type_passager: "Adulte",
          classe: "Economie",
          type_piece: "Carte d'identité",
          numero_piece: "",
          nom: "",
          prenom: "",
          sexe: "Masculin",
          telephone: "",
          adresse: "",
          trajets_selectionnes: [],
          numero_billet_parent: "",
        });

        setErrors({});
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      alert(`Erreur lors de l'enregistrement du billet: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
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
                                  {/* <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Statut
                                      </span>
                                      <span className="profile-ud-value">
                                        {voyage?.statut}
                                      </span>
                                    </div>
                                  </div> */}
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
                                  <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Places disponibles Économique
                                      </span>
                                      <span className="profile-ud-value">
                                        {Math.max(
                                          0,
                                          (voyage?.place_disponible_eco || 0) -
                                            (voyage?.place_prise_eco || 0)
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="profile-ud-item">
                                    <div className="profile-ud wider">
                                      <span className="profile-ud-label">
                                        Places disponibles VIP
                                      </span>
                                      <span className="profile-ud-value">
                                        {Math.max(
                                          0,
                                          (voyage?.place_disponible_vip || 0) -
                                            (voyage?.place_prise_vip || 0)
                                        )}
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
      <div
        className="modal fade"
        id="ticketModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="ticketModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="ticketModalLabel">
                Réservation de billet - {voyage?.libelle_bateau}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
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
                        <p className="mb-1">
                          Économique:{" "}
                          {Math.max(
                            0,
                            (voyage?.place_disponible_eco || 0) -
                              (voyage?.place_prise_eco || 0)
                          )}
                        </p>
                        <p className="mb-0">
                          VIP:{" "}
                          {Math.max(
                            0,
                            (voyage?.place_disponible_vip || 0) -
                              (voyage?.place_prise_vip || 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <h6 className="card-title">Montant total</h6>
                        <h4 className="mb-0">
                          {montantTotal.toLocaleString()} FCFA
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Type de passager */}
                <div className="form-group mb-3">
                  <label className="form-label">Type de passager</label>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="custom-control custom-radio mb-2">
                        <input
                          type="radio"
                          id="Adulte"
                          defaultChecked
                          name="type_passager"
                          className="custom-control-input"
                          checked={ticketForm.type_passager === "Adulte"}
                          onChange={() =>
                            handleTicketFormChange("type_passager", "Adulte")
                          }
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="Adulte"
                        >
                          Adulte
                        </label>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="custom-control custom-radio mb-2">
                        <input
                          type="radio"
                          id="Enfant"
                          name="type_passager"
                          className="custom-control-input"
                          checked={ticketForm.type_passager === "Enfant"}
                          onChange={() =>
                            handleTicketFormChange("type_passager", "Enfant")
                          }
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="Enfant"
                        >
                          Enfant
                        </label>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="custom-control custom-radio mb-2">
                        <input
                          type="radio"
                          id="Bébé"
                          name="type_passager"
                          className="custom-control-input"
                          checked={ticketForm.type_passager === "Bébé"}
                          onChange={() =>
                            handleTicketFormChange("type_passager", "Bébé")
                          }
                        />
                        <label className="custom-control-label" htmlFor="Bébé">
                          Bébé
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Champ conditionnel : Code ticket parent pour bébé */}
                {ticketForm.type_passager === "Bébé" && (
                  <div className="form-group mb-3">
                    <label
                      className="form-label"
                      htmlFor="numero_billet_parent"
                    >
                      Code du ticket du parent{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="numero_billet_parent"
                      placeholder="Entrez le code du ticket du parent"
                      value={ticketForm.numero_billet_parent}
                      onChange={(e) =>
                        handleTicketFormChange(
                          "numero_billet_parent",
                          e.target.value
                        )
                      }
                    />
                    {errors.numero_billet_parent && (
                      <div className="text-danger mt-1">
                        {errors.numero_billet_parent}
                      </div>
                    )}
                  </div>
                )}

                {/* Classe */}
                <div className="form-group mb-3">
                  <label className="form-label" htmlFor="classe">
                    Classe
                  </label>
                  <select
                    className="form-control"
                    id="classe"
                    value={ticketForm.classe}
                    onChange={(e) =>
                      handleTicketFormChange("classe", e.target.value)
                    }
                  >
                    <option value="Economie">Économique</option>
                    <option value="Vip">VIP</option>
                  </select>
                </div>

                <div className="row">
                  {/* Type de pièce d'identité */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="type_piece">
                        Type de pièce d'identité
                      </label>
                      <select
                        className="form-control"
                        id="type_piece"
                        value={ticketForm.type_piece}
                        onChange={(e) =>
                          handleTicketFormChange("type_piece", e.target.value)
                        }
                        required
                      >
                        <option value="Carte d'identité">
                          Carte d'identité
                        </option>
                        <option value="Passeport">Passeport</option>
                        <option value="Acte de Naissance">
                          Acte de Naissance
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Numéro de pièce */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="numero_piece">
                        Numéro de pièce d'identité
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="numero_piece"
                        value={ticketForm.numero_piece}
                        onChange={(e) =>
                          handleTicketFormChange("numero_piece", e.target.value)
                        }
                        required
                      />
                      {errors.numero_piece && (
                        <small className="text-danger">
                          {errors.numero_piece}
                        </small>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  {/* Nom */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="nom">
                        Nom
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="nom"
                        value={ticketForm.nom}
                        onChange={(e) =>
                          handleTicketFormChange("nom", e.target.value)
                        }
                        required
                      />
                      {errors.nom && (
                        <small className="text-danger">{errors.nom}</small>
                      )}
                    </div>
                  </div>

                  {/* Prénom */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="prenom">
                        Prénom
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="prenom"
                        value={ticketForm.prenom}
                        onChange={(e) =>
                          handleTicketFormChange("prenom", e.target.value)
                        }
                        required
                      />
                      {errors.prenom && (
                        <small className="text-danger">{errors.prenom}</small>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sexe */}
                <div className="form-group mb-3">
                  <label className="form-label">Sexe</label>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="custom-control custom-radio mb-2">
                        <input
                          type="radio"
                          id="sexe_m"
                          name="sexe"
                          className="custom-control-input"
                          checked={ticketForm.sexe === "Masculin"}
                          onChange={() =>
                            handleTicketFormChange("sexe", "Masculin")
                          }
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="sexe_m"
                        >
                          Masculin
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="custom-control custom-radio mb-2">
                        <input
                          type="radio"
                          id="sexe_f"
                          name="sexe"
                          className="custom-control-input"
                          checked={ticketForm.sexe === "Féminin"}
                          onChange={() =>
                            handleTicketFormChange("sexe", "Féminin")
                          }
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="sexe_f"
                        >
                          Féminin
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  {/* Téléphone */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="telephone">
                        Numéro de téléphone
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="telephone"
                        value={ticketForm.telephone}
                        onChange={(e) =>
                          handleTicketFormChange("telephone", e.target.value)
                        }
                        required
                      />
                      {errors.telephone && (
                        <small className="text-danger">
                          {errors.telephone}
                        </small>
                      )}
                    </div>
                  </div>

                  {/* Adresse */}
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="adresse">
                        Adresse
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="adresse"
                        value={ticketForm.adresse}
                        onChange={(e) =>
                          handleTicketFormChange("adresse", e.target.value)
                        }
                        required
                      />
                      {errors.adresse && (
                        <small className="text-danger">{errors.adresse}</small>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sélection des trajets */}
                <div className="form-group mb-4">
                  <label className="form-label">Sélectionner les trajets</label>
                  <div className="border rounded p-3">
                    {voyage?.trajet && voyage.trajet.length > 0 ? (
                      voyage.trajet.map((etape, index) => (
                        <div
                          key={index}
                          className="custom-control col-md-12 custom-checkbox mb-2 ml-1 row"
                        >
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id={`trajet_${index}`}
                            checked={ticketForm.trajets_selectionnes.includes(
                              index
                            )}
                            onChange={(e) =>
                              handleTrajetSelection(index, e.target.checked)
                            }
                          />
                          <label
                            className="custom-control-label"
                            htmlFor={`trajet_${index}`}
                          >
                            <strong>{etape.LieuDeDepartLibelle}</strong>
                            <em className="icon ni ni-arrow-right mx-2"></em>
                            <strong>{etape.LieuDArriverLibelle}</strong>
                            {etape.heure_depart && (
                              <small className="text-muted ml-2">
                                (Départ: {etape.heure_depart})
                              </small>
                            )}
                          </label>
                          <br />
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">Aucun trajet disponible</p>
                    )}
                  </div>
                  {errors.trajets && (
                    <small className="text-danger">{errors.trajets}</small>
                  )}
                </div>

                {/* Montant total (lecture seule) */}
                <div className="form-group mb-3">
                  <label className="form-label" htmlFor="montant_total">
                    Montant total à payer
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    id="montant_total"
                    value={`${montantTotal.toLocaleString()} FCFA`}
                    disabled
                  />
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-dismiss="modal"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      !ticketForm.trajets_selectionnes.length ||
                      !ticketForm.nom ||
                      !ticketForm.prenom ||
                      isSubmitting
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm mr-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Enregistrement en cours...
                      </>
                    ) : (
                      "Réserver le billet"
                    )}
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
