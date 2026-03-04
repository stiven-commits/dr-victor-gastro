export const TREATMENT_OPTIONS = [
  "Manga Gástrica", "Balón Allurion", "Balón Ovalsiluethe", "Método Tore", "CPRE", "Consulta presencial", "Consulta online", "Retiro de balón"
];

export const MEDICAL_TREATMENTS = [
  "Manga Gástrica", "Balón Allurion", "Balón Ovalsiluethe", "Método Tore", "CPRE", "Retiro de balón"
];

export const getTreatmentsArray = (treatmentStr) => {
  if (Array.isArray(treatmentStr)) return treatmentStr; // Si ya es array, devolverlo
  if (!treatmentStr || typeof treatmentStr !== 'string' || treatmentStr === 'Por definir') return [];
  return treatmentStr.split(',').map(t => t.trim()).filter(Boolean);
};

export const parseNotes = (notesData) => {
  if (!notesData) return [];
  // CORRECCIÓN: Si ya es un array (viene listo de la BD), úsalo directamente
  if (Array.isArray(notesData)) return notesData;
  
  try {
    const parsed = JSON.parse(notesData);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    // Si falla el parseo, asumimos que es una nota antigua en texto plano
    return [{ id: 'old-note', date: new Date().toISOString(), content: notesData }];
  }
  return [];
};

export const parseHistory = (historyData) => {
  if (!historyData) return [];
  // CORRECCIÓN CRÍTICA: Si n8n devuelve el JSON ya procesado como Array
  if (Array.isArray(historyData)) return historyData;

  try {
    const parsed = JSON.parse(historyData);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    return [];
  }
  return [];
};
