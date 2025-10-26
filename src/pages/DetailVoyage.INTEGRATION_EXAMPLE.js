/**
 * EXEMPLE D'INTÉGRATION DES AMÉLIORATIONS DE SÉCURITÉ
 *
 * Ce fichier montre comment intégrer le rate limiting et la gestion d'erreurs améliorée
 * dans DetailVoyage.js
 *
 * NE PAS EXÉCUTER CE FICHIER - C'EST JUSTE UN EXEMPLE
 */

// ==========================================
// IMPORTS À AJOUTER EN HAUT DE DetailVoyage.js
// ==========================================

import { useRateLimit } from '../hooks/useRateLimit';
import {
  ReservationError,
  ErrorCategories,
  TransactionLogger,
  executeTransactionWithRetry,
  validateVenteData
} from '../utils/transactionHelpers';

// ==========================================
// DANS LE COMPOSANT DetailVoyage
// ==========================================

export default function DetailVoyage() {
  // ... autres hooks existants ...

  // ✅ NOUVEAU: Rate limiting - 5 tentatives max par minute
  const rateLimit = useRateLimit(5, 60000);

  // ==========================================
  // MODIFIER LA FONCTION handleTicketSubmit
  // ==========================================

  const handleTicketSubmit = async (e) => {
    e.preventDefault();

    // ✅ NOUVEAU: Vérification Rate Limit
    if (!rateLimit.canProceed) {
      const resetTime = rateLimit.resetTime;
      const minutesLeft = Math.ceil((resetTime - new Date()) / 60000);

      alert(
        `⚠️ Trop de tentatives de réservation.\n\n` +
        `Vous avez effectué trop de tentatives récemment.\n` +
        `Veuillez patienter ${minutesLeft} minute(s) avant de réessayer.\n\n` +
        `Tentatives restantes: ${rateLimit.remainingAttempts}/${5}\n\n` +
        `Ceci est une mesure de sécurité pour éviter les abus.`
      );
      return;
    }

    // Validation avant soumission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ NOUVEAU: Logger le début de la réservation
      TransactionLogger.log('RESERVATION_START', {
        passagers: reservationForm.passagers.length,
        typeVoyage: reservationForm.type_voyage,
        montantTotal,
        timestamp: new Date().toISOString(),
      });

      // ✅ NOUVEAU: Enregistrer la tentative dans le rate limiter
      rateLimit.recordAttempt();

      // Vérifier la disponibilité des places en temps réel
      const { voyageData, placesNecessaires } = await verifierDisponibilite();

      TransactionLogger.success('AVAILABILITY_CHECK', {
        placesNecessaires,
        placesDispoEco: voyageData.place_disponible_eco - voyageData.place_prise_eco,
        placesDispoVip: voyageData.place_disponible_vip - voyageData.place_prise_vip,
      });

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

      TransactionLogger.log('CLIENTS_PREPARED', {
        total: clientsData.length,
        existing: clientsData.filter(c => c.existingClientId).length,
        new: clientsData.filter(c => !c.existingClientId).length,
      });

      // ✅ NOUVEAU: Utilisation d'executeTransactionWithRetry au lieu de runTransaction
      const result = await executeTransactionWithRetry(
        db,
        async (transaction) => {
          const ventes = [];
          const voyageRef = doc(db, "voyages", location.state.voyageId);
          let premierAdulteTicketId = null;

          // 1. TOUTES LES LECTURES D'ABORD
          const voyageDoc = await transaction.get(voyageRef);
          if (!voyageDoc.exists()) {
            throw new ReservationError(
              "Voyage introuvable",
              ErrorCategories.AVAILABILITY
            );
          }

          const currentVoyageData = voyageDoc.data();

          // Récupérer les informations du bateau
          let bateauData = null;
          if (currentVoyageData.bateau) {
            const bateauDoc = await transaction.get(currentVoyageData.bateau);
            if (bateauDoc.exists()) {
              bateauData = bateauDoc.data();
            }
          }

          // Lecture du voyage retour si nécessaire
          let currentVoyageRetourData = null;
          let bateauRetourData = null;
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
              throw new ReservationError(
                "Voyage de retour introuvable",
                ErrorCategories.AVAILABILITY
              );
            }
            currentVoyageRetourData = voyageRetourDoc.data();

            // Bateau retour
            if (currentVoyageRetourData.bateau) {
              const bateauRetourDoc = await transaction.get(
                currentVoyageRetourData.bateau
              );
              if (bateauRetourDoc.exists()) {
                bateauRetourData = bateauRetourDoc.data();
              }
            }
          }

          // Vérifications des places aller
          const placesDispoEcoActuelles =
            (currentVoyageData.place_disponible_eco || 0) -
            (currentVoyageData.place_prise_eco || 0);
          const placesDispoVipActuelles =
            (currentVoyageData.place_disponible_vip || 0) -
            (currentVoyageData.place_prise_vip || 0);

          if (placesNecessaires.Economie > placesDispoEcoActuelles) {
            throw new ReservationError(
              `Plus assez de places Économie disponibles (${placesNecessaires.Economie} demandées, ${placesDispoEcoActuelles} disponibles)`,
              ErrorCategories.AVAILABILITY
            );
          }

          if (placesNecessaires.VIP > placesDispoVipActuelles) {
            throw new ReservationError(
              `Plus assez de places VIP disponibles (${placesNecessaires.VIP} demandées, ${placesDispoVipActuelles} disponibles)`,
              ErrorCategories.AVAILABILITY
            );
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
              throw new ReservationError(
                `Plus assez de places Économie pour le retour (${placesNecessaires.Economie} demandées, ${placesDispoEcoRetour} disponibles)`,
                ErrorCategories.AVAILABILITY
              );
            }

            if (placesNecessaires.VIP > placesDispoVipRetour) {
              throw new ReservationError(
                `Plus assez de places VIP pour le retour (${placesNecessaires.VIP} demandées, ${placesDispoVipRetour} disponibles)`,
                ErrorCategories.AVAILABILITY
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

            // Calculer le montant pour ce passager (aller seulement)
            let montantPassagerAller = 0;
            // ... calcul du montant ...

            // Créer la vente aller
            const numeroBilletAller =
              Date.now().toString() +
              Math.random().toString(36).substring(2, 7).toUpperCase();

            const venteAller = {
              // ... tous les champs de vente ...
            };

            // ✅ NOUVEAU: Valider les données avant enregistrement
            try {
              validateVenteData(venteAller);
            } catch (validationError) {
              TransactionLogger.error('VENTE_VALIDATION_FAILED', validationError);
              throw validationError;
            }

            // Nettoyer les valeurs undefined et null
            Object.keys(venteAller).forEach((key) => {
              // ... nettoyage ...
            });

            // Enregistrer la vente aller
            const venteAllerDocRef = doc(collection(db, "ventes"));
            transaction.set(venteAllerDocRef, venteAller);

            if (passager.type_passager === "Adulte" && !premierAdulteTicketId) {
              premierAdulteTicketId = numeroBilletAller;
            }

            // Créer la transaction
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

            const transactionAllerDocRef = doc(
              collection(db, "ventes", venteAllerDocRef.id, "transactions_vente")
            );
            transaction.set(transactionAllerDocRef, transactionAllerData);

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
              // ... créer vente retour de la même manière ...
            }
          }

          return { ventes };
        },
        3, // 3 tentatives max
        1000 // 1 seconde entre chaque tentative
      );

      // ✅ NOUVEAU: Logger le succès
      TransactionLogger.success('RESERVATION_COMPLETE', {
        ventesCount: result.ventes.length,
        montantTotal,
        typeVoyage: reservationForm.type_voyage,
      });

      // 5. Générer un PDF multi-pages
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

      setVoyagesRetour([]);
      setVoyageRetourSelectionne(null);
      setErrors({});
      setMontantTotal(0);

      // Message de succès détaillé
      alert(
        `✅ Réservation réussie!\n\n` +
        `Nombre de billets: ${result.ventes.length}\n` +
        `Type: ${reservationForm.type_voyage === 'aller_retour' ? 'Aller-Retour' : 'Aller Simple'}\n` +
        `Montant total: ${montantTotal.toLocaleString()} FCFA\n\n` +
        `Les billets s'ouvrent dans une nouvelle fenêtre.\n` +
        `Le téléchargement va commencer automatiquement.`
      );

      // Fermer le modal
      // ... code de fermeture du modal ...

    } catch (error) {
      // ✅ NOUVEAU: Gestion d'erreur améliorée
      if (error instanceof ReservationError) {
        error.log();

        // Message utilisateur personnalisé selon le type d'erreur
        alert(error.getUserMessage());

        // Si l'erreur peut être réessayée, proposer de réessayer
        if (error.shouldRetry() && rateLimit.remainingAttempts > 0) {
          const retry = window.confirm(
            'Voulez-vous réessayer la réservation?\n\n' +
            'Cela peut résoudre les problèmes temporaires de connexion.\n\n' +
            `Tentatives restantes: ${rateLimit.remainingAttempts}`
          );

          if (retry) {
            // Relancer la soumission après un court délai
            setTimeout(() => {
              handleTicketSubmit(e);
            }, 500);
            return;
          }
        }
      } else {
        // Erreur non catégorisée
        console.error("Erreur inattendue:", error);
        TransactionLogger.error('UNKNOWN_ERROR', error);

        alert(
          '⚠️ Une erreur inattendue s\'est produite.\n\n' +
          'Détails: ' + (error.message || 'Erreur inconnue') + '\n\n' +
          'Veuillez réessayer dans quelques instants.\n' +
          'Si le problème persiste, contactez le support.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... reste du code ...
}

/**
 * NOTES D'IMPLÉMENTATION:
 *
 * 1. Copier les imports en haut de DetailVoyage.js
 * 2. Ajouter le hook useRateLimit après les autres hooks
 * 3. Remplacer le contenu de handleTicketSubmit par cette version
 * 4. Tester avec quelques réservations pour valider
 * 5. Vérifier les logs dans la console pour voir les transactions
 *
 * BÉNÉFICES:
 * - Protection contre le spam de réservations
 * - Meilleure gestion des erreurs réseau
 * - Retry automatique en cas d'échec
 * - Logs détaillés pour le debugging
 * - Messages d'erreur clairs pour les utilisateurs
 */
