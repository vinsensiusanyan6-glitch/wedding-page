// =====================================================
// PUBLIC WEDDING GALLERY
// GOOGLE DRIVE + GOOGLE APPS SCRIPT
// =====================================================

// GANTI dengan URL Web App BARU
// yang ketika dibuka menghasilkan:
// {"ok":true,"folder":"wedding","count":0,"photos":{}}

const GALLERY_API_URL = "https://script.google.com/macros/s/AKfycbxK_a2yoYesr9M-EqC42z7WQYCHisJMNqjV_Dd7hA03WICjC-rK3m_ySk9eCe19WGNm/exec";


// =====================================================
// APPLY PHOTOS
// =====================================================
function applyGallery(result) {

  console.log("Google Drive Gallery API:", result);

  if (!result) {
    console.error("Tidak ada response dari Google Apps Script.");
    return;
  }

  if (result.ok !== true) {
    console.error(
      "Google Apps Script error:",
      result.error || result
    );
    return;
  }

  const photos = result.photos || {};

  console.log("Photos:", photos);


  // ==============================
  // GROOM
  // ==============================

  const groomImg = document.getElementById("groomPhoto");

  if (groomImg && photos.groom && photos.groom.url) {

    console.log(
      "Loading GROOM:",
      photos.groom.url
    );

    groomImg.onload = function () {

      console.log("GROOM berhasil ditampilkan");

      groomImg.classList.add("remote-loaded");

      const placeholder =
        groomImg.parentElement.querySelector(".portrait-empty");

      if (placeholder) {
        placeholder.style.display = "none";
      }

    };

    groomImg.onerror = function () {

      console.error(
        "GROOM gagal ditampilkan:",
        photos.groom.url
      );

    };

    groomImg.src = photos.groom.url;

  } else {

    console.log("Foto GROOM tidak ditemukan");

  }


  // ==============================
  // BRIDE
  // ==============================

  const brideImg = document.getElementById("bridePhoto");

  if (brideImg && photos.bride && photos.bride.url) {

    console.log(
      "Loading BRIDE:",
      photos.bride.url
    );

    brideImg.onload = function () {

      console.log("BRIDE berhasil ditampilkan");

      brideImg.classList.add("remote-loaded");

      const placeholder =
        brideImg.parentElement.querySelector(".portrait-empty");

      if (placeholder) {
        placeholder.style.display = "none";
      }

    };

    brideImg.onerror = function () {

      console.error(
        "BRIDE gagal ditampilkan:",
        photos.bride.url
      );

    };

    brideImg.src = photos.bride.url;

  } else {

    console.log("Foto BRIDE tidak ditemukan");

  }

}



// =====================================================
// LOAD GALLERY
// =====================================================

window.addEventListener(
  'DOMContentLoaded',
  () => {

    console.log(
      "Wedding Gallery starting..."
    );

    console.log(
      "API:",
      GALLERY_API_URL
    );


    const callbackName =
      '__weddingGallery_' +
      Date.now();


    const script =
      document.createElement('script');


    window[callbackName] =
      function(data) {

        console.log(
          "Gallery JSONP response:",
          data
        );

        applyGallery(data);


        delete window[
          callbackName
        ];


        if (script.parentNode) {
          script.parentNode.removeChild(
            script
          );
        }

      };


    script.onerror =
      function() {

        console.error(
          "Google Apps Script tidak dapat diakses."
        );

        console.error(
          "URL:",
          GALLERY_API_URL
        );


        delete window[
          callbackName
        ];


        if (script.parentNode) {
          script.parentNode.removeChild(
            script
          );
        }

      };


    script.src =
      GALLERY_API_URL +
      '?action=list' +
      '&callback=' +
      callbackName +
      '&ts=' +
      Date.now();


    document.head.appendChild(
      script
    );

  }
);

const RSVP_API = "https://docs.google.com/spreadsheets/d/1kJnEeQiYQs8Jw2_JTAK5Nz2mXg8nXUGlUndtemoF_sM/edit?usp=sharing";

const rsvpForm = document.getElementById("rsvpForm");
const thanks = document.getElementById("thanks");

if (rsvpForm) {
  rsvpForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const button = rsvpForm.querySelector("button");

    button.disabled = true;
    button.textContent = "SENDING...";

    const formData = new FormData(rsvpForm);

    const data = {
      name: formData.get("name"),
      attendance: formData.get("attendance"),
      guests: formData.get("guests"),
      message: formData.get("message")
    };

    try {
      await fetch(RSVP_API, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(data)
      });

      rsvpForm.reset();
      thanks.classList.add("show");

      button.disabled = false;
      button.textContent = "SEND MY WISH ✦";

    } catch (error) {
      console.error("RSVP error:", error);

      button.disabled = false;
      button.textContent = "SEND MY WISH ✦";

      alert("RSVP gagal dikirim. Silakan coba lagi.");
    }
  });
}
