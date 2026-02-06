
import { GoogleGenAI } from "@google/genai";
import { ProductionRecord } from "../types.ts";

export const analyzeProductionData = async (records: ProductionRecord[]) => {
  if (records.length === 0) return "Aucune donnée disponible pour l'analyse.";

  // Secure API Key access for browser environment where process might not be fully polyfilled
  const apiKey = (window as any).process?.env?.API_KEY || process.env.API_KEY;

  if (!apiKey) {
    return "Clé API manquante. Veuillez configurer l'API_KEY dans l'environnement.";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Format data for the model
  const summary = records.slice(-15).map(r => 
    `- Date: ${r.date}, Lot: ${r.lotNumber}, Produit: ${r.productName}, Prod: ${r.totalWeightKg}kg, Emp: ${r.employeeCount}, Pertes: ${r.wasteKg}kg`
  ).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Voici les dernières données de production des serres :\n${summary}\n\nAnalyse la corrélation entre le nombre d'employés et la production, et identifie les anomalies de pertes.`,
      config: { 
        temperature: 0.7,
        systemInstruction: "Tu es un ingénieur agronome expert en gestion de production pour les Établissements Haddoud Moncef. Tes réponses doivent être en français, stratégiques, concises (max 3 points clés), et orientées vers l'optimisation des coûts et du rendement par employé.",
      }
    });

    return response.text || "Analyse indisponible pour le moment.";
  } catch (err) {
    console.error("Gemini Error:", err);
    return "Le service d'analyse IA est momentanément indisponible. Vérifiez votre clé API ou votre connexion.";
  }
};
