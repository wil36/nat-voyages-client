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

  // État pour le formulaire de billet avec plusieurs passagers
  const [reservationForm, setReservationForm] = useState({
    type_voyage: "aller_simple", // aller_simple ou aller_retour
    trajets_selectionnes: [], // tableau des indices des trajets sélectionnés - commun à tous
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

  const handleBackNavigation = () => {
    navigate("/");
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

  // Fonction pour générer et télécharger le reçu PDF
  const genererFacturePDF = async (
    venteId,
    donneesVente,
    previewOnly = false
  ) => {
    const doc = new jsPDF("landscape"); // Mode paysage

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
    const nomFichier = `Recu_${numeroReference}_${donneesVente.noms}.pdf`;

    if (previewOnly) {
      // Ouvrir une nouvelle fenêtre avec prévisualisation
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const previewWindow = window.open(pdfUrl, "_blank");
      previewWindow.onload = () => {
        URL.revokeObjectURL(pdfUrl);
      };
      return {
        numeroFacture: numeroReference,
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

    for (let i = 0; i < ventes.length; i++) {
      const vente = ventes[i];

      // Ajouter une nouvelle page pour chaque passager (sauf le premier)
      if (i > 0) {
        doc.addPage();
      }

      // Génération du QR code pour ce passager
      const numeroReference =
        vente.numero_billet || vente.id.substring(0, 8).toUpperCase();
      const qrData = `Réf: ${numeroReference} | Montant: ${vente.montant_ttc}F | Client: ${vente.prenoms} ${vente.noms}`;
      const qrDataUrl = await QRCode.toDataURL(qrData);

      // Titre principal
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("NAT VOYAGES - TRANSPORT MARITIME", 20, 20);

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
      doc.text(
        `BILLET ELECTRONIQUE - Passager ${i + 1}/${ventes.length}`,
        20,
        55
      );

      // Détails du voyage
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("DETAILS DU VOYAGE", 20, 65);

      // Extraire les villes de départ et d'arrivée
      const premierTrajet = vente.trajet?.[0] || voyage?.trajet?.[0];
      const dernierTrajet =
        vente.trajet?.[vente.trajet?.length - 1] ||
        voyage?.trajet?.[voyage?.trajet?.length - 1];
      const villeDepart =
        premierTrajet?.LieuDeDepartLibelle ||
        premierTrajet?.lieu_depart ||
        "N/A";
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
        `Nom et prénom du passager : ${vente.prenoms} ${vente.noms}`,
        20,
        118
      );
      doc.text(`Tel : ${vente.tel}`, 20, 124);
      doc.text(`Type de passager : ${vente.type_passager}`, 20, 130);
      doc.text(`Classe : ${vente.classe}`, 20, 136);
      doc.text(`Montant TTC : ${vente.montant_ttc.toLocaleString()}F`, 20, 142);
      doc.text(`Encaissé par : Système NAT VOYAGES`, 20, 148);

      // Informations additionnelles si bébé
      if (vente.numero_billet_parent) {
        doc.text(`Ticket parent : ${vente.numero_billet_parent}`, 20, 154);
      }

      // Infos additionnelles
      doc.setFont("helvetica", "bold");
      doc.text("INFORMATIONS ADDITIONNELLES", 20, 170);
      doc.setFont("helvetica", "normal");
      doc.text("Billet non remboursable valable 3 mois", 20, 177);
      doc.text("Pénalité changement de date : à partir de 5000 FCFA", 20, 183);
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

    // Télécharger le PDF
    const dateStr = new Date().toISOString().split("T")[0];
    const nomFichier = `Billets_${dateStr}_${ventes.length}passagers.pdf`;
    doc.save(nomFichier);

    return true;
  };

  // Fonction de validation des champs obligatoires pour plusieurs passagers
  const validateForm = () => {
    const newErrors = {};

    // Vérifier la sélection des trajets (commun à tous)
    if (reservationForm.trajets_selectionnes.length === 0) {
      newErrors.trajets = "Vous devez sélectionner au moins un trajet";
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
      alert("❌ Il doit y avoir au moins un adulte pour accompagner les bébés !");
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
      VIP: 1.5,
    };

    // Calculer le prix pour chaque passager
    reservationForm.passagers.forEach((passager) => {
      const prixPassager =
        reservationForm.trajets_selectionnes.length *
        prixBase *
        multiplicateurPassager[passager.type_passager] *
        multiplicateurClasse[passager.classe];

      total += prixPassager;
    });

    setMontantTotal(Math.round(total));
  }, [reservationForm, voyage]);

  // Fonction pour vérifier la disponibilité des places pour tous les passagers
  const verifierDisponibilite = async () => {
    const voyageRef = doc(db, "voyages", voyage.id);
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
      console.log("Début de l'enregistrement des billets...");

      // Vérifier la disponibilité des places en temps réel
      const { voyageData, placesNecessaires } = await verifierDisponibilite();

      // Trier les passagers : Adultes et Enfants d'abord, Bébés en dernier
      const passagersOrdonnes = [
        ...reservationForm.passagers.filter((p) => p.type_passager !== "Bébé"),
        ...reservationForm.passagers.filter((p) => p.type_passager === "Bébé"),
      ];

      // Utilisation d'une transaction atomique Firebase
      const result = await runTransaction(db, async (transaction) => {
        const ventes = [];
        const voyageRef = doc(db, "voyages", voyage.id);
        let premierAdulteTicketId = null; // Pour les bébés

        // 1. Mettre à jour les places prises dans le voyage
        transaction.update(voyageRef, {
          place_prise_eco:
            (voyageData.place_prise_eco || 0) + placesNecessaires.Economie,
          place_prise_vip:
            (voyageData.place_prise_vip || 0) + placesNecessaires.VIP,
        });

        // 2. Traiter chaque passager dans l'ordre
        for (const passager of passagersOrdonnes) {
          // Vérifier/créer le client
          let clientReference = null;
          const clientsQuery = query(
            collection(db, "clients"),
            where("type_piece", "==", passager.type_piece),
            where("numero_piece", "==", passager.numero_piece)
          );

          const clientsSnapshot = await getDocs(clientsQuery);

          if (!clientsSnapshot.empty) {
            // Client existe déjà
            clientReference = clientsSnapshot.docs[0].id;
          } else {
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

          // Calculer le montant pour ce passager
          const prixBase = voyage.montant || 25000;
          const multiplicateurPassager = {
            Adulte: 1,
            Enfant: 0.5,
            Bébé: 0.1,
          };
          const multiplicateurClasse = {
            Economie: 1,
            VIP: 1.5,
          };

          const montantPassager = Math.round(
            reservationForm.trajets_selectionnes.length *
              prixBase *
              multiplicateurPassager[passager.type_passager] *
              multiplicateurClasse[passager.classe]
          );

          // Générer un numéro de billet unique
          const numeroBillet =
            Date.now().toString() +
            Math.random().toString(36).substr(2, 5).toUpperCase();

          // Enregistrer la vente
          const nouvelleVente = {
            noms: passager.nom || "",
            prenoms: passager.prenom || "",
            adresse: passager.adresse || "",
            tel: passager.telephone || "",
            numero: passager.numero_piece || "",
            type_piece: passager.type_piece || "",
            montant_ttc: montantPassager || 0,
            numero_billet_parent:
              passager.type_passager === "Bébé"
                ? premierAdulteTicketId || ""
                : "",
            classe: passager.classe || "",
            create_time: serverTimestamp(),
            statuts: "Payer",
            voyage_reference: voyageRef,
            trajet: (reservationForm.trajets_selectionnes || []).map((index) =>
              voyage?.trajet && voyage.trajet[index] ? voyage.trajet[index] : {}
            ),
            client_reference: clientReference || "",
            client_name: `${passager.prenom || ""} ${
              passager.nom || ""
            }`.trim(),
            type_paiement: "Mobile Money",
            agent_reference: "",
            agent_name: "",
            sexe_client: passager.sexe || "",
            isGo: false,
            agence_reference: voyage?.agence_reference || "",
            agence_name: voyage?.agence_name || "",
            type_passager: passager.type_passager || "",
            type_voyage: reservationForm.type_voyage,
            createAt: serverTimestamp(),
            numero_billet: numeroBillet,
          };

          // Nettoyer les valeurs undefined et null
          Object.keys(nouvelleVente).forEach((key) => {
            if (
              nouvelleVente[key] === undefined ||
              nouvelleVente[key] === null
            ) {
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
                  cleanedTrajet[trajetKey] = trajetItem[trajetKey] || "";
                });
                return cleanedTrajet;
              });
            }
          });

          // Enregistrer la vente
          const venteDocRef = doc(collection(db, "ventes"));
          transaction.set(venteDocRef, nouvelleVente);

          // Sauvegarder l'ID du premier adulte pour les bébés
          if (passager.type_passager === "Adulte" && !premierAdulteTicketId) {
            premierAdulteTicketId = numeroBillet;
          }

          // Créer la sous-collection transaction
          const transactionData = {
            montant_total: montantPassager || 0,
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

          // Ajouter à la liste des ventes
          ventes.push({
            ...nouvelleVente,
            id: venteDocRef.id,
            voyage: voyage,
          });
        }

        return { ventes };
      });

      // 5. Générer un PDF multi-pages (une page par passager)
      await genererFactureMultiPassagers(result.ventes);

      // Réinitialiser le formulaire
      setReservationForm({
        type_voyage: "aller_simple",
        trajets_selectionnes: [],
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

      setErrors({});
      setMontantTotal(0);

      alert(
        `${
          result.ventes.length
        } billet(s) réservé(s) avec succès pour un montant total de ${montantTotal.toLocaleString()} FCFA\n\nLa facture multi-pages a été téléchargée automatiquement.`
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
                      isSubmitting
                    }
                  >
                    {isSubmitting
                      ? "Enregistrement en cours..."
                      : `Réserver ${reservationForm.passagers.length} billet${
                          reservationForm.passagers.length > 1 ? "s" : ""
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
