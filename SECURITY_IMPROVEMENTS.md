# 🔐 Améliorations de Sécurité - NAT Voyages

## ⚠️ Problèmes Identifiés

### 1. Rate Limiting (Limitation de débit)
**Problème** : Aucune protection contre les attaques par force brute ou spam de réservations.

### 2. Gestion d'erreurs des transactions
**Problème** : La transaction Firestore manque de gestion d'erreurs robuste et de logs.

---

## ✅ Solutions Proposées

### SOLUTION 1: Rate Limiting côté client

Créer un hook personnalisé pour limiter les réservations.

#### Étape 1: Créer le fichier `src/hooks/useRateLimit.js`

```javascript
import { useState, useEffect } from 'react';

/**
 * Hook pour implémenter un rate limiting côté client
 * @param {number} maxAttempts - Nombre maximum de tentatives
 * @param {number} windowMs - Fenêtre de temps en millisecondes
 * @returns {Object} { canProceed, remainingAttempts, resetTime, recordAttempt }
 */
export const useRateLimit = (maxAttempts = 3, windowMs = 60000) => {
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    // Nettoyer les anciennes tentatives toutes les secondes
    const interval = setInterval(() => {
      const now = Date.now();
      setAttempts(prev => prev.filter(timestamp => now - timestamp < windowMs));
    }, 1000);

    return () => clearInterval(interval);
  }, [windowMs]);

  const canProceed = () => {
    const now = Date.now();
    const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
    return recentAttempts.length < maxAttempts;
  };

  const recordAttempt = () => {
    setAttempts(prev => [...prev, Date.now()]);
  };

  const remainingAttempts = () => {
    const now = Date.now();
    const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
    return Math.max(0, maxAttempts - recentAttempts.length);
  };

  const getResetTime = () => {
    if (attempts.length === 0) return null;
    const oldestAttempt = Math.min(...attempts);
    return new Date(oldestAttempt + windowMs);
  };

  return {
    canProceed: canProceed(),
    remainingAttempts: remainingAttempts(),
    resetTime: getResetTime(),
    recordAttempt,
  };
};
```

#### Étape 2: Utiliser le hook dans DetailVoyage.js

```javascript
// Ajouter en haut du composant
import { useRateLimit } from '../hooks/useRateLimit';

// Dans le composant DetailVoyage
export default function DetailVoyage() {
  // Rate limiting: 5 tentatives max par minute
  const rateLimit = useRateLimit(5, 60000);

  const handleTicketSubmit = async (e) => {
    e.preventDefault();

    // VÉRIFICATION RATE LIMIT
    if (!rateLimit.canProceed) {
      const resetTime = rateLimit.resetTime;
      const minutesLeft = Math.ceil((resetTime - new Date()) / 60000);

      alert(
        `⚠️ Trop de tentatives de réservation.\n` +
        `Veuillez patienter ${minutesLeft} minute(s) avant de réessayer.\n` +
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
      // Enregistrer la tentative
      rateLimit.recordAttempt();

      // Vérifier la disponibilité des places en temps réel
      const { voyageData, placesNecessaires } = await verifierDisponibilite();

      // ... reste du code de transaction
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);

      // NE PAS enregistrer comme tentative si erreur de validation
      // (seulement pour les vraies tentatives de soumission)

      alert(`Erreur lors de l'enregistrement des billets: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
}
```

---

### SOLUTION 2: Améliorer la gestion d'erreurs des transactions

#### Créer un utilitaire de gestion d'erreurs robuste

Fichier: `src/utils/transactionHelpers.js`

```javascript
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

      // Ne pas réessayer si c'est une erreur de validation
      if (error.code === 'permission-denied' ||
          error.code === 'invalid-argument' ||
          error.message.includes('Plus assez de places')) {
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
          nextAttemptIn: retryDelay
        });

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
```

#### Appliquer dans DetailVoyage.js

```javascript
import {
  ReservationError,
  ErrorCategories,
  TransactionLogger,
  executeTransactionWithRetry
} from '../utils/transactionHelpers';

