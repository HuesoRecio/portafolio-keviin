// Puntero Personalizado
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');

if (cursorDot && cursorOutline) {
  window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    cursorOutline.animate({
      left: `${posX}px`,
      top: `${posY}px`
    }, { duration: 250, fill: "forwards" });
  });
}

// Los enlaces de confirmación, invitación y recuperación de la cuenta del panel
// llegan a la portada; se reenvían al panel para que los procese.
if (/(confirmation|invite|recovery|email_change)_token=/.test(window.location.hash)) {
  window.location.replace('/admin/' + window.location.hash);
}

// Contenido editable (se carga desde el panel de administración)
let content = window.mergeContent(null);

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Escapa el texto y convierte **palabra** en negrita
function formatText(text) {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function safeUrl(url) {
  return /^https?:\/\//i.test(url) ? url : '#';
}

function paragraphs(list) {
  return list.map((text, i) =>
    `<p${i < list.length - 1 ? ' style="margin-bottom: 12px;"' : ''}>${formatText(text)}</p>`
  ).join('');
}

// Contenido de las ventanas modales
function buildModalData() {
  const icon = (name) => `<i class="fas ${name}" style="color: #31b3e8;"></i> `;
  const email = escapeHtml(content.contact.email);
  const discord = escapeHtml(safeUrl(content.contact.discord));
  return {
    'sobre-mi': {
      title: icon('fa-user-circle') + escapeHtml(content.cards['sobre-mi'].title),
      content: paragraphs(content.about)
    },
    'proposito': {
      title: icon('fa-bullseye') + escapeHtml(content.cards['proposito'].title),
      content: paragraphs(content.purpose)
    },
    'experiencia': {
      title: icon('fa-search-plus') + escapeHtml(content.cards['experiencia'].title),
      content: content.experience.map((item) =>
        `<div class="list-item"><i class="fas fa-shield-alt" style="color: #31b3e8;"></i> ${formatText(item)}</div>`
      ).join('')
    },
    'intereses': {
      title: icon('fa-gamepad') + escapeHtml(content.cards['intereses'].title),
      content: `
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 5px;">
          ${content.interests.map((item) => `<span class="badge" style="font-size: 0.85rem;">${escapeHtml(item)}</span>`).join('')}
        </div>
      `
    },
    'contacto': {
      title: icon('fa-address-book') + escapeHtml(content.cards['contacto'].title),
      content: `
        <div style="margin-bottom: 15px;">
          <label style="font-size: 0.8rem; color: #64748b; display: block; margin-bottom: 5px;">Correo Electrónico:</label>
          <div style="display: flex; gap: 8px;">
            <input type="text" value="${email}" readonly style="background: rgba(0,0,0,0.3); border: 1px solid rgba(49,179,232,0.3); color: #fff; padding: 8px 12px; border-radius: 6px; width: 100%; font-size: 0.85rem;">
            <button class="btn btn-primary" onclick="copyEmail()"><i class="fas fa-copy"></i></button>
            <a href="mailto:${email}" class="btn btn-outline"><i class="fas fa-external-link-alt"></i></a>
          </div>
        </div>
        <div>
          <label style="font-size: 0.8rem; color: #64748b; display: block; margin-bottom: 5px;">Servidor de Discord:</label>
          <a href="${discord}" target="_blank" class="btn btn-primary" style="width: 100%; justify-content: center;"><i class="fab fa-discord"></i> Unirse al Discord</a>
        </div>
      `
    }
  };
}

let modalData = buildModalData();

// Aplica el contenido a la página principal
function renderPage() {
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  setText('brand-name', content.brand.name);
  setText('brand-avatar', (content.brand.name.trim()[0] || 'K').toUpperCase());
  setText('brand-subtitle', content.brand.subtitle);
  setText('hero-badge', content.hero.badge);
  setText('hero-title', content.hero.title);
  const heroDescEl = document.getElementById('hero-desc');
  if (heroDescEl) heroDescEl.innerHTML = formatText(content.hero.description);
  setText('footer-text', content.footer);

  document.querySelectorAll('[data-card]').forEach((card) => {
    const data = content.cards[card.dataset.card];
    if (!data) return;
    const titleEl = card.querySelector('.card-title');
    const descEl = card.querySelector('.card-desc');
    if (titleEl) titleEl.textContent = data.title;
    if (descEl) descEl.textContent = data.desc;
  });

  document.querySelectorAll('[data-discord-link]').forEach((a) => { a.href = safeUrl(content.contact.discord); });
  document.querySelectorAll('[data-email-link]').forEach((a) => { a.href = 'mailto:' + content.contact.email; });

  modalData = buildModalData();
}

fetch('/api/content')
  .then((res) => (res.ok ? res.json() : null))
  .then((data) => {
    if (data && data.content) {
      content = window.mergeContent(data.content);
      renderPage();
    }
  })
  .catch(() => {
    // Si el panel no está disponible se mantiene el contenido original
  });

function openModal(key) {
  const data = modalData[key];
  if (data) {
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');
    const overlayEl = document.getElementById('modal-overlay');
    if (titleEl) titleEl.innerHTML = data.title;
    if (bodyEl) bodyEl.innerHTML = data.content;
    if (overlayEl) overlayEl.classList.add('active');
  }
}

function closeModal() {
  const overlayEl = document.getElementById('modal-overlay');
  if (overlayEl) overlayEl.classList.remove('active');
}

function closeModalOnOverlay(e) {
  if (e.target.id === 'modal-overlay') {
    closeModal();
  }
}

function copyEmail() {
  navigator.clipboard.writeText(content.contact.email);
  const toast = document.getElementById('toast');
  if (toast) {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }
}
