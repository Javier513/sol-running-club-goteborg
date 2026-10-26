/* =======================================================
   SOL RUNNING CLUB GÖTEBORG — MAIN JAVASCRIPT
   =======================================================
   ÍNDICE:
   1. Configuración i18next (traducciones)
   2. Tema claro / oscuro
   3. Navbar (hamburger, scroll, active link)
   4. Accesibilidad (dislexia, lupa, resaltar enlaces)
   5. Lupa (magnifier)
   6. Formulario de contacto + base de datos (localStorage)
   7. Animaciones scroll reveal
   8. Partículas del hero
   9. WhatsApp button
   10. Admin panel (ver registros guardados)
   ======================================================= */

// =======================================================
// 1. CONFIGURACIÓN i18next — TRADUCCIONES
// -------------------------------------------------------
// Las traducciones están en: src/locales/es/, en/, sv/
// Para añadir un idioma nuevo: crea una carpeta en locales/
// y añade su opción en el selector de idioma del HTML.
// =======================================================
const translations = {
  es: {},
  en: {},
  sv: {}
};

// Carga los archivos JSON de traducción
async function loadTranslations() {
  const langs = ['es', 'en', 'sv'];
  for (const lang of langs) {
    try {
      const response = await fetch(`src/locales/${lang}/translation.json`);
      translations[lang] = await response.json();
    } catch (e) {
      console.warn(`No se pudo cargar traducción: ${lang}`, e);
    }
  }
}

// Idioma activo (lee de localStorage o usa español por defecto)
let currentLang = localStorage.getItem('sol-lang') || 'es';

// Obtiene un texto traducido mediante clave con puntos: "nav.home"
function t(key) {
  const keys = key.split('.');
  let value = translations[currentLang];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}

// Aplica todas las traducciones al DOM
// Añade data-i18n="clave.traduccion" en el HTML para traducir elementos
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translated = t(key);
    if (translated) el.textContent = translated;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translated = t(key);
    if (translated) el.placeholder = translated;
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const translated = t(key);
    if (translated) el.title = translated;
  });

  // Actualiza el meta título de la página
  document.title = 'Sol Running Club Göteborg';
}

// Cambia el idioma activo
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('sol-lang', lang);
  applyTranslations();

  // Marca el idioma activo en el selector
  document.querySelectorAll('.lang-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Actualiza el botón principal con la bandera del idioma activo
  const flagMap = { es: 'ES', en: '🏴󠁧󠁢󠁥󠁮󠁧EN', sv: 'SV' };
  const langBtnIcon = document.querySelector('#lang-btn span');
  if (langBtnIcon) langBtnIcon.textContent = flagMap[lang] || '🌐';
}


// =======================================================
// 2. TEMA CLARO / OSCURO
// -------------------------------------------------------
// El tema se guarda en localStorage con la clave 'sol-theme'
// Para cambiar el tema por defecto: cambia 'dark' por 'light'
// abajo en la línea de inicialización.
// =======================================================
let currentTheme = localStorage.getItem('sol-theme') || 'dark';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  currentTheme = theme;
  localStorage.setItem('sol-theme', theme);

  const btn = document.getElementById('theme-btn');
  if (btn) {
    const icon = btn.querySelector('span');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.title = theme === 'dark' ? t('theme.light') : t('theme.dark');
  }
}

function toggleTheme() {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}


// =======================================================
// 3. NAVBAR — HAMBURGER, SCROLL Y ACTIVE LINK
// -------------------------------------------------------
// El navbar se vuelve sólido al hacer scroll > 20px.
// El active link se actualiza con IntersectionObserver.
// =======================================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  // Efecto sombra al hacer scroll
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Abrir / cerrar menú móvil
  hamburger?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Cerrar menú móvil al hacer clic en un enlace
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });

  // Active link con IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === entry.target.id);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
}


