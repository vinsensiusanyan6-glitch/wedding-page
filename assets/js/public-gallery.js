// Public gallery — Google Drive / Apps Script (JSONP agar bisa dibuka dari domain berbeda)
const GALLERY_API_URL = "https://script.google.com/macros/s/AKfycbzHT3gwV-qpFUMKgu26zE7Xt_P4LqRA_bnIKMLv-ga1fJP1YQTevBhduNvi_y8fV_pbKQ/exec";

function applyGallery(result) {
  const photos = (result && result.photos) || {};
  document.querySelectorAll('[data-slot]').forEach(img => {
    const item = photos[img.dataset.slot];
    if (!item || !item.url) return;
    img.src = item.url + '&v=' + Date.now();
    img.onload = () => img.classList.add('remote-loaded');
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const cb = '__weddingGallery_' + Date.now();
  window[cb] = (data) => {
    applyGallery(data);
    delete window[cb];
    script.remove();
  };
  const script = document.createElement('script');
  script.src = GALLERY_API_URL + '?action=list&callback=' + cb + '&ts=' + Date.now();
  script.onerror = () => { delete window[cb]; script.remove(); };
  document.head.appendChild(script);
});
