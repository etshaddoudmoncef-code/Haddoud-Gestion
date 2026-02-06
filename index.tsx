import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

/**
 * Lanceur d'application avec tolérance de pannes.
 * Sur Android, les WebViews peuvent être capricieuses sur les chargements ESM.
 */
const mountApplication = () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error("Élément #root introuvable.");
    return;
  }

  try {
    // On s'assure que l'élément est vide avant de monter
    // (Aide à résoudre les problèmes de rafraîchissement à chaud ou de double injection)
    if (rootElement.innerHTML.includes('loader')) {
       // On ne nettoie que si le loader est encore présent
    }

    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Application Ets Haddoud montée avec succès.");
  } catch (error) {
    console.error("Erreur critique au montage React:", error);
    
    // Affichage visuel immédiat en cas d'échec du JS pour l'utilisateur
    const debugDiv = document.getElementById('debug-error');
    if (debugDiv) {
      debugDiv.style.display = 'block';
      debugDiv.innerHTML = `<b>Erreur de lancement :</b><br>${error instanceof Error ? error.message : String(error)}<br><br><button onclick="window.location.reload()" style="background:#000; color:#fff; padding:10px 20px; border-radius:10px; font-weight:bold; font-size:10px; text-transform:uppercase;">Réessayer</button>`;
    }
  }
};

// Exécution immédiate
mountApplication();