// =====================================================
// WEDDING LUXURY — ADMIN PHOTO MANAGER
// GOOGLE DRIVE + GOOGLE APPS SCRIPT
// =====================================================

const ADMIN_PASSWORD = "12345";

// PENTING:
// Isi dengan URL Web App BARU yang menghasilkan:
// {"ok":true,"folder":"wedding","count":0,"photos":{}}
const GALLERY_API_URL = "https://script.google.com/macros/s/AKfycbxK_a2yoYesr9M-EqC42z7WQYCHisJMNqjV_Dd7hA03WICjC-rK3m_ySk9eCe19WGNm/exec";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const loginView = document.querySelector('#loginView');
const dashboardView = document.querySelector('#dashboardView');
const loginForm = document.querySelector('#loginForm');
const loginError = document.querySelector('#loginError');
const logoutBtn = document.querySelector('#logoutBtn');

window.addEventListener('DOMContentLoaded', init);


// =====================================================
// INIT
// =====================================================

function init() {

  if (sessionStorage.getItem('wedding_admin') === '1') {
    showDashboard();
  } else {
    showLogin();
  }

}


// =====================================================
// LOGIN
// =====================================================

loginForm?.addEventListener('submit', (event) => {

  event.preventDefault();

  loginError.textContent = '';

  const password =
    loginForm.querySelector(
      'input[name="password"]'
    ).value;

  if (password !== ADMIN_PASSWORD) {

    loginError.textContent =
      'Password salah. Silakan coba lagi.';

    return;
  }

  sessionStorage.setItem(
    'wedding_admin',
    '1'
  );

  loginForm.reset();

  showDashboard();

});


// =====================================================
// LOGOUT
// =====================================================

logoutBtn?.addEventListener('click', () => {

  sessionStorage.removeItem(
    'wedding_admin'
  );

  showLogin();

});


// =====================================================
// SHOW LOGIN
// =====================================================

function showLogin() {

  if (loginView) {
    loginView.hidden = false;
  }

  if (dashboardView) {
    dashboardView.hidden = true;
  }

}


// =====================================================
// SHOW DASHBOARD
// =====================================================

function showDashboard() {

  if (loginView) {
    loginView.hidden = true;
  }

  if (dashboardView) {
    dashboardView.hidden = false;
  }

  bindCards();

  loadPhotos();

}


// =====================================================
// LOAD PHOTOS
// =====================================================

function loadPhotos() {

  return new Promise((resolve) => {

    const cb =
      '__weddingManage_' +
      Date.now();

    const script =
      document.createElement('script');

    let finished = false;


    function finish(result) {

      if (finished) return;

      finished = true;

      delete window[cb];

      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }

      resolve(result);

    }


    window[cb] = (result) => {

      console.log(
        'Google Drive response:',
        result
      );


      if (
        !result ||
        result.ok !== true
      ) {

        toast(
          'Google Drive API mengembalikan error.'
        );

        finish(result);

        return;
      }


      const photos =
        result.photos || {};


      document
        .querySelectorAll('.manage-card')
        .forEach(card => {

          const slot =
            card.dataset.slot;

          const img =
            card.querySelector('img');

          const placeholder =
            card.querySelector(
              '.manage-placeholder'
            );

          if (!img) return;


          const item =
            photos[slot];


          if (
            item &&
            item.url
          ) {

            img.src =
              item.url +
              '&v=' +
              Date.now();


            img.onload = () => {

              img.classList.add(
                'loaded'
              );

              if (placeholder) {
                placeholder.hidden = true;
              }

            };


            img.onerror = () => {

              console.error(
                'Gagal menampilkan:',
                item.url
              );

              if (placeholder) {
                placeholder.hidden = false;
              }

            };


          } else {

            img.removeAttribute(
              'src'
            );

            img.classList.remove(
              'loaded'
            );

            if (placeholder) {
              placeholder.hidden = false;
            }

          }

        });


      finish(result);

    };


    script.src =
      GALLERY_API_URL +
      '?action=list' +
      '&callback=' +
      cb +
      '&ts=' +
      Date.now();


    script.onerror = () => {

      console.error(
        'Gagal mengakses Google Apps Script:',
        GALLERY_API_URL
      );

      toast(
        'Tidak dapat terhubung ke Google Drive API.'
      );

      finish(null);

    };


    document.head.appendChild(
      script
    );

  });

}


// =====================================================
// BIND UPLOAD / DELETE
// =====================================================

function bindCards() {

  document
    .querySelectorAll('.manage-card')
    .forEach(card => {

      if (card.dataset.bound === '1') {
        return;
      }

      card.dataset.bound = '1';


      const input =
        card.querySelector(
          'input[type="file"]'
        );

      const deleteBtn =
        card.querySelector(
          '.delete-btn'
        );


      if (input) {

        input.addEventListener(
          'change',
          () => {

            const file =
              input.files &&
              input.files[0];

            if (file) {
              uploadSlot(
                card,
                file
              );
            }

          }
        );

      }


      if (deleteBtn) {

        deleteBtn.addEventListener(
          'click',
          () => removeSlot(card)
        );

      }

    });

}


