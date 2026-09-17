/* =====================================================
   WEDDING INVITATION — CORE SCRIPT
   ===================================================== */

const RSVP_ENDPOINT = "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
const WEDDING_DATE = new Date("2026-12-29T09:00:00+07:00").getTime();

const $ = (selector) => document.querySelector(selector);

window.addEventListener("load", () => {
  setTimeout(() => $("#loader")?.classList.add("hide"), 500);
  setupReveal();
  setupNavigation();
  setupMusic();
  setupCountdown();
  setupRSVP();
  setupCopyButtons();
});

function setupNavigation() {
  const nav = $("#nav");
  const menuBtn = $("#menuBtn");
  const mainNav = $("#mainNav");
  const cover = $("#cover");
  const openBtn = $("#openBtn");

  openBtn?.addEventListener("click", () => {
    cover.classList.add("open");
    document.body.classList.remove("locked");
    const music = $("#music");
    music?.play().then(() => $("#musicBtn")?.classList.add("playing")).catch(() => {});
  });

  menuBtn?.addEventListener("click", () => {
    const opened = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(opened));
  });

  mainNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuBtn?.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 30);
  }, { passive: true });
}

function setupMusic() {
  const music = $("#music");
  const button = $("#musicBtn");
  if (!music || !button) return;

  button.addEventListener("click", async () => {
    try {
      if (music.paused) {
        await music.play();
        button.classList.add("playing");
      } else {
        music.pause();
        button.classList.remove("playing");
      }
    } catch (_) {
      showToast("Tambahkan file musik di assets/music/Beautiful In White.mp3");
    }
  });
}

function setupCountdown() {
  const update = () => {
    const distance = WEDDING_DATE - Date.now();
    if (distance <= 0) {
      ["days", "hours", "minutes", "seconds"].forEach(id => { const el = $("#" + id); if (el) el.textContent = "00"; });
      return;
    }
    const days = Math.floor(distance / 86400000);
    const hours = Math.floor(distance / 3600000) % 24;
    const minutes = Math.floor(distance / 60000) % 60;
    const seconds = Math.floor(distance / 1000) % 60;
    $("#days").textContent = String(days).padStart(2, "0");
    $("#hours").textContent = String(hours).padStart(2, "0");
    $("#minutes").textContent = String(minutes).padStart(2, "0");
    $("#seconds").textContent = String(seconds).padStart(2, "0");
  };
  update();
  setInterval(update, 1000);
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach(item => item.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(item => observer.observe(item));
}

function setupRSVP() {
  const form = $("#rsvpForm");
  const thanks = $("#thanks");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button[type=submit]");
    const original = button.textContent;
    button.disabled = true;
    button.textContent = "SENDING...";

    if (RSVP_ENDPOINT.includes("PASTE_GOOGLE")) {
      // Demo mode: keeps the UI working until the Google Apps Script URL is added.
      await new Promise(resolve => setTimeout(resolve, 600));
      form.reset();
      thanks.classList.add("show");
      showToast("RSVP tersimpan di demo. Hubungkan Google Sheets untuk penyimpanan online.");
      button.disabled = false;
      button.textContent = original;
      return;
    }

    try {
      await fetch(RSVP_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams(new FormData(form))
      });
      form.reset();
      thanks.classList.add("show");
      showToast("Terima kasih, RSVP berhasil dikirim.");
    } catch (error) {
      showToast("RSVP gagal dikirim. Silakan coba lagi.");
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  });
}

function setupCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach(button => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        showToast("Nomor rekening berhasil disalin.");
      } catch (_) {
        showToast("Tidak dapat menyalin otomatis.");
      }
    });
  });
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
}
