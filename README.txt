WEDDING LUXURY — CLOUDFLARE PAGES + GOOGLE DRIVE / APPS SCRIPT
===============================================================

1. `/` = undangan publik, tanpa login.
2. `/manage/` = halaman privat untuk upload/hapus foto.
3. `/api/photos` = daftar foto publik.
4. `/api/upload` = upload/hapus foto, wajib session admin.
5. Google Apps Script menyimpan foto ke Google Drive.
6. Tidak menggunakan Cloudflare R2.
7. Tidak menggunakan wrangler.json/wrangler.toml.

Cloudflare Pages:
- GitHub integration
- Framework: None
- Build command: `exit 0`
- Build output directory: `.`

Environment Variables / Secrets:
- ADMIN_USER
- ADMIN_PASSWORD
- SESSION_SECRET
- GOOGLE_SCRIPT_URL
- GOOGLE_SCRIPT_TOKEN

Lihat `google-apps-script/SETUP.md` untuk setup Google Drive + Apps Script.

Upload: JPG/PNG/WEBP, maksimum 8 MB. Setiap slot menyimpan satu foto; upload baru mengganti foto lama.

RSVP tetap dapat menggunakan Google Apps Script terpisah seperti konfigurasi di assets/js/script.js.
