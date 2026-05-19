// === Sistema de anclados con localStorage ===
// Estructura: { "EXP_NUM": [ { id, name, type, size, category }, ... ] }

const ANCLADOS_KEY = 'visor-oj-anclados';

const ancladosManager = {

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(ANCLADOS_KEY)) || {};
    } catch (e) {
      return {};
    }
  },

  saveAll(data) {
    localStorage.setItem(ANCLADOS_KEY, JSON.stringify(data));
  },

  getByExpediente(expNum) {
    return this.getAll()[expNum] || [];
  },

  isPinned(expNum, docId) {
    return this.getByExpediente(expNum).some(d => d.id === docId);
  },

  toggle(expNum, doc) {
    const all = this.getAll();
    const list = all[expNum] || [];
    const idx = list.findIndex(d => d.id === doc.id);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(doc);
    }
    all[expNum] = list;
    this.saveAll(all);
    return idx === -1; // true si se ancló, false si se desancló
  },

  countByExpediente(expNum) {
    return this.getByExpediente(expNum).length;
  },

  totalCount() {
    const all = this.getAll();
    return Object.values(all).reduce((sum, list) => sum + list.length, 0);
  },

  expedientesConAnclados() {
    const all = this.getAll();
    return Object.keys(all).filter(exp => all[exp].length > 0);
  },

  clear() {
    localStorage.removeItem(ANCLADOS_KEY);
  },

  // Inicializar con datos de muestra si no hay nada
  initSampleData() {
    if (Object.keys(this.getAll()).length === 0) {
      const sample = {
        '01173-2024-00428': [
          { id: 'demanda-inicial', name: 'Demanda inicial.pdf', type: 'pdf', size: '240 KB', category: 'Demandas y resoluciones' },
          { id: 'acta-preliminar', name: 'Acta audiencia preliminar.pdf', type: 'pdf', size: '180 KB', category: 'Demandas y resoluciones' },
          { id: 'informe-ts', name: 'Informe Trabajo Social.docx', type: 'doc', size: '320 KB', category: 'Informes técnicos' },
          { id: 'informe-psi', name: 'Informe Psicológico.docx', type: 'doc', size: '410 KB', category: 'Informes técnicos' },
          { id: 'peritaje-medico', name: 'Peritaje médico.pdf', type: 'pdf', size: '680 KB', category: 'Informes técnicos' },
          { id: 'video-cam', name: 'Video cámara seguridad.mp4', type: 'video', size: '12.4 MB', category: 'Pruebas y evidencias' },
          { id: 'audio-testigo', name: 'Declaración testigo 1.mp3', type: 'audio', size: '3.8 MB', category: 'Pruebas y evidencias' },
          { id: 'evidencia-01', name: 'Evidencia fotográfica 01.jpg', type: 'img', size: '2.1 MB', category: 'Pruebas y evidencias' },
        ],
        '01173-2024-00432': [
          { id: 'resol-proteccion', name: 'Resolución protección integral.pdf', type: 'pdf', size: '120 KB', category: 'Demandas y resoluciones' },
          { id: 'info-psicologico', name: 'Informe psicológico.docx', type: 'doc', size: '290 KB', category: 'Informes técnicos' },
          { id: 'evidencia-visual', name: 'Evidencia visual 01.jpg', type: 'img', size: '1.8 MB', category: 'Pruebas y evidencias' },
          { id: 'declaracion-mp3', name: 'Declaración testigo.mp3', type: 'audio', size: '4.2 MB', category: 'Pruebas y evidencias' },
        ],
        '01173-2024-00501': [
          { id: 'demanda-501', name: 'Demanda inicial.pdf', type: 'pdf', size: '220 KB', category: 'Demandas y resoluciones' },
          { id: 'peritaje-501', name: 'Peritaje médico.docx', type: 'doc', size: '380 KB', category: 'Informes técnicos' },
          { id: 'video-decl', name: 'Video declaración.mp4', type: 'video', size: '18.2 MB', category: 'Pruebas y evidencias' },
        ]
      };
      this.saveAll(sample);
    }
  }
};

// Inicializar al cargar
ancladosManager.initSampleData();
