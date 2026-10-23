// Contenido original del portafolio. Se usa si todavía no se guardó nada desde el panel
// y como base para completar campos que falten.
// En los textos, **palabra** se muestra en negrita.
window.DEFAULT_CONTENT = {
  brand: {
    name: 'Keviin',
    subtitle: 'Screenshare & Staff Specialist'
  },
  hero: {
    badge: 'Minecraft PvP & Screenshare',
    title: 'Hola, soy Keviin',
    description: 'Apasionado del mundo de Minecraft PvP, con enfoque en el trabajo de staff y la detección de ventajas desleales (Screenshare). Me caracterizo por el aprendizaje continuo, la responsabilidad y el compromiso con cada comunidad.'
  },
  cards: {
    'sobre-mi': { title: 'Sobre mí', desc: 'Conoce más sobre mi trayectoria en el entorno de Minecraft PvP y staff.' },
    'proposito': { title: 'Propósito', desc: 'Mis metas y el valor que aporto a las comunidades donde participo.' },
    'experiencia': { title: 'Experiencia Staff', desc: 'Mis rangos y participaciones en Holypvp, Vitalismc, Dynamicpvp y SSA.' },
    'intereses': { title: 'Intereses', desc: 'Áreas principales en las que enfoco mi tiempo y desarrollo personal.' },
    'contacto': { title: 'Contacto', desc: 'Acceso a mi correo electrónico personal y mi servidor de Discord.' }
  },
  about: [
    'Soy parte del mundo de **Minecraft PvP** y me interesa el trabajo de staff y **Screenshare**.',
    'Me gusta seguir aprendiendo y mejorar mis conocimientos continuamente.'
  ],
  purpose: [
    'Seguir creciendo en **Screenshare**, ampliar mis conocimientos y aportar a las comunidades en las que participo con **responsabilidad y criterio**.'
  ],
  experience: [
    'Staff Team Holypvp',
    'Staff Team Vitalismc',
    'SS Beginner Dynamicpvp',
    'SS Trainer SSA'
  ],
  interests: ['Minecraft PvP', 'Survival', 'Screenshare', 'Trabajo de Staff'],
  contact: {
    email: 'keviinsoficial@gmail.com',
    discord: 'https://discord.gg/5v4y3DqQ2'
  },
  footer: '© 2026 Keviin. Todos los derechos reservados.'
};

// Combina el contenido guardado con el original, campo por campo.
window.mergeContent = function (saved) {
  const base = JSON.parse(JSON.stringify(window.DEFAULT_CONTENT));
  if (!saved || typeof saved !== 'object') return base;
  const merge = (target, source) => {
    for (const key of Object.keys(target)) {
      const value = source[key];
      if (value === undefined || value === null) continue;
      if (Array.isArray(target[key])) {
        if (Array.isArray(value)) target[key] = value.map(String);
      } else if (typeof target[key] === 'object') {
        if (typeof value === 'object') merge(target[key], value);
      } else if (typeof value === 'string') {
        target[key] = value;
      }
    }
    return target;
  };
  return merge(base, saved);
};
