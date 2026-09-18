WEDDING LUXURY — GOOGLE DRIVE VERSION

Admin login:
Password: 12345

Tidak memakai Cloudflare R2, GitHub Token, atau Cloudflare Environment Variables.

SETUP GOOGLE DRIVE:
1. Buat folder Google Drive untuk foto.
2. Copy Folder ID dari URL folder.
3. Buka google-apps-script/Code.gs.
4. Ganti GANTI_DENGAN_ID_FOLDER_DRIVE dengan Folder ID.
5. Deploy Apps Script sebagai Web App: Execute as Me, Who has access Anyone.
6. URL Apps Script sudah ditanam di assets/js/manage.js dan assets/js/public-gallery.js.

TEST LOKAL:
Jalankan folder wedding-luxury dengan VS Code Live Server.
Buka /manage/
Password: 12345

Catatan: upload dikirim ke Google Apps Script menggunakan POST no-cors, lalu halaman memuat ulang daftar foto. Google Drive harus mengizinkan file dengan link untuk dilihat agar foto bisa tampil di tamu.