// =======================================================
// 4. ACCESIBILIDAD
// -------------------------------------------------------
// Opciones disponibles:
//   - Dislexia:  aplica fuente OpenDyslexic al body
//   - Lupa:      activa la lupa al pasar el ratón
//   - Resaltar enlaces: añade borde dorado a todos los links
//
// Los estados se guardan en localStorage.
// =======================================================
const a11yState = {
  dyslexia: localStorage.getItem('sol-a11y-dyslexia') === 'true',
  magnifier: localStorage.getItem('sol-a11y-magnifier') === 'true',
  links: localStorage.getItem('sol-a11y-links') === 'true',
};

function applyA11yClasses() {
  document.body.classList.toggle('dyslexia', a11yState.dyslexia);
  document.body.classList.toggle('magnifier-mode', a11yState.magnifier);
  document.body.classList.toggle('highlight-links', a11yState.links);

  // Actualiza visualmente los botones de accesibilidad
  const dyslexiaBtn = document.getElementById('a11y-dyslexia');
  const magnBtn = document.getElementById('a11y-magnifier');
  const linksBtn = document.getElementById('a11y-links');

  dyslexiaBtn?.classList.toggle('active', a11yState.dyslexia);
  magnBtn?.classList.toggle('active', a11yState.magnifier);
  linksBtn?.classList.toggle('active', a11yState.links);
}

function toggleA11y(feature) {
  a11yState[feature] = !a11yState[feature];
  localStorage.setItem(`sol-a11y-${feature}`, String(a11yState[feature]));
  applyA11yClasses();

  // Activa/desactiva la lupa
  if (feature === 'magnifier') {
    a11yState.magnifier ? initMagnifier() : destroyMagnifier();
  }
}

function initA11y() {
  document.getElementById('a11y-dyslexia')?.addEventListener('click', () => toggleA11y('dyslexia'));
  document.getElementById('a11y-magnifier')?.addEventListener('click', () => toggleA11y('magnifier'));
  document.getElementById('a11y-links')?.addEventListener('click', () => toggleA11y('links'));
  applyA11yClasses();

  // Si la lupa estaba activa, la reiniciamos
  if (a11yState.magnifier) initMagnifier();
}


// =======================================================
// 5. LUPA (MAGNIFIER)
// -------------------------------------------------------
// Sigue al cursor con una amplificación 2x del contenido.
// La lupa usa la API CSS scale() para simular el zoom.
// =======================================================
let magnifierActive = false;
let magnifierEl = null;

function initMagnifier() {
  if (magnifierActive) return;
  magnifierActive = true;
  magnifierEl = document.getElementById('magnifier-glass');

  document.addEventListener('mousemove', handleMagnifier);
}

function handleMagnifier(e) {
  if (!magnifierEl || !magnifierActive) return;
  const x = e.clientX;
  const y = e.clientY;

  magnifierEl.style.left = `${x}px`;
  magnifierEl.style.top = `${y}px`;

  // Captura el contenido debajo del cursor mediante CSS background
  const zoom = 2;
  const size = 150;
  const bgX = -(x * zoom - size / 2);
  const bgY = -(y * zoom - size / 2);

  magnifierEl.style.backgroundImage = `url(${window.location.href})`;
  magnifierEl.style.backgroundSize = `${window.innerWidth * zoom}px ${window.innerHeight * zoom}px`;
  magnifierEl.style.backgroundPosition = `${bgX}px ${bgY}px`;
}

function destroyMagnifier() {
  magnifierActive = false;
  document.removeEventListener('mousemove', handleMagnifier);
}


// =======================================================
// 6. FORMULARIO DE CONTACTO + BASE DE DATOS (localStorage)
// -------------------------------------------------------
// Los registros se guardan en localStorage con la clave
// 'sol-registros'. Para ver todos los registros abre la
// consola del navegador y escribe: verRegistros()
//
// 📌 PARA CONECTAR A UNA BASE DE DATOS REAL:
//   - Reemplaza la función guardarEnBD() con una llamada
//     fetch() a tu backend o API (Firebase, Supabase, etc.)
//   - Ejemplo: await fetch('/api/registro', { method:'POST', body: JSON.stringify(datos) })
//   - Ver comentario dentro de guardarEnBD() para más detalles.
// =======================================================