// Dans handleTicketSubmit
const handleTicketSubmit = async (e) => {
  e.preventDefault();

  // Validation et rate limiting...

  setIsSubmitting(true);

  try {
    TransactionLogger.log('RESERVATION_START', {
      passagers: reservationForm.passagers.length,
      typeVoyage: reservationForm.type_voyage,
    });

    // Vérifier la disponibilité
    const { voyageData, placesNecessaires } = await verifierDisponibilite();

    TransactionLogger.success('AVAILABILITY_CHECK', { placesNecessaires });

    // Pré-traitement des clients...
    const clientsData = await prepareClientsData();

    // Exécuter la transaction avec retry automatique
    const result = await executeTransactionWithRetry(
      db,
      async (transaction) => {
        return await performReservationTransaction(
          transaction,
          voyageData,
          placesNecessaires,
          clientsData
        );
      },
      3, // 3 tentatives max
      1000 // 1 seconde entre chaque tentative
    );

    TransactionLogger.success('RESERVATION_COMPLETE', {
      ventesCount: result.ventes.length,
      montantTotal,
    });

    // Générer les billets PDF
    await genererFactureMultiPassagers(result.ventes);

    // Réinitialiser le formulaire...
    resetForm();

    // Message de succès
    alert(
      `✅ Réservation réussie!\n\n` +
      `${result.ventes.length} billet(s) réservé(s)\n` +
      `Montant total: ${montantTotal.toLocaleString()} FCFA\n\n` +
      `Les billets s'ouvrent dans une nouvelle fenêtre.`
    );

  } catch (error) {
    // Gestion d'erreur améliorée
    if (error instanceof ReservationError) {
      error.log();

      // Message utilisateur personnalisé selon le type d'erreur
      alert(error.getUserMessage());

      // Si l'erreur peut être réessayée, proposer de réessayer
      if (error.shouldRetry()) {
        const retry = confirm(
          'Voulez-vous réessayer la réservation?\n\n' +
          'Cela peut résoudre les problèmes temporaires de connexion.'
        );

        if (retry) {
          // Relancer la soumission
          setTimeout(() => handleTicketSubmit(e), 500);
        }
      }
    } else {
      // Erreur non catégorisée
      console.error("Erreur inattendue:", error);
      TransactionLogger.error('UNKNOWN_ERROR', error);

      alert(
        '⚠️ Une erreur inattendue s\'est produite.\n\n' +
        'Détails: ' + error.message + '\n\n' +
        'Veuillez réessayer ou contacter le support si le problème persiste.'
      );
    }
  } finally {
    setIsSubmitting(false);
  }
};
```

---

### SOLUTION 3: Rate Limiting côté serveur (Recommandé)

Pour une sécurité maximale, implémenter également un rate limiting côté serveur avec Cloud Functions.

Fichier: `functions/src/rateLimiter.js` (nécessite Firebase Functions)

```javascript
const admin = require('firebase-admin');

/**
 * Rate limiter basé sur l'IP et l'ID utilisateur
 */
class RateLimiter {
  constructor(maxAttempts = 10, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }

  getKey(ip, userId = 'anonymous') {
    return `${ip}_${userId}`;
  }

  async checkLimit(ip, userId) {
    const key = this.getKey(ip, userId);
    const now = Date.now();

    // Nettoyer les anciennes tentatives
    if (this.attempts.has(key)) {
      const userAttempts = this.attempts.get(key);
      const validAttempts = userAttempts.filter(
        timestamp => now - timestamp < this.windowMs
      );
      this.attempts.set(key, validAttempts);
    }

    const attempts = this.attempts.get(key) || [];

    if (attempts.length >= this.maxAttempts) {
      const oldestAttempt = Math.min(...attempts);
      const resetTime = new Date(oldestAttempt + this.windowMs);

      throw new Error(
        `Trop de tentatives. Réessayez après ${resetTime.toLocaleTimeString()}`
      );
    }

    return true;
  }

  recordAttempt(ip, userId) {
    const key = this.getKey(ip, userId);
    const attempts = this.attempts.get(key) || [];
    attempts.push(Date.now());
    this.attempts.set(key, attempts);
  }
}

module.exports = { RateLimiter };
```

---

## 📊 Résumé des améliorations

| Amélioration | Priorité | Complexité | Impact |
|--------------|----------|------------|--------|
| Rate Limiting client | 🔴 Haute | Faible | Empêche les abus basiques |
| Gestion d'erreurs améliorée | 🔴 Haute | Moyenne | Meilleure UX et debugging |
| Transaction logging | 🟡 Moyenne | Faible | Audit et traçabilité |
| Rate Limiting serveur | 🟢 Recommandé | Moyenne | Protection maximale |

---

## 🚀 Ordre d'implémentation recommandé

1. ✅ **Gestion d'erreurs améliorée** (1h)
2. ✅ **Rate Limiting côté client** (30 min)
3. ✅ **Transaction logging** (30 min)
4. 🔜 **Rate Limiting serveur** (2h, nécessite Cloud Functions)

---

## 📝 Notes importantes

- Le rate limiting côté client est facilement contournable mais décourage les utilisateurs normaux
- Le rate limiting côté serveur est la vraie protection (nécessite Firebase Functions payantes)
- Combinez les deux approches pour une protection optimale
- Gardez des logs détaillés pour identifier les comportements suspects

