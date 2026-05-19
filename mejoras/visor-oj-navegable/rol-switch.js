// === Sistema de roles (mockup) ===
// Lee ?rol= de la URL y ajusta la UI según asesor o juez.
// En Angular real, esto vendrá del estado de autenticación.

(function() {
  const params = new URLSearchParams(window.location.search);
  const rol = params.get('rol') || sessionStorage.getItem('visor-rol') || 'asesor';
  sessionStorage.setItem('visor-rol', rol);

  const usuarios = {
    asesor: {
      nombre: 'María Cifuentes',
      iniciales: 'MC',
      rolLabel: 'Asesor',
      avatarClass: '',
      ancladosTitulo: 'Mis anclados',
      ancladosDescripcion: 'Documentos que he preparado para audiencia',
      puedeAnclar: true
    },
    juez: {
      nombre: 'Juan Ramírez',
      iniciales: 'JR',
      rolLabel: 'Juez',
      avatarClass: 'rol-juez',
      ancladosTitulo: 'Anclados para mí',
      ancladosDescripcion: 'Documentos preparados por mi asesor',
      puedeAnclar: false
    }
  };

  const u = usuarios[rol];

  // Actualizar avatar y datos del sidebar
  document.querySelectorAll('.sidebar-user-avatar').forEach(el => {
    el.textContent = u.iniciales;
    if (u.avatarClass) el.classList.add(u.avatarClass);
  });
  document.querySelectorAll('.sidebar-user-name').forEach(el => el.textContent = u.nombre);
  document.querySelectorAll('.sidebar-user-role').forEach(el => el.textContent = u.rolLabel);

  // Actualizar título de la sección de anclados
  const tituloAnclados = document.querySelector('.section-title[data-rol-title]');
  if (tituloAnclados) {
    // El texto antes del posible badge
    const ico = tituloAnclados.querySelector('.section-title-icon');
    tituloAnclados.innerHTML = '';
    if (ico) tituloAnclados.appendChild(ico);
    tituloAnclados.appendChild(document.createTextNode(' ' + u.ancladosTitulo));
  }

  // Si es juez, ocultar acciones de gestión (anclar/desanclar)
  // Aquí solo agregamos un atributo al body que el CSS puede usar
  document.body.setAttribute('data-rol', rol);

  // Para los links que apuntan a otras páginas del shell, preservar el ?rol=
  document.querySelectorAll('a[href$=".html"]').forEach(a => {
    const href = a.getAttribute('href');
    // No tocar links externos ni con query ya armado
    if (href.startsWith('http') || href.includes('?')) return;
    // No tocar el link de login (cerrar sesión)
    if (href === 'login.html') return;
    a.setAttribute('href', href + '?rol=' + rol);
  });

  // Hacer "cerrar sesión" limpie el storage
  document.querySelectorAll('a[href="login.html"]').forEach(a => {
    a.addEventListener('click', () => sessionStorage.removeItem('visor-rol'));
  });
})();

// Avatar dorado/azul según rol — CSS adicional
(function injectRoleStyles() {
  const css = `
    .sidebar-user-avatar.rol-juez {
      background: linear-gradient(135deg, var(--c-dorado-500), var(--c-dorado-700));
      color: var(--c-azul-900);
    }
    body[data-rol="juez"] .doc-item-pin:not(.pinned) {
      display: none;
    }
    body[data-rol="juez"] .doc-item-pin.pinned {
      pointer-events: none;
      cursor: default;
    }
    body[data-rol="juez"] .gallery-item-pin:not(.pinned) {
      display: none;
    }
    body[data-rol="juez"] [data-asesor-only] {
      display: none !important;
    }
    body[data-rol="asesor"] [data-juez-only] {
      display: none !important;
    }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();
