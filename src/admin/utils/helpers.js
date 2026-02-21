export const TREATMENT_OPTIONS = [
  "Manga Gástrica", "Balón Allurion", "Balón Ovalsiluethe", "Método Tore", "CPRE", "Consulta presencial", "Consulta online", "Retiro de balón"
];

export const MEDICAL_TREATMENTS = [
  "Manga Gástrica", "Balón Allurion", "Balón Ovalsiluethe", "Método Tore", "CPRE", "Retiro de balón"
];

export const getTreatmentsArray = (treatmentStr) => {
  if (!treatmentStr || typeof treatmentStr !== 'string' || treatmentStr === 'Por definir') return [];
  return treatmentStr.split(',').map(t => t.trim()).filter(Boolean);
};

export const parseNotes = (notesStr) => {
  if (!notesStr) return [];
  try {
    const parsed = JSON.parse(notesStr);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    return [{ id: 'old-note', date: new Date().toISOString(), content: notesStr }];
  }
  return [];
};

export const parseHistory = (historyStr) => {
  if (!historyStr) return [];
  try {
    const parsed = JSON.parse(historyStr);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    return [];
  }
  return [];
};
