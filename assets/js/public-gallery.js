/* Public gallery: no login required to view. Upload is intentionally unavailable here. */

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/photos', { cache: 'no-store' });
    if (!response.ok) return;
    const photos = await response.json();

    document.querySelectorAll('[data-slot]').forEach(img => {
      const url = photos[img.dataset.slot];
      if (!url) return;
      img.src = url;
      img.onload = () => img.classList.add('remote-loaded');
    });
  } catch (_) {
    // Static fallback images remain visible if storage is unavailable.
  }
});
