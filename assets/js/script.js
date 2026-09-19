/* =====================================================
   WEDDING INVITATION — CORE SCRIPT
   ===================================================== */

const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSewrQIrtwg6Lvj3WRjoi0RL0x5rkvQmG5iFZiww0z3lSnv_aQ/formResponse";
const FORM_FIELDS = {
  name: "entry.290774784",
  attendance: "entry.1318967976",
  guests: "entry.2054287845",
  message: "entry.692446568"
};
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

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const button = form.querySelector("button[type=submit]");
    const original = button.textContent;
    const data = Object.fromEntries(new FormData(form).entries());

    if (!data.name || !data.message) {
      showToast("Mohon isi nama dan ucapan.");
      return;
    }

    button.disabled = true;
    button.textContent = "SENDING...";

    // Google Forms can receive a response through its formResponse endpoint.
    // We use a hidden iframe so the guest stays on the wedding page.
    const iframeName = "google-form-submit-frame";
    let iframe = document.getElementById(iframeName);

    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = iframeName;
      iframe.name = iframeName;
      iframe.setAttribute("aria-hidden", "true");
      iframe.style.display = "none";
      document.body.appendChild(iframe);
    }

    // IMPORTANT: use the exact answer values accepted by the Google Form.
    // The pre-filled URL supplied by the owner confirms the choice values:
    // attendance = "Hadir" / "Tidak Hadir"
    // guests = "1", "2", "3", "4"
    const params = new URLSearchParams();
    params.set(FORM_FIELDS.name, data.name);
    params.set(
      FORM_FIELDS.attendance,
      data.attendance === "Tidak dapat hadir" ? "Tidak Hadir" : "Hadir"
    );
    params.set(FORM_FIELDS.guests, String(data.guests || "").replace(/\D/g, ""));
    params.set(FORM_FIELDS.message, data.message);
    params.set("submit", "Submit");

    // GET to /formResponse avoids CORS restrictions and does not open
    // the Google Form UI for the guest.
    iframe.src = GOOGLE_FORM_ACTION + "?" + params.toString();

    // Keep the custom guest experience.
    addWish(data);
    form.reset();
    thanks.classList.add("show");
    showToast("Terima kasih, ucapan berhasil dikirim.");

    setTimeout(() => {
      button.disabled = false;
      button.textContent = original;
    }, 1200);
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

function addWish(data, prepend=true) {
  const list = $("#wishesList");
  if (!list) return;
  list.querySelector(".empty-wishes")?.remove();

  const el = document.createElement("article");
  el.className = "wish";
  el.innerHTML = `
    <div class="wish-top">
      <span class="wish-name">${escapeHtml(data.name)}</span>
      <span class="wish-meta">${escapeHtml(data.attendance || "")}</span>
    </div>
    <p class="wish-message">${escapeHtml(data.message)}</p>`;
  if (prepend) list.prepend(el); else list.append(el);
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