// Guarda un registro en localStorage (simula la base de datos)
function guardarEnBD(datos) {
  // ----------------------------------------------------------
  // 📌 PUNTO DE MODIFICACIÓN — BASE DE DATOS REAL
  // ----------------------------------------------------------
  // Cuando tengas un backend real, sustituye este bloque por:
  //
  //   const response = await fetch('TU_URL_API/registros', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(datos)
  //   });
  //   return response.ok;
  //
  // Opciones recomendadas:
  //   - Firebase Firestore (gratis hasta cierto límite)
  //   - Supabase (PostgreSQL gratis)
  //   - Google Sheets via Apps Script (muy sencillo)
  // ----------------------------------------------------------

  const registros = JSON.parse(localStorage.getItem('sol-registros') || '[]');
  datos.id = Date.now();
  datos.fecha_registro = new Date().toLocaleString('es-ES');
  registros.push(datos);
  localStorage.setItem('sol-registros', JSON.stringify(registros));
  return true;
}

// Función global para ver registros en consola del navegador
window.verRegistros = function() {
  const registros = JSON.parse(localStorage.getItem('sol-registros') || '[]');
  if (registros.length === 0) {
    console.log('📭 No hay registros aún.');
    return;
  }
  console.table(registros);
  console.log(`📊 Total de registros: ${registros.length}`);
  return registros;
};

// Exporta los registros como CSV (útil para Excel)
window.exportarCSV = function() {
  const registros = JSON.parse(localStorage.getItem('sol-registros') || '[]');
  if (!registros.length) { alert('No hay registros.'); return; }

  const headers = Object.keys(registros[0]).join(',');
  const rows = registros.map(r => Object.values(r).map(v => `"${v}"`).join(','));
  const csv = [headers, ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sol-registros-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const feedback = document.getElementById('form-feedback');

    // Deshabilita el botón mientras procesa
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Enviando...';

    // Recoge los datos del formulario
    const datos = {
      nombre: form.nombre.value.trim(),
      apellidos: form.apellidos.value.trim(),
      fecha_nacimiento: form.fecha_nacimiento.value,
      email: form.email.value.trim(),
      telefono: form.telefono.value.trim(),
      nivel: form.nivel.value,
      motivo: form.motivo.value,
      mensaje: form.mensaje.value.trim(),
    };

    try {
      const ok = guardarEnBD(datos);

      if (ok) {
        // Éxito
        feedback.className = 'form-feedback success';
        feedback.innerHTML = `
          <span class="form-feedback-icon">✅</span>
          <h4>${t('contact.success_title')}</h4>
          <p>${t('contact.success_text')}</p>
        `;
        form.reset();
      } else {
        throw new Error('Error al guardar');
      }
    } catch (err) {
      feedback.className = 'form-feedback error';
      feedback.innerHTML = `
        <span class="form-feedback-icon">❌</span>
        <h4>Error</h4>
        <p>${t('contact.error_text')}</p>
      `;
    }

    submitBtn.disabled = false;
    submitBtn.setAttribute('data-i18n', 'contact.send');
    submitBtn.textContent = t('contact.send');

    // Scroll al mensaje de feedback
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Oculta el mensaje tras 6 segundos
    setTimeout(() => { feedback.className = 'form-feedback'; }, 6000);
  });
}


// =======================================================
// 7. SCROLL REVEAL ANIMATIONS
// -------------------------------------------------------
// Añade la clase 'reveal' a cualquier elemento HTML
// para que aparezca con animación al hacer scroll.
// =======================================================
function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}