// =====================================================
// FILE TO BASE64
// =====================================================

function fileToBase64(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();


      reader.onload = () => {

        const result =
          String(reader.result);

        const comma =
          result.indexOf(',');


        if (comma === -1) {

          reject(
            new Error(
              'Format file tidak valid.'
            )
          );

          return;
        }


        resolve(
          result.substring(
            comma + 1
          )
        );

      };


      reader.onerror = () => {

        reject(
          new Error(
            'File gagal dibaca.'
          )
        );

      };


      reader.readAsDataURL(file);

    }
  );

}


// =====================================================
// UPLOAD
// =====================================================

async function uploadSlot(
  card,
  file
) {

  const slot =
    card.dataset.slot;


  // Validasi tipe
  if (
    !file.type ||
    !file.type.startsWith('image/')
  ) {

    setStatus(
      card,
      '❌ File harus berupa gambar.'
    );

    return;
  }


  // Validasi ukuran
  if (
    file.size >
    MAX_FILE_SIZE
  ) {

    setStatus(
      card,
      '❌ Maksimal 20 MB per foto.'
    );

    return;
  }


  setStatus(
    card,
    '⏳ Menyiapkan foto...'
  );


  try {

    // Convert
    setStatus(
      card,
      '⏳ Membaca foto...'
    );

    const base64 =
      await fileToBase64(file);


    setStatus(
      card,
      '⏳ Mengupload ke Google Drive...'
    );


    const body =
      new URLSearchParams();


    body.set(
      'action',
      'upload'
    );

    body.set(
      'slot',
      slot
    );

    body.set(
      'filename',
      file.name
    );

    body.set(
      'mimeType',
      file.type
    );

    body.set(
      'file',
      base64
    );


    /*
      no-cors memang tidak bisa membaca
      response dari Apps Script.

      Tetapi request tetap dikirim.
    */

    await fetch(
      GALLERY_API_URL,
      {
        method: 'POST',
        mode: 'no-cors',
        body: body
      }
    );


    setStatus(
      card,
      '⏳ Upload dikirim. Memeriksa Google Drive...'
    );


    /*
      Tunggu Apps Script selesai membuat file.
    */

    setTimeout(
      async () => {

        const result =
          await loadPhotos();


        if (
          result &&
          result.ok === true &&
          result.photos &&
          result.photos[slot]
        ) {

          setStatus(
            card,
            '✅ Upload berhasil!'
          );

          toast(
            `${slot.toUpperCase()} berhasil diupload.`
          );

        } else {

          setStatus(
            card,
            '⚠️ Upload dikirim, tetapi foto belum ditemukan.'
          );

          toast(
            'Foto belum ditemukan di Google Drive.'
          );

        }

      },
      3000
    );


  } catch (error) {

    console.error(
      'Upload error:',
      error
    );


    setStatus(
      card,
      '❌ Upload gagal: ' +
      error.message
    );

  } finally {

    const input =
      card.querySelector(
        'input[type="file"]'
      );

    if (input) {
      input.value = '';
    }

  }

}


// =====================================================
// DELETE
// =====================================================

async function removeSlot(card) {

  const slot =
    card.dataset.slot;


  if (
    !confirm(
      `Hapus foto ${slot}?`
    )
  ) {
    return;
  }


  setStatus(
    card,
    '⏳ Menghapus foto...'
  );


  try {

    const body =
      new URLSearchParams({

        action: 'delete',

        slot: slot

      });


    await fetch(
      GALLERY_API_URL,
      {
        method: 'POST',
        mode: 'no-cors',
        body: body
      }
    );


    setTimeout(
      async () => {

        await loadPhotos();

        setStatus(
          card,
          '✅ Foto dihapus.'
        );

        toast(
          'Foto berhasil dihapus.'
        );

      },
      2000
    );


  } catch (error) {

    console.error(
      'Delete error:',
      error
    );

    setStatus(
      card,
      '❌ Gagal menghapus: ' +
      error.message
    );

  }

}


// =====================================================
// STATUS
// =====================================================

function setStatus(
  card,
  text
) {

  const status =
    card.querySelector(
      '.card-status'
    );


  if (status) {
    status.textContent = text;
  }

}


// =====================================================
// TOAST
// =====================================================

function toast(message) {

  const el =
    document.querySelector(
      '#manageToast'
    );


  if (!el) return;


  el.textContent =
    message;


  el.classList.add(
    'show'
  );


  clearTimeout(
    window.__toast
  );


  window.__toast =
    setTimeout(
      () => {

        el.classList.remove(
          'show'
        );

      },
      3000
    );

}
