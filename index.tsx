import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

/**
 * Montage robuste de l'application
 */
const mount = () => {
  const container = document.getElementById('root');
  if (!container) return;

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Mount error:", err);
    const debug = document.getElementById('debug-error');
    if (debug) {
      debug.style.display = 'block';
      debug.innerHTML = "<b>Erreur fatale :</b> Le moteur React n'a pas pu s'initialiser.";
    }
  }
};

// Exécution au chargement du DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}