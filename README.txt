WEDDING LUXURY — GUEST ONLY
============================

VERSI INI SENGAJA TIDAK MEMILIKI /manage/.
Website ini hanya untuk tamu.

Yang sudah diperbaiki:
- Desain tetap memakai template asli yang kamu kirim.
- Couple photo portrait 2:3 agar mengikuti foto portrait dan tidak ter-crop berlebihan.
- Gallery semua foto portrait 2:3 dengan ukuran konsisten.
- Tidak ada tombol Manage Memories.
- RSVP tamu masuk ke Google Sheets.
- Ucapan tamu muncul di bawah RSVP.
- Saat halaman dibuka, komentar lama dibaca kembali dari Google Sheets.
- Foto gallery tetap bisa diambil dari Google Drive melalui Apps Script.
- Tidak ada upload/delete foto dari website tamu.

GOOGLE SHEETS + GOOGLE APPS SCRIPT
----------------------------------
1. Buat Google Sheet baru.
2. Copy Spreadsheet ID dari URL:
   https://docs.google.com/spreadsheets/d/ID_INI/edit
3. Buat folder Google Drive untuk foto.
4. Copy Folder ID dari URL folder.
5. Buka Extensions -> Apps Script dari Google Sheet.
6. Copy isi google-apps-script/Code.gs ke Apps Script.
7. Isi:
   const DRIVE_FOLDER_ID = 'ID_FOLDER_DRIVE';
   const SPREADSHEET_ID = 'ID_GOOGLE_SHEET';
8. Deploy -> New deployment -> Web app.
   Execute as: Me
   Who has access: Anyone
9. Copy URL /exec.
10. Buka assets/js/script.js dan isi:
   const RSVP_ENDPOINT = "URL_WEB_APP_KAMU";

SHEET RSVP
----------
Kode akan otomatis membuat sheet bernama RSVP dengan kolom:
Timestamp | Nama | Kehadiran | Jumlah Tamu | Ucapan

CATATAN
-------
Google Sheets langsung lebih cocok untuk form custom seperti desain ini.
Kalau mau memakai Google Form, respons Google Form juga bisa diarahkan ke
Google Sheets, tetapi form custom di website tidak otomatis menjadi Google Form
tanpa mekanisme tambahan.

GALLERY GOOGLE DRIVE
--------------------
Agar foto tampil dari Drive, gunakan nama file seperti:
__photo01__foto-1.jpg
__photo02__foto-2.jpg
__photo03__foto-3.jpg
__photo04__foto-4.jpg
__photo05__foto-5.jpg
__photo06__foto-6.jpg

Foto harus dapat dilihat dengan link agar tamu bisa melihatnya.

HD / PORTRAIT
-------------
CSS tidak menaikkan resolusi foto. Untuk hasil HD:
- upload foto original beresolusi tinggi ke Google Drive;
- jangan gunakan thumbnail kecil;
- foto portrait idealnya 2:3;
- website menampilkan dengan object-fit: cover dan hanya sedikit scaling saat hover.
Jika foto sumber sudah blur/terkompres, CSS tidak dapat mengembalikan detail yang hilang.

FILE YANG DIUPLOAD KE HOSTING
-----------------------------
Upload:
index.html
_redirects
assets/
google-apps-script/ (tidak wajib di-host, hanya untuk setup)
README.txt

Folder functions dan manage sudah dihapus dari paket ini.


GOOGLE FORM RSVP - CUSTOM WEBSITE FORM
======================================
Versi ini TIDAK memakai Google Apps Script.

Google Form:
https://docs.google.com/forms/d/e/1FAIpQLSewrQIrtwg6Lvj3WRjoi0RL0x5rkvQmG5iFZiww0z3lSnv_aQ/viewform

Field mapping:
- Nama      = entry.290774784
- Kehadiran = entry.1318967976
- Jumlah    = entry.2054287845
- Ucapan    = entry.692446568

Cara kerja:
1. Tamu mengisi form RSVP yang tetap berada di website.
2. Saat SEND MY WISH ditekan, data dikirim langsung ke Google Forms /formResponse.
3. Google Forms menyimpan respons ke spreadsheet yang terhubung.
4. Tamu tidak diarahkan ke halaman Google Forms karena pengiriman memakai hidden iframe.

CATATAN:
Tanpa Apps Script/backend, website tidak dapat membaca kembali isi Google Sheets
untuk menampilkan ucapan lama kepada semua tamu. Ucapan baru ditampilkan langsung
di halaman setelah dikirim. Jika ingin ucapan lama tetap tampil setelah halaman
dibuka ulang oleh tamu lain, diperlukan backend seperti Apps Script atau API lain.


FINAL GOOGLE FORM SUBMISSION
============================
The custom RSVP form submits directly to Google Forms using the /formResponse
endpoint in a hidden iframe. No Apps Script is required.

Google Form action:
https://docs.google.com/forms/d/e/1FAIpQLSewrQIrtwg6Lvj3WRjoi0RL0x5rkvQmG5iFZiww0z3lSnv_aQ/formResponse

Entry IDs:
Nama       = entry.290774784
Kehadiran  = entry.1318967976
Jumlah     = entry.2054287845
Ucapan     = entry.692446568

The Google Form choice values are sent as:
Hadir / Tidak Hadir
1 / 2 / 3 / 4

Test after deployment:
1. Open the wedding site.
2. Submit one RSVP with a unique name, e.g. TEST WEBSITE 02.
3. Open Google Form > Jawaban.
4. The response count should increase and the submitted values should appear.

The website displays the wish immediately for the current visitor. It does not
read historical responses back from Google Sheets because this version does
not use Apps Script/backend.
