/**
 * STORE UNIDIRECTIONNEL UNIVERSEL (Point-Free TCA / Redux style)
 * Master Plan — Core Web Templates (03_Developpement_App_and_Design)
 * Plafond strict : < 80 lignes
 */

class UnidirectionalStore {
  constructor(reducer, initialState = {}) {
    this.reducer = reducer;
    this.state = initialState;
    this.listeners = new Set();
    this.isDispatching = false;
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Le listener doit être une fonction.');
    }
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  dispatch(action) {
    if (!action || typeof action.type !== 'string') {
      throw new Error('Une action doit être un objet doté d\'une propriété type (string).');
    }
    if (this.isDispatching) {
      throw new Error('Interdiction de dispatcher une action pendant l\'exécution d\'un reducer.');
    }

    try {
      this.isDispatching = true;
      this.state = this.reducer(this.state, action);
    } finally {
      this.isDispatching = false;
    }

    // Notification déterministe synchrone de tous les observateurs UI
    this.listeners.forEach(listener => {
      try {
        listener(this.state, action);
      } catch (err) {
        console.error('Erreur listener store:', err);
      }
    });

    return action;
  }
}

function createStore(reducer, initialState) {
  return new UnidirectionalStore(reducer, initialState);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UnidirectionalStore, createStore };
}
