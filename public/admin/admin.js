let currentContent = window.mergeContent(null);

const noticeEl = document.getElementById('notice');
const authViewEl = document.getElementById('auth-view');
const authTitleEl = document.getElementById('auth-title');
const authHelpEl = document.getElementById('auth-help');
const authFormEl = document.getElementById('auth-form');
const authEmailEl = document.getElementById('auth-email');
const authPasswordEl = document.getElementById('auth-password');
const authSubmitEl = document.getElementById('auth-submit');
const passwordFieldEl = document.getElementById('password-field');
const authLinksEl = document.getElementById('auth-links');
const editorEl = document.getElementById('editor');
const cardsEditorEl = document.getElementById('cards-editor');
const sessionInfoEl = document.getElementById('session-info');
const logoutBtnEl = document.getElementById('logout-btn');
const saveStatusEl = document.getElementById('save-status');
const resetBtnEl = document.getElementById('reset-btn');
const loadingEl = document.getElementById('loading');

let authMode = 'login';

function showNotice(msg, isError = false) {
  noticeEl.textContent = msg;
  noticeEl.className = `notice ${isError ? 'error' : ''}`;
  noticeEl.classList.remove('hidden');
}

function updateAuthUI() {
  noticeEl.classList.add('hidden');
  if (authMode === 'login') {
    authTitleEl.innerHTML = '<i class="fas fa-lock"></i> Iniciar sesión';
    authHelpEl.textContent = 'Ingresá con tu cuenta de administrador.';
    authSubmitEl.textContent = 'Entrar';
    passwordFieldEl.classList.remove('hidden');
    authPasswordEl.required = true;
  } else if (authMode === 'signup') {
    authTitleEl.innerHTML = '<i class="fas fa-user-plus"></i> Crear cuenta';
    authHelpEl.textContent = 'Creá tu cuenta de administrador.';
    authSubmitEl.textContent = 'Registrarse';
    passwordFieldEl.classList.remove('hidden');
    authPasswordEl.required = true;
  } else if (authMode === 'recover') {
    authTitleEl.innerHTML = '<i class="fas fa-key"></i> Recuperar contraseña';
    authHelpEl.textContent = 'Te enviaremos un correo para restablecer tu clave.';
    authSubmitEl.textContent = 'Enviar correo';
    passwordFieldEl.classList.add('hidden');
    authPasswordEl.required = false;
  }

  authLinksEl.querySelectorAll('[data-auth-mode]').forEach((btn) => {
    btn.classList.toggle('hidden', btn.dataset.authMode === authMode);
  });
}

