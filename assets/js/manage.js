const loginView = document.querySelector('#loginView');
const dashboardView = document.querySelector('#dashboardView');
const loginForm = document.querySelector('#loginForm');
const loginError = document.querySelector('#loginError');
const logoutBtn = document.querySelector('#logoutBtn');

const slots = ['groom', 'bride', 'photo01', 'photo02', 'photo03', 'photo04', 'photo05', 'photo06'];

window.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    const response = await fetch('/api/auth', { credentials: 'same-origin', cache: 'no-store' });
    const data = await response.json();
    if (data.authenticated) showDashboard();
    else showLogin();
  } catch (_) {
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
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(Object.fromEntries(new FormData(loginForm)))
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login gagal.');
    loginForm.reset();
    showDashboard();
  } catch (error) {
    loginError.textContent = error.message;
  } finally {
    button.disabled = false;
    button.textContent = 'LOGIN TO MANAGE ✦';
  }
});

logoutBtn?.addEventListener('click', async () => {
  await fetch('/api/auth', { method: 'DELETE', credentials: 'same-origin' });
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
    const response = await fetch('/api/photos', { cache: 'no-store' });
    const photos = await response.json();
    document.querySelectorAll('.manage-card').forEach(card => {
      const slot = card.dataset.slot;
      const img = card.querySelector('img');
      const placeholder = card.querySelector('.manage-placeholder');
      if (photos[slot]) {
        img.src = photos[slot];
        img.onload = () => { img.classList.add('loaded'); placeholder.hidden = true; };
      } else {
        img.removeAttribute('src');
        img.classList.remove('loaded');
        placeholder.hidden = false;
      }
    });
  } catch (_) {
    toast('Tidak dapat memuat foto.');
  }
}

function bindCards() {
  document.querySelectorAll('.manage-card').forEach(card => {
    if (card.dataset.bound) return;
    card.dataset.bound = '1';
    const input = card.querySelector('input[type=file]');
    const deleteBtn = card.querySelector('.delete-btn');
    input.addEventListener('change', () => input.files[0] && uploadSlot(card, input.files[0]));
    deleteBtn.addEventListener('click', () => removeSlot(card));
  });
}

async function uploadSlot(card, file) {
  if (file.size > 10 * 1024 * 1024) return setStatus(card, 'Maksimal 10 MB.');
  if (!file.type.startsWith('image/')) return setStatus(card, 'File harus berupa gambar.');

  const slot = card.dataset.slot;
  setStatus(card, 'Uploading...');
  const form = new FormData();
  form.append('file', file, file.name);

  try {
    const response = await fetch(`/api/upload?slot=${encodeURIComponent(slot)}`, {
      method: 'POST', credentials: 'same-origin', body: form
    });
    const data = await response.json();
    if (response.status === 401) return showLogin();
    if (!response.ok) throw new Error(data.error || 'Upload gagal.');

    const img = card.querySelector('img');
    const placeholder = card.querySelector('.manage-placeholder');
    img.src = `${data.url}?v=${Date.now()}`;
    img.onload = () => { img.classList.add('loaded'); placeholder.hidden = true; };
    setStatus(card, 'Foto berhasil diupload.');
    toast(`${slot.toUpperCase()} berhasil diperbarui.`);
  } catch (error) {
    setStatus(card, error.message);
  } finally {
    card.querySelector('input').value = '';
  }
}

async function removeSlot(card) {
  const slot = card.dataset.slot;
  if (!confirm(`Hapus foto ${slot}?`)) return;
  setStatus(card, 'Removing...');
  try {
    const response = await fetch(`/api/upload?slot=${encodeURIComponent(slot)}`, { method: 'DELETE', credentials: 'same-origin' });
    const data = await response.json();
    if (response.status === 401) return showLogin();
    if (!response.ok) throw new Error(data.error || 'Gagal menghapus.');
    const img = card.querySelector('img');
    img.removeAttribute('src');
    img.classList.remove('loaded');
    card.querySelector('.manage-placeholder').hidden = false;
    setStatus(card, 'Foto dihapus.');
    toast('Foto berhasil dihapus.');
  } catch (error) {
    setStatus(card, error.message);
  }
}

function setStatus(card, text) {
  card.querySelector('.card-status').textContent = text;
}

function toast(message) {
  const el = document.querySelector('#manageToast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => el.classList.remove('show'), 2800);
}
