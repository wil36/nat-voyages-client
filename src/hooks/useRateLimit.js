import { useState, useEffect, useCallback } from "react";

/**
 * Hook de Rate Limiting strict
 * - Maximum 3 tentatives en 10 secondes
 * - Si dépassé: blocage de 10 minutes
 *
 * @returns {Object} { canProceed, remainingAttempts, blockTimeRemaining, recordAttempt, reset }
 */
export const useRateLimit = () => {
  const MAX_ATTEMPTS = 3;
  const WINDOW_MS = 10000; // 10 secondes
  const BLOCK_DURATION_MS = 600000; // 10 minutes

  // Charger depuis localStorage pour persister entre les rafraîchissements
  const loadState = () => {
    try {
      const saved = localStorage.getItem("rateLimit_state");
      if (saved) {
        const state = JSON.parse(saved);
        return {
          attempts: state.attempts || [],
          blockedUntil: state.blockedUntil || null,
        };
      }
    } catch (error) {
      console.error("Erreur chargement rate limit:", error);
    }
    return { attempts: [], blockedUntil: null };
  };

  const [state, setState] = useState(loadState);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Sauvegarder dans localStorage
  const saveState = useCallback((newState) => {
    try {
      localStorage.setItem("rateLimit_state", JSON.stringify(newState));
      setState(newState);
    } catch (error) {
      console.error("Erreur sauvegarde rate limit:", error);
    }
  }, []);

  // Mettre à jour l'heure actuelle toutes les secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Nettoyer les anciennes tentatives
  useEffect(() => {
    const now = Date.now();
    const validAttempts = state.attempts.filter(
      (timestamp) => now - timestamp < WINDOW_MS
    );

    if (validAttempts.length !== state.attempts.length) {
      saveState({
        ...state,
        attempts: validAttempts,
      });
    }
  }, [currentTime, state, saveState]);

  // Vérifier si l'utilisateur peut procéder
  const canProceed = () => {
    const now = Date.now();

    // Vérifier si bloqué
    if (state.blockedUntil && now < state.blockedUntil) {
      return false;
    }

    // Si le blocage est expiré, nettoyer
    if (state.blockedUntil && now >= state.blockedUntil) {
      saveState({ attempts: [], blockedUntil: null });
      return true;
    }

    // Vérifier le nombre de tentatives récentes
    const recentAttempts = state.attempts.filter(
      (timestamp) => now - timestamp < WINDOW_MS
    );

    return recentAttempts.length < MAX_ATTEMPTS;
  };

  // Enregistrer une tentative
  const recordAttempt = () => {
    const now = Date.now();
    const recentAttempts = state.attempts.filter(
      (timestamp) => now - timestamp < WINDOW_MS
    );

    const newAttempts = [...recentAttempts, now];

    // Si on atteint la limite, bloquer pour 10 minutes
    if (newAttempts.length >= MAX_ATTEMPTS) {
      const blockedUntil = now + BLOCK_DURATION_MS;
      saveState({
        attempts: newAttempts,
        blockedUntil,
      });
      console.warn(
        `🚫 Rate limit atteint! Blocage jusqu'à ${new Date(
          blockedUntil
        ).toLocaleTimeString()}`
      );
    } else {
      saveState({
        ...state,
        attempts: newAttempts,
      });
    }
  };

  // Calculer les tentatives restantes
  const getRemainingAttempts = () => {
    const now = Date.now();
    const recentAttempts = state.attempts.filter(
      (timestamp) => now - timestamp < WINDOW_MS
    );
    return Math.max(0, MAX_ATTEMPTS - recentAttempts.length);
  };

  // Calculer le temps restant de blocage
  const getBlockTimeRemaining = () => {
    if (!state.blockedUntil) return 0;
    const remaining = state.blockedUntil - currentTime;
    return Math.max(0, remaining);
  };

  // Réinitialiser (pour debug uniquement)
  const reset = () => {
    localStorage.removeItem("rateLimit_state");
    setState({ attempts: [], blockedUntil: null });
  };

  return {
    canProceed: canProceed(),
    remainingAttempts: getRemainingAttempts(),
    blockTimeRemaining: getBlockTimeRemaining(),
    recordAttempt,
    reset, // À utiliser UNIQUEMENT en développement
  };
};