async function loadData() {
  loadingEl.classList.remove('hidden');
  try {
    const res = await fetch('/api/content');
    if (res.ok) {
      const data = await res.json();
      if (data && data.content) {
        currentContent = window.mergeContent(data.content);
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    loadingEl.classList.add('hidden');
    renderEditor();
  }
}

function renderEditor() {
  editorEl.querySelectorAll('[data-path]').forEach((input) => {
    const path = input.dataset.path.split('.');
    let val = currentContent;
    for (const p of path) val = val ? val[p] : '';
    input.value = val || '';
  });

  cardsEditorEl.innerHTML = '';
  if (currentContent.cards) {
    Object.keys(currentContent.cards).forEach((key) => {
      const card = currentContent.cards[key];
      const div = document.createElement('div');
      div.className = 'card-editor';
      div.innerHTML = `
        <div class="card-editor-head"><i class="fas fa-th"></i> Tarjeta: ${key}</div>
        <label class="field"><span>Título</span><input data-card-key="${key}" data-card-field="title" value="${card.title || ''}"></label>
        <label class="field"><span>Descripción</span><textarea data-card-key="${key}" data-card-field="desc" rows="2">${card.desc || ''}</textarea></label>
      `;
      cardsEditorEl.appendChild(div);
    });
  }

  document.querySelectorAll('.list-editor').forEach((container) => {
    const listKey = container.dataset.list;
    const isMultiline = container.hasAttribute('data-multiline');
    const placeholder = container.dataset.placeholder || '';
    const addLabel = container.dataset.addLabel || 'Agregar elemento';
    const items = currentContent[listKey] || [];

    const renderList = () => {
      container.innerHTML = '';
      items.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'list-row';
        row.innerHTML = `
          ${isMultiline
            ? `<textarea rows="2">${item}</textarea>`
            : `<input type="text" placeholder="${placeholder}" value="${item}">`
          }
          <button type="button" class="icon-btn danger" data-remove="${idx}"><i class="fas fa-trash"></i></button>
        `;

        row.querySelector('input, textarea').addEventListener('input', (e) => {
          items[idx] = e.target.value;
        });

        row.querySelector('[data-remove]').addEventListener('click', () => {
          items.splice(idx, 1);
          renderList();
        });

        container.appendChild(row);
      });

      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'btn btn-outline add-btn';
      addBtn.innerHTML = `<i class="fas fa-plus"></i> ${addLabel}`;
      addBtn.addEventListener('click', () => {
        items.push('');
        renderList();
      });
      container.appendChild(addBtn);
    };

    renderList();
  });

  authViewEl.classList.add('hidden');
  editorEl.classList.remove('hidden');
  logoutBtnEl.classList.remove('hidden');
}

authLinksEl.addEventListener('click', (e) => {
  const mode = e.target.dataset.authMode;
  if (mode) {
    authMode = mode;
    updateAuthUI();
  }
});

authFormEl.addEventListener('submit', (e) => {
  e.preventDefault();
  if (window.netlifyIdentity) {
    if (authMode === 'login' || authMode === 'signup') {
      window.netlifyIdentity.open(authMode);
    } else if (authMode === 'recover') {
      window.netlifyIdentity.open('login');
    }
  }
});

logoutBtnEl.addEventListener('click', () => {
  if (window.netlifyIdentity) {
    window.netlifyIdentity.logout();
  }
});

editorEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  saveStatusEl.textContent = 'Guardando...';

  editorEl.querySelectorAll('[data-path]').forEach((input) => {
    const path = input.dataset.path.split('.');
    if (path.length === 2) {
      currentContent[path[0]][path[1]] = input.value;
    } else if (path.length === 1) {
      currentContent[path[0]] = input.value;
    }
  });

  cardsEditorEl.querySelectorAll('[data-card-key]').forEach((input) => {
    const key = input.dataset.cardKey;
    const field = input.dataset.cardField;
    currentContent.cards[key][field] = input.value;
  });

  const user = window.netlifyIdentity ? window.netlifyIdentity.currentUser() : null;
  const token = user ? await user.jwt() : '';

  try {
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: currentContent }),
    });

    if (res.ok) {
      saveStatusEl.textContent = '¡Cambios guardados con éxito!';
      setTimeout(() => { saveStatusEl.textContent = ''; }, 3000);
    } else {
      const err = await res.json();
      saveStatusEl.textContent = 'Error: ' + (err.error || 'No se pudo guardar');
    }
  } catch (err) {
    saveStatusEl.textContent = 'Error de conexión';
  }
});

resetBtnEl.addEventListener('click', () => {
  if (confirm('¿Querés restaurar los valores por defecto?')) {
    currentContent = window.mergeContent(null);
    renderEditor();
  }
});

if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', (user) => {
    if (user) {
      sessionInfoEl.textContent = `Sesión iniciada como: ${user.email}`;
      loadData();
    } else {
      authViewEl.classList.remove('hidden');
      updateAuthUI();
    }
  });

  window.netlifyIdentity.on('login', (user) => {
    window.netlifyIdentity.close();
    sessionInfoEl.textContent = `Sesión iniciada como: ${user.email}`;
    loadData();
  });

  window.netlifyIdentity.on('logout', () => {
    location.reload();
  });
}