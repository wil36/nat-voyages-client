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
  orderBy,
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
  const [voyageTimestamp, setVoyageTimestamp] = useState(null); // Timestamp original pour Firestore
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // État pour le formulaire de billet avec plusieurs passagers
  const [reservationForm, setReservationForm] = useState({
    type_voyage: "aller_simple", // aller_simple ou aller_retour
    trajets_selectionnes: [], // tableau des indices des trajets sélectionnés - commun à tous
    voyage_retour_id: "", // ID du voyage de retour sélectionné
    passagers: [
      {
        id: 1,
        type_passager: "Adulte", // Adulte, Enfant, Bébé
        classe: "Economie", // Economie ou VIP
        type_piece: "Carte d'identité", // cni, passeport, permis
        numero_piece: "",
        nom: "",
        prenom: "",
        sexe: "Masculin", // Masculin ou Féminin
        telephone: "",
        adresse: "",
      },
    ],
  });

  const [montantTotal, setMontantTotal] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voyagesRetour, setVoyagesRetour] = useState([]);
  const [tousLesVoyages, setTousLesVoyages] = useState([]);
  const [loadingVoyagesRetour, setLoadingVoyagesRetour] = useState(false);
  const [voyageRetourSelectionne, setVoyageRetourSelectionne] = useState(null);

  const handleBackNavigation = () => {
    navigate("/");
  };

  // Fonction pour récupérer les voyages de retour potentiels
  const recupererVoyagesRetour = async () => {
    if (
      !voyage ||
      reservationForm.type_voyage !== "aller_retour" ||
      reservationForm.trajets_selectionnes.length === 0
    ) {
      setVoyagesRetour([]);
      return;
    }

    setLoadingVoyagesRetour(true);
    try {
      // Filtrer pour les voyages de retour potentiels
      const voyageAller = voyage;

      // Normaliser la date du voyage aller
      let dateVoyageAller;
      if (
        voyageAller.date_voyage &&
        typeof voyageAller.date_voyage === "object" &&
        voyageAller.date_voyage.seconds
      ) {
        dateVoyageAller = new Date(voyageAller.date_voyage.seconds * 1000);
      } else {
        dateVoyageAller = new Date(voyageAller.date_voyage);
      }

      const dateAujourdhui = new Date();

      // Extraire les trajets sélectionnés par l'utilisateur dans le bon ordre
      const indicesTriés = [...reservationForm.trajets_selectionnes].sort(
        (a, b) => a - b
      );
      const trajetsSelectionnes = indicesTriés.map(
        (index) => voyageAller.trajet[index]
      );

      if (trajetsSelectionnes.length === 0) {
        setVoyagesRetour([]);
        return;
      }

      // Construire la séquence complète des villes du voyage aller
      const sequenceVillesAller = [];
      trajetsSelectionnes.forEach((trajet, index) => {
        if (index === 0) {
          // Premier trajet : ajouter départ et arrivée
          sequenceVillesAller.push(
            trajet?.LieuDeDepartLibelle || trajet?.lieu_depart
          );
        }
        // Ajouter toujours l'arrivée
        sequenceVillesAller.push(
          trajet?.LieuDArriverLibelle || trajet?.lieu_arrivee
        );
      });

      // La séquence retour est l'inverse de la séquence aller
      const sequenceVillesRetour = [...sequenceVillesAller].reverse();

      const voyagesRetourFiltres = tousLesVoyages.filter((v) => {
        // Vérifier que ce n'est pas le même voyage
        if (v.id === voyageAller.id) return false;

        // Vérifier que la date est >= à aujourd'hui
        let dateVoyageRetour;
        if (
          v.date_voyage &&
          typeof v.date_voyage === "object" &&
          v.date_voyage.seconds
        ) {
          dateVoyageRetour = new Date(v.date_voyage.seconds * 1000);
        } else {
          dateVoyageRetour = new Date(v.date_voyage);
        }
        // if (dateVoyageRetour < dateAujourdhui) return false;
        if (dateVoyageRetour <= dateVoyageAller) return false;
        // Vérifier que le voyage de retour a des trajets qui correspondent à l'inverse des trajets sélectionnés
        if (!v.trajet || v.trajet.length === 0) return false;

        // Construire la séquence des villes du voyage retour candidat
        const sequenceVoyageRetour = [];
        v.trajet.forEach((trajet, index) => {
          if (index === 0) {
            // Premier trajet : ajouter départ et arrivée
            sequenceVoyageRetour.push(
              trajet?.LieuDeDepartLibelle || trajet?.lieu_depart
            );
          }
          // Ajouter toujours l'arrivée
          sequenceVoyageRetour.push(
            trajet?.LieuDArriverLibelle || trajet?.lieu_arrivee
          );
        });

        // Vérifier si la séquence du voyage candidat contient la séquence retour recherchée
        const containsReturnSequence = sequenceVillesRetour.every(
          (ville, index) => {
            if (index === sequenceVillesRetour.length - 1) return true; // Dernière ville, pas besoin de vérifier

            // Chercher cette ville et la suivante dans la séquence du voyage candidat
            const villeIndex = sequenceVoyageRetour.indexOf(ville);
            if (villeIndex === -1) return false;

            const villeSuivante = sequenceVillesRetour[index + 1];
            return sequenceVoyageRetour[villeIndex + 1] === villeSuivante;
          }
        );

        return containsReturnSequence;
      });

      setVoyagesRetour(voyagesRetourFiltres);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des voyages de retour:",
        error
      );
      setVoyagesRetour([]);
    } finally {
      setLoadingVoyagesRetour(false);
    }
  };

  // Fonction pour gérer le changement de type de voyage
  const handleTypeVoyageChange = (typeVoyage) => {
    setReservationForm((prev) => ({
      ...prev,
      type_voyage: typeVoyage,
      voyage_retour_id:
        typeVoyage === "aller_simple" ? "" : prev.voyage_retour_id,
    }));

    if (typeVoyage === "aller_retour") {
      recupererVoyagesRetour();
    } else {
      setVoyagesRetour([]);
      setVoyageRetourSelectionne(null);
    }
  };

  // Fonction pour gérer la sélection du voyage de retour
  const handleVoyageRetourChange = (voyageRetourId) => {
    setReservationForm((prev) => ({
      ...prev,
      voyage_retour_id: voyageRetourId,
    }));

    const voyageRetour = voyagesRetour.find((v) => v.id === voyageRetourId);
    setVoyageRetourSelectionne(voyageRetour);
  };

  // Fonctions de gestion des passagers
  const ajouterPassager = () => {
    const nouveauPassager = {
      id: Date.now(),
      type_passager: "Adulte",
      classe: "Economie",
      type_piece: "Carte d'identité",
      numero_piece: "",
      nom: "",
      prenom: "",
      sexe: "Masculin",
      telephone: "",
      adresse: "",
    };

    setReservationForm((prev) => ({
      ...prev,
      passagers: [...prev.passagers, nouveauPassager],
    }));
  };

  const supprimerPassager = (passagerId) => {
    if (reservationForm.passagers.length > 1) {
      setReservationForm((prev) => ({
        ...prev,
        passagers: prev.passagers.filter((p) => p.id !== passagerId),
      }));
    }
  };

  const mettreAJourPassager = (passagerId, field, value) => {
    setReservationForm((prev) => ({
      ...prev,
      passagers: prev.passagers.map((passager) =>
        passager.id === passagerId ? { ...passager, [field]: value } : passager
      ),
    }));
  };

  const mettreAJourTrajets = (trajetIndex, isSelected) => {
    setReservationForm((prev) => {
      const newTrajets = isSelected
        ? [...prev.trajets_selectionnes, trajetIndex]
        : prev.trajets_selectionnes.filter((index) => index !== trajetIndex);

      return {
        ...prev,
        trajets_selectionnes: newTrajets,
      };
    });
  };

  // Effect pour surveiller les changements de trajets sélectionnés et relancer la recherche des voyages retour
  useEffect(() => {
    if (reservationForm.type_voyage === "aller_retour") {
      if (reservationForm.trajets_selectionnes.length > 0) {
        recupererVoyagesRetour();
      } else {
        setVoyagesRetour([]);
        setVoyageRetourSelectionne(null);
      }
    }
  }, [reservationForm.trajets_selectionnes, reservationForm.type_voyage]);

  // Fonction pour générer et télécharger le reçu PDF
  const genererFacturePDF = async (
    venteId,
    donneesVente,
    previewOnly = false
  ) => {
    const doc = new jsPDF("landscape"); // Mode paysage

    // Génération du QR code
    const qrData = `${venteId}`;
    const qrDataUrl = await QRCode.toDataURL(qrData);

    // Titre principal
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("NAT VOYAGE - Réservez en un clic, voyagez partout", 20, 20);

    // Infos de l'entreprise
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Agence: ${donneesVente.agence_name || "Agence Principale"}`,
      20,
      28
    );
    doc.text("Tél: +225 XX XX XX XX", 20, 34);
    doc.text("Email: contact@natvoyage.ci", 20, 40);

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
    doc.text(
      `Numéro de référence : ${donneesVente.numero_billet || venteId}`,
      20,
      112
    );
    doc.text(
      `Nom et prénom du passager : ${donneesVente.prenoms} ${donneesVente.noms}`,
      20,
      118
    );
    doc.text(`Tel : ${donneesVente.tel}`, 20, 124);
    doc.text(`Type de passager : ${donneesVente.type_passager}`, 20, 130);
    doc.text(`Classe : ${donneesVente.classe}`, 20, 136);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Montant TTC : ${donneesVente.montant_ttc.toLocaleString("fr-FR")} FCFA`,
      20,
      142
    );
    doc.setFont("helvetica", "normal");
    doc.text(`Encaissé par : Système NAT VOYAGE`, 20, 148);

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

    // Insertion du QR code (ajusté pour paysage)
    doc.addImage(qrDataUrl, "PNG", 220, 60, 40, 40);

    // Date et heure d'émission + Bon voyage en bas à droite
    const dateEmission = new Date().toLocaleString("fr-FR");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Émis le : ${dateEmission}`, 220, 185);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Bon voyage et à bientôt !", 235, 195);

    // Prévisualisation ou téléchargement
    const nomFichier = `Recu_${donneesVente.numero_billet || venteId}_${
      donneesVente.noms
    }.pdf`;

    if (previewOnly) {
      // Ouvrir une nouvelle fenêtre avec prévisualisation
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const previewWindow = window.open(pdfUrl, "_blank");
      previewWindow.onload = () => {
        URL.revokeObjectURL(pdfUrl);
      };
      return {
        numeroFacture: donneesVente.numero_billet || venteId,
        dateFacture: new Date().toLocaleDateString("fr-FR"),
      };
    } else {
      // Télécharger le PDF
      doc.save(nomFichier);
    }

    return {
      numeroFacture: numeroReference,
      dateFacture: new Date().toLocaleDateString("fr-FR"),
      client: donneesVente.client_name,
      montant: donneesVente.montant_ttc,
    };
  };

  // Fonction pour générer un PDF multi-pages (une page par passager)
  const genererFactureMultiPassagers = async (ventes) => {
    const doc = new jsPDF("landscape");

    // Grouper les ventes par passager pour les voyages aller-retour
    const passagersGroup = {};
    ventes.forEach((vente, index) => {
      const passagerKey = `${vente.prenoms}_${vente.noms}_${vente.numero}`;
      if (!passagersGroup[passagerKey]) {
        passagersGroup[passagerKey] = [];
      }
      passagersGroup[passagerKey].push({ vente, originalIndex: index });
    });

    let pageCount = 0;
    for (const [passagerKey, ventesPassager] of Object.entries(
      passagersGroup
    )) {
      const passagerIndex = Object.keys(passagersGroup).indexOf(passagerKey);

      for (const venteData of ventesPassager) {
        const vente = venteData.vente;

        // Ajouter une nouvelle page (sauf pour la première)
        if (pageCount > 0) {
          doc.addPage();
        }
        pageCount++;

        // Déterminer le label du passager
        let passagerLabel = `Passager ${passagerIndex + 1}`;
        if (vente.sens_voyage) {
          passagerLabel += ` (${vente.sens_voyage})`;
        }

        // Génération du QR code pour ce passager
        const qrData = `${vente.id_vente}`;
        const qrDataUrl = await QRCode.toDataURL(qrData);

        // Titre principal
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("NAT VOYAGE - Réservez en un clic, voyagez partout.", 20, 20);

        // Infos de l'entreprise
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Agence: ${vente.agence_name || "Agence Principale"}`, 20, 28);
        doc.text("Tél: +225 XX XX XX XX", 20, 34);
        doc.text("Email: contact@natvoyages.ci", 20, 40);

        // Ligne séparatrice
        doc.line(20, 45, 190, 45);

        // Sous-titre avec numéro de passager
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(`BILLET ELECTRONIQUE - ${passagerLabel}`, 20, 55);

        // Détails du voyage
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("DETAILS DU VOYAGE", 20, 65);
        // Extraire les villes de départ et d'arrivée uniquement du trajet de la vente
        const premierTrajet = vente.trajet?.[0];
        const dernierTrajet = vente.trajet?.[vente.trajet?.length - 1];
        const villeDepart =
          premierTrajet?.LieuDeDepartLibelle ||
          premierTrajet?.lieu_depart ||
          "N/A";
        const villeArrivee =
          dernierTrajet?.LieuDArriverLibelle ||
          dernierTrajet?.lieu_arrivee ||
          "N/A";

        // Formater la date de voyage
        let dateVoyageFormatee = "N/A";
        if (vente?.date_voyage) {
          if (vente.date_voyage instanceof Date) {
            dateVoyageFormatee =
              vente.date_voyage.toLocaleDateString("fr-FR") +
              " " +
              vente.date_voyage.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              });
          } else if (typeof vente.date_voyage === "string") {
            dateVoyageFormatee = vente.date_voyage;
          }
        }

        doc.text(`Ville de départ : ${villeDepart}`, 20, 72);
        doc.text(`Ville d'arrivée : ${villeArrivee}`, 20, 78);
        doc.text(`Date de voyage : ${dateVoyageFormatee}`, 20, 84);
        doc.text(
          `Moyen de transport : ${vente?.type_bateau_libelle || "N/A"}`,
          20,
          90
        );

        doc.text("Franchise de bagage : 20kgs", 20, 96);

        // Réservation
        doc.setFont("helvetica", "bold");
        doc.text("DETAILS DE LA RESERVATION", 20, 105);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Numéro de référence : ${vente.numero_billet || vente.id}`,
          20,
          112
        );
        doc.text(
          `Nom et prénom du passager : ${vente.prenoms} ${vente.noms}`,
          20,
          118
        );
        doc.text(`Tel : ${vente.tel}`, 20, 124);
        doc.text(`Type de passager : ${vente.type_passager}`, 20, 130);
        doc.text(`Classe : ${vente.classe}`, 20, 136);
        doc.setFont("helvetica", "bold");
        doc.text(
          `Montant TTC : ${vente.montant_ttc
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`,
          20,
          142
        );
        doc.setFont("helvetica", "normal");
        doc.text(`Encaissé par : Système NAT VOYAGE`, 20, 148);

        // Informations additionnelles si bébé
        if (vente.numero_billet_parent) {
          doc.text(`Ticket parent : ${vente.numero_billet_parent}`, 20, 154);
        }

        // Infos additionnelles
        doc.setFont("helvetica", "bold");
        doc.text("INFORMATIONS ADDITIONNELLES", 20, 170);
        doc.setFont("helvetica", "normal");
        doc.text("Billet non remboursable valable 3 mois", 20, 177);
        doc.text(
          "Pénalité changement de date : à partir de 5000 FCFA",
          20,
          183
        );
        doc.text("Pénalité départ manqué : 8000 FCFA", 20, 189);
        doc.text("Pénalité autre modification : 5000 FCFA", 20, 195);

        // Insertion du QR code
        doc.addImage(qrDataUrl, "PNG", 220, 60, 40, 40);

        // Date et heure d'émission + Bon voyage
        const dateEmission = new Date().toLocaleString("fr-FR");
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(`Émis le : ${dateEmission}`, 220, 185);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Bon voyage et à bientôt !", 235, 195);
      }
    }

    // 1. D'abord ouvrir la prévisualisation dans une nouvelle fenêtre
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const previewWindow = window.open(pdfUrl, "_blank");

    // Configurer la fenêtre de prévisualisation
    if (previewWindow) {
      previewWindow.document.title = `Billets - ${ventes.length} passager${
        ventes.length > 1 ? "s" : ""
      }`;

      // Nettoyer l'URL après ouverture
      previewWindow.onload = () => {
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 1000);
      };
    }

    // 2. Puis déclencher le téléchargement après un petit délai
    setTimeout(() => {
      const dateStr = new Date().toISOString().split("T")[0];
      const nomFichier = `Billets_${dateStr}_${ventes.length}passagers.pdf`;
      doc.save(nomFichier);
    }, 1000); // Délai de 1 seconde pour laisser la prévisualisation s'ouvrir

    return true;
  };

  // Fonction de validation des champs obligatoires pour plusieurs passagers
  const validateForm = () => {
    const newErrors = {};

    // Vérifier la sélection des trajets (commun à tous)
    if (reservationForm.trajets_selectionnes.length === 0) {
      newErrors.trajets = "Vous devez sélectionner au moins un trajet";
    }

    // Vérifier le voyage de retour si aller-retour
    if (reservationForm.type_voyage === "aller_retour") {
      if (!reservationForm.voyage_retour_id) {
        newErrors.voyage_retour = "Vous devez sélectionner un voyage de retour";
      }
    }

    // Vérifier qu'il y a au moins un passager
    if (reservationForm.passagers.length === 0) {
      newErrors.passagers = "Vous devez ajouter au moins un passager";
    }

    // Compter les adultes et bébés
    const adultes = reservationForm.passagers.filter(
      (p) => p.type_passager === "Adulte"
    );
    const bebes = reservationForm.passagers.filter(
      (p) => p.type_passager === "Bébé"
    );

    // Vérifier qu'il y a au moins un adulte si des bébés sont présents
    if (bebes.length > 0 && adultes.length === 0) {
      alert(
        "❌ Il doit y avoir au moins un adulte pour accompagner les bébés !"
      );
      return false;
    }

    // Vérifier chaque passager
    reservationForm.passagers.forEach((passager, index) => {
      const passagerErrors = {};

      if (!passager.nom.trim()) {
        passagerErrors.nom = "Le nom est obligatoire";
      }
      if (!passager.prenom.trim()) {
        passagerErrors.prenom = "Le prénom est obligatoire";
      }
      if (!passager.numero_piece.trim()) {
        passagerErrors.numero_piece =
          "Le numéro de pièce d'identité est obligatoire";
      }
      if (!passager.telephone.trim()) {
        passagerErrors.telephone = "Le numéro de téléphone est obligatoire";
      }
      if (!passager.adresse.trim()) {
        passagerErrors.adresse = "L'adresse est obligatoire";
      }

      // Validation du téléphone (format simple)
      if (passager.telephone && !/^[0-9+\-\s]{8,}$/.test(passager.telephone)) {
        passagerErrors.telephone = "Le numéro de téléphone n'est pas valide";
      }

      // Si il y a des erreurs pour ce passager, les ajouter à newErrors
      if (Object.keys(passagerErrors).length > 0) {
        newErrors[`passager_${index}`] = passagerErrors;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calcul automatique du montant total pour tous les passagers
  React.useEffect(() => {
    if (
      !voyage ||
      !reservationForm.trajets_selectionnes.length ||
      !reservationForm.passagers.length
    ) {
      setMontantTotal(0);
      return;
    }

    // Vérifier si aller-retour et voyage de retour sélectionné
    if (
      reservationForm.type_voyage === "aller_retour" &&
      !voyageRetourSelectionne
    ) {
      setMontantTotal(0);
      return;
    }

    let total = 0;

    // Fonction pour obtenir le tarif d'un trajet selon le type de passager et la classe
    const obtenirTarifTrajet = (trajet, typePassager, classe) => {
      let tarif = 0;

      // Sélectionner le tarif selon le type de passager et la classe
      if (typePassager === "Adulte") {
        tarif =
          classe === "VIP"
            ? trajet.tarif_adulte_vip || 0
            : trajet.tarif_adulte || 0;
      } else if (typePassager === "Enfant") {
        tarif =
          classe === "VIP"
            ? trajet.tarif_enfant_vip || 0
            : trajet.tarif_enfant || 0;
      } else if (typePassager === "Bébé") {
        tarif =
          classe === "VIP" ? trajet.tarif_bb_vip || 0 : trajet.tarif_bb || 0;
      }

      return tarif;
    };

    // Calculer le prix pour chaque passager
    reservationForm.passagers.forEach((passager) => {
      let prixPassagerTotal = 0;

      // Calculer le prix pour les trajets aller sélectionnés
      reservationForm.trajets_selectionnes.forEach((trajetIndex) => {
        const trajet = voyage?.trajet?.[trajetIndex];
        if (trajet) {
          prixPassagerTotal += obtenirTarifTrajet(
            trajet,
            passager.type_passager,
            passager.classe
          );
        }
      });

      // Si aller-retour, ajouter le prix du retour
      if (
        reservationForm.type_voyage === "aller_retour" &&
        voyageRetourSelectionne
      ) {
        // Calculer le prix pour tous les trajets du voyage retour sélectionné
        voyageRetourSelectionne.trajet?.forEach((trajetRetour) => {
          prixPassagerTotal += obtenirTarifTrajet(
            trajetRetour,
            passager.type_passager,
            passager.classe
          );
        });
      }

      total += prixPassagerTotal;
    });

    setMontantTotal(Math.round(total));
  }, [reservationForm, voyage, voyageRetourSelectionne]);

  // Fonction pour vérifier la disponibilité des places pour tous les passagers
  const verifierDisponibilite = async () => {
    const voyageRef = doc(db, "voyages", location.state.voyageId);
    const voyageSnapshot = await getDoc(voyageRef);

    if (!voyageSnapshot.exists()) {
      throw new Error("Voyage introuvable");
    }

    const voyageData = voyageSnapshot.data();

    // Compter les places nécessaires par classe
    const placesNecessaires = {
      Economie: 0,
      VIP: 0,
    };

    reservationForm.passagers.forEach((passager) => {
      placesNecessaires[passager.classe]++;
    });

    // Vérifier la disponibilité pour chaque classe
    const placesDispoEco =
      (voyageData.place_disponible_eco || 0) -
      (voyageData.place_prise_eco || 0);
    const placesDispoVip =
      (voyageData.place_disponible_vip || 0) -
      (voyageData.place_prise_vip || 0);

    if (placesNecessaires.Economie > placesDispoEco) {
      throw new Error(
        `Pas assez de places en classe Économie (${placesNecessaires.Economie} demandées, ${placesDispoEco} disponibles)`
      );
    }

    if (placesNecessaires.VIP > placesDispoVip) {
      throw new Error(
        `Pas assez de places en classe VIP (${placesNecessaires.VIP} demandées, ${placesDispoVip} disponibles)`
      );
    }

    return { voyageData, placesNecessaires };
  };

  // Fonction pour soumettre le formulaire avec plusieurs passagers
  const handleTicketSubmit = async (e) => {
    e.preventDefault();

    // Validation avant soumission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Vérifier la disponibilité des places en temps réel
      const { voyageData, placesNecessaires } = await verifierDisponibilite();

      // Trier les passagers : Adultes et Enfants d'abord, Bébés en dernier
      const passagersOrdonnes = [
        ...reservationForm.passagers.filter((p) => p.type_passager !== "Bébé"),
        ...reservationForm.passagers.filter((p) => p.type_passager === "Bébé"),
      ];

      // Pré-traitement : vérifier tous les clients en dehors de la transaction
      const clientsData = [];
      for (const passager of passagersOrdonnes) {
        const clientsQuery = query(
          collection(db, "clients"),
          where("type_piece", "==", passager.type_piece),
          where("numero_piece", "==", passager.numero_piece)
        );
        const clientsSnapshot = await getDocs(clientsQuery);
        clientsData.push({
          passager,
          existingClientId: clientsSnapshot.empty
            ? null
            : clientsSnapshot.docs[0].id,
        });
      }

      // Utilisation d'une transaction atomique Firebase
      const result = await runTransaction(db, async (transaction) => {
        const ventes = [];
        const voyageRef = doc(db, "voyages", location.state.voyageId);
        let premierAdulteTicketId = null; // Pour les bébés

        // 1. TOUTES LES LECTURES D'ABORD - Double vérification des places
        const voyageDoc = await transaction.get(voyageRef);
        if (!voyageDoc.exists()) {
          throw new Error("Voyage introuvable");
        }

        const currentVoyageData = voyageDoc.data();
        let currentVoyageRetourData = null;

        // Récupérer les informations du bateau à partir de bateau_reference
        let bateauData = null;
        if (currentVoyageData.bateau) {
          const bateauDoc = await transaction.get(currentVoyageData.bateau);
          if (bateauDoc.exists()) {
            bateauData = bateauDoc.data();
          }
        }

        // Lecture du voyage retour si nécessaire
        if (
          reservationForm.type_voyage === "aller_retour" &&
          reservationForm.voyage_retour_id
        ) {
          const voyageRetourRef = doc(
            db,
            "voyages",
            reservationForm.voyage_retour_id
          );
          const voyageRetourDoc = await transaction.get(voyageRetourRef);

          if (!voyageRetourDoc.exists()) {
            throw new Error("Voyage de retour introuvable");
          }
          currentVoyageRetourData = voyageRetourDoc.data();
        }

        // Vérifications des places
        const placesDispoEcoActuelles =
          (currentVoyageData.place_disponible_eco || 0) -
          (currentVoyageData.place_prise_eco || 0);
        const placesDispoVipActuelles =
          (currentVoyageData.place_disponible_vip || 0) -
          (currentVoyageData.place_prise_vip || 0);

        if (placesNecessaires.Economie > placesDispoEcoActuelles) {
          throw new Error(
            `Plus assez de places Économie disponibles (${placesNecessaires.Economie} demandées, ${placesDispoEcoActuelles} disponibles)`
          );
        }

        if (placesNecessaires.VIP > placesDispoVipActuelles) {
          throw new Error(
            `Plus assez de places VIP disponibles (${placesNecessaires.VIP} demandées, ${placesDispoVipActuelles} disponibles)`
          );
        }
        // Récupérer les informations du bateau retour si nécessaire
        let bateauRetourData = null;
        if (currentVoyageRetourData && currentVoyageRetourData.bateau) {
          const bateauRetourDoc = await transaction.get(
            currentVoyageRetourData.bateau
          );
          if (bateauRetourDoc.exists()) {
            bateauRetourData = bateauRetourDoc.data();
          }
        }

        // Vérifications pour le voyage retour
        if (currentVoyageRetourData) {
          const placesDispoEcoRetour =
            (currentVoyageRetourData.place_disponible_eco || 0) -
            (currentVoyageRetourData.place_prise_eco || 0);
          const placesDispoVipRetour =
            (currentVoyageRetourData.place_disponible_vip || 0) -
            (currentVoyageRetourData.place_prise_vip || 0);

          if (placesNecessaires.Economie > placesDispoEcoRetour) {
            throw new Error(
              `Plus assez de places Économie pour le retour (${placesNecessaires.Economie} demandées, ${placesDispoEcoRetour} disponibles)`
            );
          }

          if (placesNecessaires.VIP > placesDispoVipRetour) {
            throw new Error(
              `Plus assez de places VIP pour le retour (${placesNecessaires.VIP} demandées, ${placesDispoVipRetour} disponibles)`
            );
          }
        }

        // 2. TOUTES LES ÉCRITURES ENSUITE - Mettre à jour les places
        transaction.update(voyageRef, {
          place_prise_eco:
            (currentVoyageData.place_prise_eco || 0) +
            placesNecessaires.Economie,
          place_prise_vip:
            (currentVoyageData.place_prise_vip || 0) + placesNecessaires.VIP,
        });

        // Mettre à jour le voyage retour si nécessaire
        if (currentVoyageRetourData) {
          const voyageRetourRef = doc(
            db,
            "voyages",
            reservationForm.voyage_retour_id
          );
          transaction.update(voyageRetourRef, {
            place_prise_eco:
              (currentVoyageRetourData.place_prise_eco || 0) +
              placesNecessaires.Economie,
            place_prise_vip:
              (currentVoyageRetourData.place_prise_vip || 0) +
              placesNecessaires.VIP,
          });
        }

        // 3. Traiter chaque passager dans l'ordre
        for (const clientData of clientsData) {
          const passager = clientData.passager;
          let clientReference = clientData.existingClientId;

          if (!clientReference) {
            // Créer nouveau client
            const nouveauClient = {
              nom: passager.nom,
              prenom: passager.prenom,
              adresse: passager.adresse,
              telephone: passager.telephone,
              numero_piece: passager.numero_piece,
              type_de_piece: passager.type_piece,
              sexe: passager.sexe,
              createAt: serverTimestamp(),
              display_name: `${passager.nom} ${passager.prenom}`,
            };

            const clientDocRef = doc(collection(db, "clients"));
            transaction.set(clientDocRef, nouveauClient);
            clientReference = clientDocRef.id;
          }

          // Fonction pour obtenir le tarif d'un trajet selon le type de passager et la classe
          const obtenirTarifTrajet = (trajet, typePassager, classe) => {
            let tarif = 0;

            if (typePassager === "Adulte") {
              tarif =
                classe === "VIP"
                  ? trajet.tarif_adulte_vip || 0
                  : trajet.tarif_adulte || 0;
            } else if (typePassager === "Enfant") {
              tarif =
                classe === "VIP"
                  ? trajet.tarif_enfant_vip || 0
                  : trajet.tarif_enfant || 0;
            } else if (typePassager === "Bébé") {
              tarif =
                classe === "VIP"
                  ? trajet.tarif_bb_vip || 0
                  : trajet.tarif_bb || 0;
            }

            return tarif;
          };

          // Calculer le montant pour ce passager (aller seulement)
          let montantPassagerAller = 0;
          reservationForm.trajets_selectionnes.forEach((trajetIndex) => {
            const trajet = voyage?.trajet?.[trajetIndex];
            if (trajet) {
              montantPassagerAller += obtenirTarifTrajet(
                trajet,
                passager.type_passager,
                passager.classe
              );
            }
          });

          // === BILLET ALLER ===
          // Générer un numéro de billet unique pour l'aller
          const numeroBilletAller =
            Date.now().toString() +
            Math.random().toString(36).substring(2, 7).toUpperCase();
          //TODO: Les trajets sélectionnés contiennent des valeurs vides
          (reservationForm.trajets_selectionnes || []).map((index) =>
            voyage?.trajet && voyage.trajet[index]
              ? console.log(voyage.trajet[index])
              : console.log("Trajet non trouvé")
          );
          // Enregistrer la vente pour l'aller
          // Convertir le Timestamp Firestore en objet Date JavaScript
          let dateVoyageAller = new Date();
          if (voyageTimestamp && voyageTimestamp.toDate) {
            dateVoyageAller = voyageTimestamp.toDate();
          } else if (voyageTimestamp && voyageTimestamp.seconds) {
            dateVoyageAller = new Date(voyageTimestamp.seconds * 1000);
          }

          const venteAller = {
            noms: passager.nom || "",
            prenoms: passager.prenom || "",
            adresse: passager.adresse || "",
            tel: passager.telephone || "",
            date_voyage: dateVoyageAller,
            numero: passager.numero_piece || "",
            type_piece: passager.type_piece || "",
            montant_ttc: montantPassagerAller || 0,
            numero_billet_parent:
              passager.type_passager === "Bébé"
                ? premierAdulteTicketId || ""
                : "",
            classe: passager.classe || "",
            create_time: serverTimestamp(),
            status: "Payer",
            voyage_reference: voyageRef,
            type_bateau_libelle: bateauData?.type_bateau_libelle || "",
            type_bateau: bateauData?.type_bateau || "",
            bateau_reference: currentVoyageData.bateau || "",
            trajet: (reservationForm.trajets_selectionnes || []).map((index) =>
              voyage?.trajet && voyage.trajet[index] ? voyage.trajet[index] : {}
            ),
            client_reference: doc(db, "clients", clientReference) || "",
            client_name: `${passager.prenom || ""} ${
              passager.nom || ""
            }`.trim(),
            type_paiement: "Mobile Money",
            agent_reference: doc(db, "users", "u8Eye0rIVa0gG15xwF8m") || "",
            agent_name: "Nat Voyage System",
            sexe_client: passager.sexe || "",
            isGo: false,
            is_client_reservation: true,
            agence_reference: voyage?.agence_reference || "",
            agence_name: voyage?.agence_name || "",
            agence_vente_reference:
              doc(db, "agences", "cvnjkcnezjncjekzncjkezncjkeznjckez") || "",
            agence_vente_name: "Nat Voyage System",
            type_passager: passager.type_passager || "",
            type_voyage: reservationForm.type_voyage,
            sens_voyage: "aller", // Nouveau champ pour identifier le sens
            createAt: serverTimestamp(),
            numero_billet: numeroBilletAller,
            id_vente: numeroBilletAller,
          };

          // Nettoyer les valeurs undefined et null pour l'aller
          Object.keys(venteAller).forEach((key) => {
            if (venteAller[key] === undefined || venteAller[key] === null) {
              if (key === "montant_ttc") {
                venteAller[key] = 0;
              } else if (Array.isArray(venteAller[key])) {
                venteAller[key] = [];
              } else {
                venteAller[key] = "";
              }
            }
            // Nettoyer les objets imbriqués dans trajet
            if (key === "trajet" && Array.isArray(venteAller[key])) {
              venteAller[key] = venteAller[key].map((trajetItem) => {
                const cleanedTrajet = {};
                Object.keys(trajetItem).forEach((trajetKey) => {
                  // Champs qui doivent être des nombres
                  const numericFields = [
                    "tarif_adulte",
                    "tarif_adulte_vip",
                    "tarif_enfant",
                    "tarif_enfant_vip",
                    "tarif_bb",
                    "tarif_bb_vip",
                    "tva",
                    "oprag",
                    "promotion",
                  ];

                  if (numericFields.includes(trajetKey)) {
                    // Convertir en nombre ou 0 si vide/invalide
                    const value = trajetItem[trajetKey];
                    if (value === "" || value === null || value === undefined) {
                      cleanedTrajet[trajetKey] = 0;
                    } else {
                      const parsed = parseFloat(value);
                      cleanedTrajet[trajetKey] = isNaN(parsed) ? 0 : parsed;
                    }
                  } else {
                    cleanedTrajet[trajetKey] = trajetItem[trajetKey] || "";
                  }
                });
                return cleanedTrajet;
              });
            }
          });

          // Enregistrer la vente aller
          const venteAllerDocRef = doc(collection(db, "ventes"));
          transaction.set(venteAllerDocRef, venteAller);

          // Sauvegarder l'ID du premier adulte pour les bébés
          if (passager.type_passager === "Adulte" && !premierAdulteTicketId) {
            premierAdulteTicketId = numeroBilletAller;
          }

          // Créer la sous-collection transaction pour l'aller
          const transactionAllerData = {
            montant_total: montantPassagerAller || 0,
            statuts: "actif",
            taxes: 0,
            createAt: serverTimestamp(),
            agentName: "",
            agentReference: "",
            agenceName: voyage?.agence_name || "",
            agenceReference: voyage?.agence_reference || "",
          };

          // Nettoyer les données de transaction aller
          Object.keys(transactionAllerData).forEach((key) => {
            if (
              transactionAllerData[key] === undefined ||
              transactionAllerData[key] === null
            ) {
              if (key === "montant_total" || key === "taxes") {
                transactionAllerData[key] = 0;
              } else {
                transactionAllerData[key] = "";
              }
            }
          });

          const transactionAllerDocRef = doc(
            collection(db, "ventes", venteAllerDocRef.id, "transactions_vente")
          );
          transaction.set(transactionAllerDocRef, transactionAllerData);

          // Ajouter à la liste des ventes
          ventes.push({
            ...venteAller,
            id: venteAllerDocRef.id,
            voyage: voyage,
          });

          // === BILLET RETOUR (si aller-retour) ===
          if (
            reservationForm.type_voyage === "aller_retour" &&
            voyageRetourSelectionne
          ) {
            // Calculer le montant pour le retour en utilisant le voyage retour sélectionné
            let montantPassagerRetour = 0;

            if (voyageRetourSelectionne && voyageRetourSelectionne.trajet) {
              // Calculer le montant pour tous les trajets du voyage retour sélectionné
              voyageRetourSelectionne.trajet.forEach((trajetRetour) => {
                montantPassagerRetour += obtenirTarifTrajet(
                  trajetRetour,
                  passager.type_passager,
                  passager.classe
                );
              });
            }

            // Générer un numéro de billet unique pour le retour
            const numeroBilletRetour =
              Date.now().toString() +
              Math.random().toString(36).substring(2, 7).toUpperCase();

            // Référence du voyage de retour
            const voyageRetourRef = doc(
              db,
              "voyages",
              reservationForm.voyage_retour_id
            );
            console.log(voyageRetourSelectionne?.trajet);

            // Convertir le Timestamp Firestore du voyage retour en objet Date JavaScript
            let dateVoyageRetour = new Date();
            const timestampRetour =
              voyageRetourSelectionne.date_voyage_timestamp;
            if (timestampRetour && timestampRetour.toDate) {
              dateVoyageRetour = timestampRetour.toDate();
            } else if (timestampRetour && timestampRetour.seconds) {
              dateVoyageRetour = new Date(timestampRetour.seconds * 1000);
            }

            // Enregistrer la vente pour le retour
            const venteRetour = {
              noms: passager.nom || "",
              prenoms: passager.prenom || "",
              adresse: passager.adresse || "",
              tel: passager.telephone || "",
              numero: passager.numero_piece || "",
              type_piece: passager.type_piece || "",
              montant_ttc: montantPassagerRetour || 0,
              numero_billet_parent:
                passager.type_passager === "Bébé"
                  ? premierAdulteTicketId || ""
                  : "",
              classe: passager.classe || "",
              create_time: serverTimestamp(),
              status: "Payer",
              date_voyage: dateVoyageRetour,
              voyage_reference: voyageRetourRef,
              type_bateau_libelle: bateauRetourData?.type_bateau_libelle || "",
              type_bateau: bateauRetourData?.type_bateau || "",
              bateau_reference: currentVoyageRetourData?.bateau || "",
              trajet: voyageRetourSelectionne?.trajet || [],
              client_reference: doc(db, "clients", clientReference) || "",
              client_name: `${passager.prenom || ""} ${
                passager.nom || ""
              }`.trim(),
              type_paiement: "Mobile Money",
              agent_reference: doc(db, "users", "u8Eye0rIVa0gG15xwF8m") || "",
              agent_name: "Nat Voyage System",
              agence_vente_reference:
                doc(db, "agences", "cvnjkcnezjncjekzncjkezncjkeznjckez") || "",
              agence_vente_name: "Nat Voyage System",
              sexe_client: passager.sexe || "",
              isGo: false,
              is_client_reservation: true,
              agence_reference: voyageRetourSelectionne?.agence_reference || "",
              agence_name: voyageRetourSelectionne?.agence_name || "",
              type_passager: passager.type_passager || "",
              type_voyage: reservationForm.type_voyage,
              sens_voyage: "retour", // Nouveau champ pour identifier le sens
              billet_aller_reference: venteAllerDocRef.id, // Lien vers le billet aller
              createAt: serverTimestamp(),
              numero_billet: numeroBilletRetour,
              id_vente: numeroBilletRetour,
            };

            // Nettoyer les valeurs undefined et null pour le retour
            Object.keys(venteRetour).forEach((key) => {
              if (venteRetour[key] === undefined || venteRetour[key] === null) {
                if (key === "montant_ttc") {
                  venteRetour[key] = 0;
                } else if (Array.isArray(venteRetour[key])) {
                  venteRetour[key] = [];
                } else {
                  venteRetour[key] = "";
                }
              }
              // Nettoyer les objets imbriqués dans trajet
              if (key === "trajet" && Array.isArray(venteRetour[key])) {
                venteRetour[key] = venteRetour[key].map((trajetItem) => {
                  const cleanedTrajet = {};
                  Object.keys(trajetItem).forEach((trajetKey) => {
                    // Champs qui doivent être des nombres
                    const numericFields = [
                      "tarif_adulte",
                      "tarif_adulte_vip",
                      "tarif_enfant",
                      "tarif_enfant_vip",
                      "tarif_bb",
                      "tarif_bb_vip",
                      "tva",
                      "oprag",
                      "promotion",
                    ];

                    if (numericFields.includes(trajetKey)) {
                      // Convertir en nombre ou 0 si vide/invalide
                      const value = trajetItem[trajetKey];
                      if (
                        value === "" ||
                        value === null ||
                        value === undefined
                      ) {
                        cleanedTrajet[trajetKey] = 0;
                      } else {
                        const parsed = parseFloat(value);
                        cleanedTrajet[trajetKey] = isNaN(parsed) ? 0 : parsed;
                      }
                    } else {
                      cleanedTrajet[trajetKey] = trajetItem[trajetKey] || "";
                    }
                  });
                  return cleanedTrajet;
                });
              }
            });

            // Enregistrer la vente retour
            const venteRetourDocRef = doc(collection(db, "ventes"));
            transaction.set(venteRetourDocRef, venteRetour);

            // Créer la sous-collection transaction pour le retour
            const transactionRetourData = {
              montant_total: montantPassagerRetour || 0,
              statuts: "actif",
              taxes: 0,
              createAt: serverTimestamp(),
              agentName: "",
              agentReference: "",
              agenceName: voyageRetourSelectionne?.agence_name || "",
              agenceReference: voyageRetourSelectionne?.agence_reference || "",
            };

            // Nettoyer les données de transaction retour
            Object.keys(transactionRetourData).forEach((key) => {
              if (
                transactionRetourData[key] === undefined ||
                transactionRetourData[key] === null
              ) {
                if (key === "montant_total" || key === "taxes") {
                  transactionRetourData[key] = 0;
                } else {
                  transactionRetourData[key] = "";
                }
              }
            });

            const transactionRetourDocRef = doc(
              collection(
                db,
                "ventes",
                venteRetourDocRef.id,
                "transactions_vente"
              )
            );
            transaction.set(transactionRetourDocRef, transactionRetourData);

            // Ajouter à la liste des ventes
            ventes.push({
              ...venteRetour,
              id: venteRetourDocRef.id,
              voyage: voyageRetourSelectionne,
            });
          }
        }

        return { ventes };
      });

      // 5. Générer un PDF multi-pages (une page par passager)
      await genererFactureMultiPassagers(result.ventes);

      // Réinitialiser le formulaire
      setReservationForm({
        type_voyage: "aller_simple",
        trajets_selectionnes: [],
        voyage_retour_id: "",
        passagers: [
          {
            id: 1,
            type_passager: "Adulte",
            classe: "Economie",
            type_piece: "Carte d'identité",
            numero_piece: "",
            nom: "",
            prenom: "",
            sexe: "Masculin",
            telephone: "",
            adresse: "",
          },
        ],
      });

      // Réinitialiser les états des voyages de retour
      setVoyagesRetour([]);
      setVoyageRetourSelectionne(null);

      setErrors({});
      setMontantTotal(0);

      // alert(
      //   `✅ ${
      //     result.ventes.length
      //   } billet(s) réservé(s) avec succès pour un montant total de ${montantTotal.toLocaleString()} FCFA\n\n📄 Les billets ont été ouverts dans une nouvelle fenêtre pour visualisation\n💾 Le téléchargement automatique va commencer dans quelques secondes`
      // );

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
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      alert(`Erreur lors de l'enregistrement des billets: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Check if voyage object was passed via navigation state
    if (location.state && location.state.voyageId) {
      const fetchVoyage = async () => {
        try {
          const docRef = doc(db, "voyages", location.state.voyageId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Conserver le timestamp original pour l'enregistrement Firestore
            let originalTimestamp = null;

            // Formater la date si c'est un Timestamp Firestore
            if (
              data.date_voyage &&
              typeof data.date_voyage === "object" &&
              data.date_voyage.seconds
            ) {
              // Sauvegarder le timestamp original
              originalTimestamp = data.date_voyage;

              // Formater pour l'affichage
              data.date_voyage =
                new Date(data.date_voyage.seconds * 1000).toLocaleDateString(
                  "fr-FR"
                ) +
                " " +
                new Date(data.date_voyage.seconds * 1000).toLocaleTimeString(
                  "fr-FR",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );
            }
            setVoyage(data);
            setVoyageTimestamp(originalTimestamp);
          } else {
            // console.log("No such document!");
          }
          setLoading(false);
        } catch (error) {
          // console.log("Error fetching voyage: ", error);
          setLoading(false);
        }
      };
      fetchVoyage();
    }
    const today = new Date();
    const q = query(
      collection(db, "voyages"),
      where("date_voyage", ">=", today),
      where("status", "==", "Actif"),
      orderBy("date_voyage", "desc")
    );

    const querySnapshot = getDocs(q).then((querySnapshot) => {
      const result = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        result.push({
          id: doc.id,
          referenceDoc: doc.ref.path,
          libelle_bateau: data.libelle_bateau || "Inconnu",
          bateau_reference: data.bateau || "",
          date_voyage_timestamp: data.date_voyage || null, // Timestamp original pour Firestore
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
      setTousLesVoyages(result);
    });
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
            <div className="nk-content" style={{ paddingBottom: "80px" }}>
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
                                Date et heure:{" "}
                                <span className="text-base">
                                  {voyage?.date_voyage}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="nk-block-head-content">
                          <button
                            className="btn btn-primary mr-2"
                            data-toggle="modal"
                            data-target="#ticketModal"
                          >
                            <em className="icon ni ni-ticket" />
                            <span>Réservation</span>
                          </button>
                          <a
                            href="#"
                            className="btn btn-outline-light bg-white d-none d-sm-inline-flex"
                            onClick={handleBackNavigation}
                          >
                            <em className="icon ni ni-arrow-left" />
                            <span>Retour</span>
                          </a>
                          <a
                            href="#"
                            className="btn btn-icon btn-outline-light bg-white d-inline-flex d-sm-none"
                            onClick={handleBackNavigation}
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
                                        Moyen de transport
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
                                        Date et heure du voyage
                                      </span>
                                      <span className="profile-ud-value">
                                        {voyage?.date_voyage}
                                        {voyage?.trajet?.[0]?.heure_depart &&
                                          ` à ${voyage.trajet[0].heure_depart}`}
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
        <div className="modal-dialog modal-xl" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="ticketModalLabel">
                Réservation Multiple - {voyage?.libelle_bateau} (
                {reservationForm.passagers.length} passager
                {reservationForm.passagers.length > 1 ? "s" : ""})
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
                  <div className="col-md-4">
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
                  <div className="col-md-4">
                    <div className="card bg-info text-white">
                      <div className="card-body">
                        <h6 className="card-title">Passagers</h6>
                        <h4 className="mb-0">
                          {reservationForm.passagers.length}
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <h6 className="card-title">Montant total</h6>
                        <h4 className="mb-0">
                          {montantTotal.toLocaleString()} FCFA
                        </h4>
                        {reservationForm.type_voyage === "aller_retour" && (
                          <small className="text-white-50">
                            Aller + Retour inclus
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Sélection des trajets (commun à tous) */}
                <div className="form-group mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label h6">
                      Sélectionner les trajets (commun à tous les passagers)
                    </label>
                  </div>
                  <div className="border rounded p-3 bg-light">
                    {voyage?.trajet && voyage.trajet.length > 0 ? (
                      voyage.trajet.map((etape, index) => (
                        <div
                          key={index}
                          className="custom-control custom-checkbox mb-2 col-md-12"
                        >
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id={`trajet_${index}`}
                            checked={reservationForm.trajets_selectionnes.includes(
                              index
                            )}
                            onChange={(e) =>
                              mettreAJourTrajets(index, e.target.checked)
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
                {/* Type de voyage */}
                <div className="form-group mb-4">
                  <label className="form-label h6">Type de voyage</label>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="custom-control custom-radio">
                        <input
                          type="radio"
                          className="custom-control-input"
                          id="aller_simple"
                          name="type_voyage"
                          value="aller_simple"
                          checked={
                            reservationForm.type_voyage === "aller_simple"
                          }
                          onChange={(e) =>
                            handleTypeVoyageChange(e.target.value)
                          }
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="aller_simple"
                        >
                          <strong>Aller simple</strong>
                          <br />
                          <small className="text-muted">
                            Voyage dans un sens uniquement
                          </small>
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="custom-control custom-radio">
                        <input
                          type="radio"
                          className="custom-control-input"
                          id="aller_retour"
                          name="type_voyage"
                          value="aller_retour"
                          checked={
                            reservationForm.type_voyage === "aller_retour"
                          }
                          onChange={(e) =>
                            handleTypeVoyageChange(e.target.value)
                          }
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="aller_retour"
                        >
                          <strong>Aller-retour</strong>
                          <br />
                          <small className="text-muted">
                            Voyage aller et retour
                          </small>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sélection du voyage de retour si aller-retour */}
                {reservationForm.type_voyage === "aller_retour" && (
                  <div className="form-group mb-4">
                    <label className="form-label h6">
                      Sélectionner le voyage de retour
                    </label>
                    {loadingVoyagesRetour ? (
                      <div className="text-center py-3">
                        <div
                          className="spinner-border spinner-border-sm"
                          role="status"
                        >
                          <span className="sr-only">Chargement...</span>
                        </div>
                        <p className="mt-2 text-muted">
                          Recherche des voyages de retour...
                        </p>
                      </div>
                    ) : voyagesRetour.length > 0 ? (
                      <select
                        className="form-control"
                        value={reservationForm.voyage_retour_id}
                        onChange={(e) =>
                          handleVoyageRetourChange(e.target.value)
                        }
                        required
                      >
                        <option value="">Choisir un voyage de retour</option>
                        {voyagesRetour.map((voyageRetour) => (
                          <option key={voyageRetour.id} value={voyageRetour.id}>
                            {voyageRetour.date_voyage} -{" "}
                            {voyageRetour.agence_name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="alert alert-warning">
                        <em className="icon ni ni-alert-circle"></em>
                        <p className="mb-0">
                          Aucun voyage de retour disponible pour ce trajet. Les
                          voyages de retour doivent partir de la destination
                          vers l'origine et avoir une date postérieure au voyage
                          aller.
                        </p>
                      </div>
                    )}
                    {errors.voyage_retour && (
                      <small className="text-danger">
                        {errors.voyage_retour}
                      </small>
                    )}
                  </div>
                )}

                {/* Section des passagers */}
                <div className="form-group mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Passagers</h6>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={ajouterPassager}
                    >
                      <em className="icon ni ni-plus"></em>
                      Ajouter un passager
                    </button>
                  </div>

                  {reservationForm.passagers.map((passager, index) => (
                    <div key={passager.id} className="card mb-3">
                      <div className="card-header">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">Passager {index + 1}</h6>
                          {reservationForm.passagers.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => supprimerPassager(passager.id)}
                            >
                              <em className="icon ni ni-trash"></em>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="card-body">
                        {/* Type et classe */}
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <label className="form-label">
                              Type de passager
                            </label>
                            <select
                              className="form-control"
                              value={passager.type_passager}
                              onChange={(e) =>
                                mettreAJourPassager(
                                  passager.id,
                                  "type_passager",
                                  e.target.value
                                )
                              }
                            >
                              <option value="Adulte">Adulte</option>
                              <option value="Enfant">Enfant</option>
                              <option value="Bébé">Bébé</option>
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Classe</label>
                            <select
                              className="form-control"
                              value={passager.classe}
                              onChange={(e) =>
                                mettreAJourPassager(
                                  passager.id,
                                  "classe",
                                  e.target.value
                                )
                              }
                            >
                              <option value="Economie">Économique</option>
                              <option value="VIP">VIP</option>
                            </select>
                          </div>
                        </div>

                        {/* Type et numéro de pièce */}
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <label className="form-label">
                              Type de pièce d'identité
                            </label>
                            <select
                              className="form-control"
                              value={passager.type_piece}
                              onChange={(e) =>
                                mettreAJourPassager(
                                  passager.id,
                                  "type_piece",
                                  e.target.value
                                )
                              }
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
                          <div className="col-md-6">
                            <label className="form-label">
                              Numéro de pièce d'identité
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={passager.numero_piece}
                              onChange={(e) =>
                                mettreAJourPassager(
                                  passager.id,
                                  "numero_piece",
                                  e.target.value
                                )
                              }
                              required
                            />
                            {errors[`passager_${index}`]?.numero_piece && (
                              <small className="text-danger">
                                {errors[`passager_${index}`].numero_piece}
                              </small>
                            )}
                          </div>
                        </div>

                        {/* Nom et prénom */}
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <label className="form-label">Nom</label>
                            <input
                              type="text"
                              className="form-control"
                              value={passager.nom}
                              onChange={(e) =>
                                mettreAJourPassager(
                                  passager.id,
                                  "nom",
                                  e.target.value
                                )
                              }
                              required
                            />
                            {errors[`passager_${index}`]?.nom && (
                              <small className="text-danger">
                                {errors[`passager_${index}`].nom}
                              </small>
                            )}
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Prénom</label>
                            <input
                              type="text"
                              className="form-control"
                              value={passager.prenom}
                              onChange={(e) =>
                                mettreAJourPassager(
                                  passager.id,
                                  "prenom",
                                  e.target.value
                                )
                              }
                              required
                            />
                            {errors[`passager_${index}`]?.prenom && (
                              <small className="text-danger">
                                {errors[`passager_${index}`].prenom}
                              </small>
                            )}
                          </div>
                        </div>

                        {/* Sexe, téléphone et adresse */}
                        <div className="row mb-3">
                          <div className="col-md-4">
                            <label className="form-label">Sexe</label>
                            <select
                              className="form-control"
                              value={passager.sexe}
                              onChange={(e) =>
                                mettreAJourPassager(
                                  passager.id,
                                  "sexe",
                                  e.target.value
                                )
                              }
                            >
                              <option value="Masculin">Masculin</option>
                              <option value="Féminin">Féminin</option>
                            </select>
                          </div>
                          <div className="col-md-4">
                            <label className="form-label">Téléphone</label>
                            <input
                              type="tel"
                              className="form-control"
                              value={passager.telephone}
                              onChange={(e) =>
                                mettreAJourPassager(
                                  passager.id,
                                  "telephone",
                                  e.target.value
                                )
                              }
                              required
                            />
                            {errors[`passager_${index}`]?.telephone && (
                              <small className="text-danger">
                                {errors[`passager_${index}`].telephone}
                              </small>
                            )}
                          </div>
                          <div className="col-md-4">
                            <label className="form-label">Adresse</label>
                            <input
                              type="text"
                              className="form-control"
                              value={passager.adresse}
                              onChange={(e) =>
                                mettreAJourPassager(
                                  passager.id,
                                  "adresse",
                                  e.target.value
                                )
                              }
                              required
                            />
                            {errors[`passager_${index}`]?.adresse && (
                              <small className="text-danger">
                                {errors[`passager_${index}`].adresse}
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                      !reservationForm.trajets_selectionnes.length ||
                      reservationForm.passagers.length === 0 ||
                      (reservationForm.type_voyage === "aller_retour" &&
                        !reservationForm.voyage_retour_id) ||
                      isSubmitting
                    }
                  >
                    {isSubmitting
                      ? "Enregistrement en cours..."
                      : `Réserver ${reservationForm.passagers.length} billet${
                          reservationForm.passagers.length > 1 ? "s" : ""
                        } ${
                          reservationForm.type_voyage === "aller_retour"
                            ? "(Aller-Retour)"
                            : "(Aller Simple)"
                        }`}
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
