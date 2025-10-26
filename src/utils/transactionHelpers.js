import { runTransaction } from "firebase/firestore";

/**
 * Catégories d'erreurs pour un meilleur traitement
 */
export const ErrorCategories = {
  VALIDATION: 'VALIDATION',
  AVAILABILITY: 'AVAILABILITY',
  NETWORK: 'NETWORK',
  TRANSACTION: 'TRANSACTION',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Classe d'erreur personnalisée pour les réservations
 */
export class ReservationError extends Error {
  constructor(message, category = ErrorCategories.UNKNOWN, details = {}) {
    super(message);
    this.name = 'ReservationError';
    this.category = category;
    this.details = details;
    this.timestamp = new Date();
  }

  getUserMessage() {
    const messages = {
      [ErrorCategories.VALIDATION]: '❌ Erreur de validation: ' + this.message,
      [ErrorCategories.AVAILABILITY]: '⚠️ Disponibilité: ' + this.message,
      [ErrorCategories.NETWORK]: '🌐 Problème de connexion: Veuillez vérifier votre connexion internet.',
      [ErrorCategories.TRANSACTION]: '💾 Erreur lors de l\'enregistrement: ' + this.message,
      [ErrorCategories.UNKNOWN]: '⚠️ Une erreur inattendue s\'est produite. Veuillez réessayer.',
    };

    return messages[this.category] || this.message;
  }

  shouldRetry() {
    return this.category === ErrorCategories.NETWORK ||
           this.category === ErrorCategories.TRANSACTION;
  }

  log() {
    console.error('[ReservationError]', {
      category: this.category,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    });
  }
}

/**
 * Logger de transactions pour audit
 */
export class TransactionLogger {
  static logs = [];

  static log(action, data, status = 'INFO') {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      status,
      data,
    };

    this.logs.push(entry);
    console.log(`[Transaction ${status}]`, action, data);

    // Limiter à 100 logs en mémoire
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }

    return entry;
  }

  static success(action, data) {
    return this.log(action, data, 'SUCCESS');
  }

  static error(action, error) {
    return this.log(action, { error: error.message, stack: error.stack }, 'ERROR');
  }

  static warning(action, data) {
    return this.log(action, data, 'WARNING');
  }

  static getLogs() {
    return this.logs;
  }

  static clearLogs() {
    this.logs = [];
  }
}

/**
 * Wrapper pour les transactions Firestore avec retry automatique
 * @param {Object} db - Instance Firestore
 * @param {Function} transactionFn - Fonction de transaction à exécuter
 * @param {number} maxRetries - Nombre maximum de tentatives
 * @param {number} retryDelay - Délai entre les tentatives en ms
 * @returns {Promise} Résultat de la transaction
 */
export async function executeTransactionWithRetry(
  db,
  transactionFn,
  maxRetries = 3,
  retryDelay = 1000
) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      TransactionLogger.log('TRANSACTION_ATTEMPT', { attempt, maxRetries });

      const result = await runTransaction(db, transactionFn);

      TransactionLogger.success('TRANSACTION_COMPLETE', { attempt });
      return result;

    } catch (error) {
      lastError = error;
      TransactionLogger.error('TRANSACTION_FAILED', error);

      // Ne pas réessayer si c'est une erreur de validation ou de permissions
      if (error.code === 'permission-denied' ||
          error.code === 'invalid-argument' ||
          error.message.includes('Plus assez de places') ||
          error.message.includes('introuvable')) {
        throw new ReservationError(
          error.message,
          ErrorCategories.AVAILABILITY,
          { originalError: error }
        );
      }

      // Réessayer pour les erreurs réseau/serveur
      if (attempt < maxRetries) {
        TransactionLogger.warning('TRANSACTION_RETRY', {
          attempt,
          nextAttemptIn: retryDelay * attempt
        });

        // Délai exponentiel: 1s, 2s, 3s...
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }

  // Toutes les tentatives ont échoué
  throw new ReservationError(
    'Impossible de finaliser la réservation après plusieurs tentatives',
    ErrorCategories.TRANSACTION,
    { originalError: lastError, attempts: maxRetries }
  );
}

/**
 * Valider les données d'une vente avant l'enregistrement
 * @param {Object} venteData - Données de la vente
 * @returns {boolean} true si valide
 * @throws {ReservationError} si invalide
 */
export function validateVenteData(venteData) {
  const requiredFields = [
    'noms', 'prenoms', 'tel', 'montant_ttc',
    'numero_billet', 'status', 'voyage_reference'
  ];

  for (const field of requiredFields) {
    if (!venteData[field]) {
      throw new ReservationError(
        `Champ obligatoire manquant: ${field}`,
        ErrorCategories.VALIDATION,
        { field, venteData }
      );
    }
  }

  // Vérifier que le montant est positif
  if (venteData.montant_ttc <= 0) {
    throw new ReservationError(
      'Le montant doit être supérieur à 0',
      ErrorCategories.VALIDATION,
      { montant: venteData.montant_ttc }
    );
  }

  // Vérifier le statut
  const validStatuses = ['Payer', 'En attente', 'Annuler'];
  if (!validStatuses.includes(venteData.status)) {
    throw new ReservationError(
      `Statut invalide: ${venteData.status}`,
      ErrorCategories.VALIDATION,
      { status: venteData.status, validStatuses }
    );
  }

  return true;
}