// =======================================================
// 8. PARTÍCULAS ANIMADAS DEL HERO
// -------------------------------------------------------
// Genera partículas flotantes en el fondo del hero.
// Puedes ajustar el número en COUNT y los colores.
// =======================================================
function initParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;

  const COUNT = 18; // Número de partículas
  const colors = ['#F5A623', '#FFD166', '#FF6B35', '#FFFFFF'];

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');

    const size = Math.random() * 10 + 4;
    const left = Math.random() * 100;
    const duration = Math.random() * 15 + 10;
    const delay = Math.random() * 10;
    const color = colors[Math.floor(Math.random() * colors.length)];

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      bottom: -20px;
      background: ${color};
      opacity: ${Math.random() * 0.4 + 0.1};
      animation-duration: ${duration}s;
      animation-delay: -${delay}s;
    `;

    container.appendChild(p);
  }
}


// =======================================================
// 9. WHATSAPP BUTTON
// -------------------------------------------------------
// 📌 PUNTO DE MODIFICACIÓN — NÚMERO DE WHATSAPP
// -------------------------------------------------------
// Busca la variable WHATSAPP_NUMBER abajo y pon tu número
// en formato internacional SIN espacios ni guiones.
// Ejemplo: '+46701234567' → '46701234567'
//
// La ruta en el código HTML también está marcada con
// el comentario: <!-- 📌 WHATSAPP: modifica aquí el número -->
// =======================================================

// 📌 MODIFICA AQUÍ TU NÚMERO DE WHATSAPP
// Formato: código de país + número, sin +, espacios ni guiones
// Ejemplo Suecia (+46): '46701234567'
// Ejemplo España (+34): '34612345678'
const WHATSAPP_NUMBER = '34666912039'&'46739611443'; // ← CAMBIA ESTO


const WHATSAPP_MESSAGE = encodeURIComponent(
  '¡Hola! Me interesa unirme al Sol Running Club Göteborg 🏃‍♂️☀️'
);

function initWhatsApp() {
  const btn = document.getElementById('whatsapp-btn');
  if (!btn) return;

  // ----------------------------------------------------------
  // 📌 PUNTO DE MODIFICACIÓN — ENLACE DE WHATSAPP
  // ----------------------------------------------------------
  // El enlace se forma automáticamente con WHATSAPP_NUMBER.
  // Solo cambia la variable WHATSAPP_NUMBER de arriba.
  // ----------------------------------------------------------
  btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
}


// =======================================================
// 10. MENÚS DESPLEGABLES (Idioma y Accesibilidad)
// =======================================================
function initDropdowns() {
  // Dropdown idioma
  const langBtn = document.getElementById('lang-btn');
  const langMenu = document.getElementById('lang-menu');

  langBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    langMenu.classList.toggle('open');
    document.getElementById('a11y-menu')?.classList.remove('open');
  });

  document.querySelectorAll('.lang-option').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
      langMenu.classList.remove('open');
    });
  });

  // Dropdown accesibilidad
  const a11yBtn = document.getElementById('a11y-btn');
  const a11yMenu = document.getElementById('a11y-menu');

  a11yBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    a11yMenu.classList.toggle('open');
    langMenu?.classList.remove('open');
  });

  // Cerrar dropdowns al hacer clic fuera
  document.addEventListener('click', () => {
    langMenu?.classList.remove('open');
    a11yMenu?.classList.remove('open');
  });
}


// =======================================================
// INICIALIZACIÓN PRINCIPAL
// Se ejecuta cuando el DOM está listo
// =======================================================
document.addEventListener('DOMContentLoaded', async () => {
  // Carga las traducciones primero
  await loadTranslations();

  // Aplica el idioma guardado
  setLanguage(currentLang);

  // Aplica el tema guardado
  applyTheme(currentTheme);

  // Inicia todos los módulos
  initNavbar();
  initDropdowns();
  initA11y();
  initParticles();
  initScrollReveal();
  initForm();
  initWhatsApp();

  // Botón de cambio de tema
  document.getElementById('theme-btn')?.addEventListener('click', toggleTheme);

  // Log de bienvenida en consola 🎉
  console.log('%c☀️ Sol Running Club Göteborg', 'font-size:20px; color:#F5A623; font-weight:bold;');
  console.log('%cPara ver los registros del formulario escribe: verRegistros()', 'color:#888;');
  console.log('%cPara exportar a CSV escribe: exportarCSV()', 'color:#888;');
});
