const loginView = document.querySelector('#loginView');
const dashboardView = document.querySelector('#dashboardView');
const loginForm = document.querySelector('#loginForm');
const loginError = document.querySelector('#loginError');
const logoutBtn = document.querySelector('#logoutBtn');

const slots = [
  'groom',
  'bride',
  'photo01',
  'photo02',
  'photo03',
  'photo04',
  'photo05',
  'photo06'
];

window.addEventListener('DOMContentLoaded', init);

async function init() {
  showLogin();

  try {
    const response = await fetch('/api/auth', {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store'
    });

    if (!response.ok) {
      showLogin();
      return;
    }

    const data = await response.json();

    if (data.authenticated === true) {
      showDashboard();
    } else {
      showLogin();
    }
  } catch (error) {
    showLogin();
  }
}

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  loginError.textContent = '';

  const button = loginForm.querySelector('button');

  button.disabled = true;
  button.textContent = 'CHECKING...';

  try {
    const formData = new FormData(loginForm);

    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      cache: 'no-store',
      body: JSON.stringify({
        username: String(formData.get('username') || '').trim(),
        password: String(formData.get('password') || '')
      })
    });

    let data = {};

    try {
      data = await response.json();
    } catch (_) {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.error || 'Login gagal.');
    }

    loginForm.reset();

    /*
     * Pastikan cookie session benar-benar bisa digunakan
     * sebelum membuka dashboard.
     */
    const verifyResponse = await fetch('/api/auth', {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store'
    });

    const verifyData = await verifyResponse.json();

    if (verifyData.authenticated !== true) {
      throw new Error('Session login tidak berhasil dibuat.');
    }

    showDashboard();

  } catch (error) {
    loginError.textContent =
      error.message || 'Terjadi kesalahan saat login.';
  } finally {
    button.disabled = false;
    button.textContent = 'LOGIN TO MANAGE ✦';
  }
});

logoutBtn?.addEventListener('click', async () => {
  try {
    await fetch('/api/auth', {
      method: 'DELETE',
      credentials: 'same-origin',
      cache: 'no-store'
    });
  } catch (_) {
    // Tetap kembali ke halaman login meskipun request gagal.
  }

  showLogin();
});

function showLogin() {
  loginView.hidden = false;
  dashboardView.hidden = true;
}

function showDashboard() {
  loginView.hidden = true;
  dashboardView.hidden = false;

  loadPhotos();
  bindCards();
}

async function loadPhotos() {
  try {
    const response = await fetch('/api/photos', {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store'
    });

    if (response.status === 401) {
      showLogin();
      return;
    }

    if (!response.ok) {
      throw new Error('Gagal memuat foto.');
    }

    const photos = await response.json();

    document.querySelectorAll('.manage-card').forEach(card => {
      const slot = card.dataset.slot;
      const img = card.querySelector('img');
      const placeholder = card.querySelector('.manage-placeholder');

      if (photos[slot]) {
        img.src = photos[slot];

        img.onload = () => {
          img.classList.add('loaded');
          placeholder.hidden = true;
        };

        img.onerror = () => {
          img.removeAttribute('src');
          img.classList.remove('loaded');
          placeholder.hidden = false;
        };

      } else {
        img.removeAttribute('src');
        img.classList.remove('loaded');
        placeholder.hidden = false;
      }
    });

  } catch (error) {
    toast('Tidak dapat memuat foto.');
  }
}

function bindCards() {
  document.querySelectorAll('.manage-card').forEach(card => {
    if (card.dataset.bound === '1') return;

    card.dataset.bound = '1';

    const input = card.querySelector('input[type="file"]');
    const deleteBtn = card.querySelector('.delete-btn');

    if (input) {
      input.addEventListener('change', () => {
        if (input.files && input.files[0]) {
          uploadSlot(card, input.files[0]);
        }
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        removeSlot(card);
      });
    }
  });
}

async function uploadSlot(card, file) {
  if (file.size > 10 * 1024 * 1024) {
    setStatus(card, 'Maksimal 10 MB.');
    return;
  }

  if (!file.type.startsWith('image/')) {
    setStatus(card, 'File harus berupa gambar.');
    return;
  }

  const slot = card.dataset.slot;

  setStatus(card, 'Uploading...');

  const form = new FormData();

  form.append('file', file, file.name);

  try {
    const response = await fetch(
      `/api/upload?slot=${encodeURIComponent(slot)}`,
      {
        method: 'POST',
        credentials: 'same-origin',
        body: form
      }
    );

    let data = {};

    try {
      data = await response.json();
    } catch (_) {
      data = {};
    }

    if (response.status === 401) {
      showLogin();
      return;
    }

    if (!response.ok) {
      throw new Error(data.error || 'Upload gagal.');
    }

    const img = card.querySelector('img');
    const placeholder = card.querySelector('.manage-placeholder');

    img.src = `${data.url}?v=${Date.now()}`;

    img.onload = () => {
      img.classList.add('loaded');
      placeholder.hidden = true;
    };

    setStatus(card, 'Foto berhasil diupload.');

    toast(`${slot.toUpperCase()} berhasil diperbarui.`);

  } catch (error) {
    setStatus(
      card,
      error.message || 'Upload gagal.'
    );

  } finally {
    const input = card.querySelector('input[type="file"]');

    if (input) {
      input.value = '';
    }
  }
}

async function removeSlot(card) {
  const slot = card.dataset.slot;

  if (!confirm(`Hapus foto ${slot}?`)) {
    return;
  }

  setStatus(card, 'Removing...');

  try {
    const response = await fetch(
      `/api/upload?slot=${encodeURIComponent(slot)}`,
      {
        method: 'DELETE',
        credentials: 'same-origin',
        cache: 'no-store'
      }
    );

    let data = {};

    try {
      data = await response.json();
    } catch (_) {
      data = {};
    }

    if (response.status === 401) {
      showLogin();
      return;
    }

    if (!response.ok) {
      throw new Error(
        data.error || 'Gagal menghapus.'
      );
    }

    const img = card.querySelector('img');
    const placeholder = card.querySelector('.manage-placeholder');

    img.removeAttribute('src');
    img.classList.remove('loaded');

    placeholder.hidden = false;

    setStatus(card, 'Foto dihapus.');

    toast('Foto berhasil dihapus.');

  } catch (error) {
    setStatus(
      card,
      error.message || 'Gagal menghapus foto.'
    );
  }
}

function setStatus(card, text) {
  const status = card.querySelector('.card-status');

  if (status) {
    status.textContent = text;
  }
}

function toast(message) {
  const el = document.querySelector('#manageToast');

  if (!el) {
    return;
  }

  el.textContent = message;
  el.classList.add('show');

  clearTimeout(window.__toast);

  window.__toast = setTimeout(() => {
    el.classList.remove('show');
  }, 2800);
}