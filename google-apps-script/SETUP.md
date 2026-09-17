# Google Drive + Google Apps Script

Backend foto untuk Wedding Memories. Tidak memakai Cloudflare R2.

## 1. Google Drive
Buat folder, misalnya `Wedding Memories`. Salin ID folder dari URL Google Drive.

## 2. Apps Script
Buat project baru di Google Apps Script dan salin isi `Code.gs` ke project tersebut.

Di Project Settings → Script properties buat:
- `DRIVE_FOLDER_ID` = ID folder Google Drive
- `API_TOKEN` = token acak panjang (buat sendiri)

## 3. Deploy Web App
Deploy → New deployment → Web app:
- Execute as: Me
- Who has access: Anyone

Salin URL yang berakhir `/exec`.

## 4. Cloudflare Pages
Project Pages → Settings → Environment variables/secrets:
- `GOOGLE_SCRIPT_URL` = URL Web App `/exec`
- `GOOGLE_SCRIPT_TOKEN` = nilai API_TOKEN yang sama
- `ADMIN_USER` = username admin
- `ADMIN_PASSWORD` = password admin
- `SESSION_SECRET` = random secret panjang

Tidak perlu R2 dan tidak perlu wrangler.json.

## 5. Cara kerja
`/` publik tanpa login → `/manage/` login admin → Pages Function → Apps Script → Google Drive.

Setiap slot (`groom`, `bride`, `photo01` sampai `photo06`) menyimpan satu foto. Upload baru menggantikan foto lama pada slot yang sama.

Foto dibuat `Anyone with the link / Viewer` supaya gallery publik dapat menampilkannya.
