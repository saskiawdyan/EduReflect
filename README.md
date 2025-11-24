# ✨ EduReflect — Aplikasi Refleksi Belajar & Gaya Belajar VAK

**EduReflect** adalah aplikasi web full-stack untuk membantu pelajar melakukan refleksi harian, mengetahui gaya belajar (Visual, Auditori, Kinestetik), serta melacak progres dan kebiasaan belajar mereka dengan tampilan modern bertema **Blue Neon**.

Aplikasi ini dibangun dengan:

* **Backend:** PHP Native (OOP, Router custom, sesi login)
* **Frontend:** HTML, CSS, JavaScript (Vanilla JS)
* **Database:** MySQL
* **Analitik:** Chart.js
* **Game:** Tetris berbasis HTML Canvas

---

## 🚀 Fitur Utama

### 🔐 Otentikasi

* Registrasi & Login
* Logout
* Session-based authentication menggunakan PHP `$_SESSION`

### 👤 Profil Pengguna

* Edit profil (nama, bio)
* Upload avatar
* Lencana (badges) tampil di profil

### 🧠 Tes Gaya Belajar VAK

* 12 pertanyaan dinamis dari database
* Menentukan gaya belajar dominan (V/A/K)
* Rekomendasi jadwal belajar + integrasi Google Calendar

### 📊 Dashboard Dinamis

* Menampilkan nama, gaya belajar, streak refleksi, dan high score Tetris
* Data real-time terhubung API

### ✍️ Refleksi Harian (CRUD)

* Tambah refleksi
* Edit refleksi
* Hapus refleksi
* Mood tracking (high, mid, low)
* AI Feedback otomatis (ReflectAI)

### 🤖 Feedback

Setiap refleksi otomatis diberi:

* Apresiasi
* Rekomendasi efektif
* Pertanyaan reflektif lanjutan

### 🎮 Game Tetris

* Game Tetris Canvas
* High score tersimpan otomatis

### 🏆 Gamifikasi (Badges)

Badge otomatis:

* Refleksi pertama
* Streak 3 hari
* Skor Tetris > 1000

### 📈 Halaman Analitik (Chart.js)

3 grafik utama:

* Mood distribusi (Doughnut)
* Refleksi 7 hari terakhir (Bar)
* Skor V/A/K (Doughnut)

### 💡 UI/UX Modern

* Tema Blue Neon
* Light/Dark mode tersimpan di localStorage
* Responsif mobile

---

## 🛠️ Tech Stack

* **Backend:** PHP Native, PDO MySQL
* **Frontend:** HTML, CSS, JS (Vanilla), Chart.js
* **Database:** MySQL
* **Development:** Laragon

---

## 📂 Struktur Folder

```
EduReflect/
│
├── api/
│   ├── controllers/
│   ├── models/
│   ├── services/
│   └── config/
│
├── db/
├── middleware/
├── utils/
│
├── public/
│   ├── css/
│   ├── js/
│   ├── assets/
│   ├── uploads/
│   ├── index.php
│   ├── dashboard.html
│   ├── login.html
│   ├── register.html
│   ├── profile.html
│   ├── reflection.html
│   ├── reflection-edit.html
│   ├── report.html
│   ├── analytics.html
│   ├── learnstyle.html
│   ├── learnstyle-result.html
│   └── game.html
│
└── README.md
```

---

## 💾 Instalasi (Laragon)

### 1️⃣ Clone ke folder Laragon

```
C:/laragon/www/EduReflect/
```

### 2️⃣ Jalankan Laragon

Klik **Start All**.

### 3️⃣ Buat Database

```
edureflect
```

### 4️⃣ Import SQL

Copy seluruh schema SQL ke phpMyAdmin lalu jalankan.

*(Schema lengkap tersedia di file SQL proyek Anda.)*

### 5️⃣ Atur Virtual Host

Ubah DocumentRoot menjadi:

```
C:/laragon/www/EduReflect/public
```

Restart Apache.

### 6️⃣ Pastikan Ekstensi PHP Aktif

* curl
* fileinfo

### 7️⃣ Selesai

Akses:

```
http://edureflect.test/
```

---

## 📡 Endpoint API (Ringkas)

### 🔐 Auth

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/profile
PUT    /api/auth/gamescore
```

### 🧠 Quiz

```
GET    /api/quiz/questions
POST   /api/quiz/submit
GET    /api/quiz/result/last
```

### ✍️ Reflections

```
GET    /api/reflections
POST   /api/reflections
GET    /api/reflections/{id}
PUT    /api/reflections/{id}
DELETE /api/reflections/{id}
```

### 📊 Analytics & Gamification

```
GET    /api/analytics/summary
GET    /api/game/leaderboard
GET    /api/badges/my
GET    /api/progress/summary
```

---

## 🚀 Alur Penggunaan (User Journey)

Berikut adalah panduan langkah demi langkah tentang cara menggunakan aplikasi EduReflect dari awal hingga akhir.

### 1. Pendaftaran Akun Baru
* **Halaman:** `register.html`
* **Alur:** Pengguna baru mendaftarkan akun dengan memasukkan **Nama Lengkap**, **Email** (unik), dan **Password** (minimal 8 karakter).
* **Hasil:** Setelah berhasil, sistem akan secara otomatis mengarahkan pengguna ke halaman Tes Gaya Belajar.

### 2. Tes Gaya Belajar (Kuis VAK)
* **Halaman:** `learnstyle.html`
* **Alur:** Ini adalah langkah wajib satu kali untuk pengguna baru. Pengguna akan menjawab **12 pertanyaan dinamis** yang diambil dari *database* untuk menentukan gaya belajar dominan mereka (Visual, Auditori, atau Kinestetik).
* **Desain:** Tampilan kuis dibuat *step-by-step* (satu pertanyaan per halaman) untuk fokus maksimal.

### 3. Hasil Kuis & Rekomendasi Jadwal
* **Halaman:** `learnstyle-result.html`
* **Alur:** Setelah kuis selesai, pengguna langsung melihat halaman hasil yang menampilkan:
    1.  **Gaya Belajar Dominan** mereka (misal: "Visual").
    2.  **Skor Rinci** dalam bentuk *progress bar* visual.
    3.  **Rekomendasi Jadwal Belajar** (2 minggu) yang disesuaikan:
        * **Minggu 1:** Aktivitas untuk gaya belajar dominan (misal: "Buat Mind Map").
        * **Minggu 2:** Aktivitas untuk gaya belajar alternatif (misal: "Dengarkan Podcast").
* **Fitur Kunci:** Setiap rekomendasi jadwal memiliki tombol **"+ Tambah ke Google Calendar"** yang otomatis membuka Google Calendar dengan detail acara yang sudah terisi.

### 4. Dashboard (Halaman Utama)
* **Halaman:** `dashboard.html`
* **Alur:** Ini adalah pusat kendali utama pengguna setelah login. Halaman ini secara dinamis mengambil dan menampilkan:
    * **Nama Pengguna** (Halo, Alwi!)
    * **Gaya Belajar** (cth: "Kinestetik")
    * **Total Refleksi** (cth: "1")
    * **Streak Harian** (cth: "1 Hari")
    * **High Score Game** (cth: "500")
* **Tampilan:** Menggunakan tema "Blue Neon Modern" dan mendukung *light/dark mode*.

### 5. Fitur Inti (Aksi Harian)

Dari *dashboard*, pengguna dapat melakukan dua aksi utama:

* **A. Menulis Refleksi:**
    * **Halaman:** `reflection.html`
    * **Alur:** Pengguna mengisi formulir refleksi (Judul, Isi, Mood).
    * **Feedback:** Setelah disimpan, *backend* akan memberikan **"Saran Sistem"** otomatis berdasarkan *mood* yang dipilih (misal: "Kerja bagus! Perasaan 'low' itu wajar...").
    * **Otomatisasi:** Menyimpan refleksi juga akan otomatis **memperbarui streak harian** Anda dan **memberikan lencana** "Reflektor Pemula" jika ini adalah yang pertama.

* **B. Bermain Game:**
    * **Halaman:** `game.html`
    * **Alur:** Pengguna bermain game Tetris klasik dengan kontrol keyboard (WASD/Panah).
    * **Feedback:** Saat *Game Over*, skor akhir (cth: 500) akan otomatis dikirim ke *database* **jika** itu adalah *high score* baru.
    * **Leaderboard:** Halaman ini juga menampilkan **10 skor tertinggi** dari semua pengguna di aplikasi.

### 6. Memantau Progres

* **A. Halaman Laporan (CRUD):**
    * **Halaman:** `report.html`
    * **Alur:** Menampilkan ringkasan profil (Nama, Email, VAK, Streak) dan **daftar lengkap semua refleksi** yang pernah ditulis.
    * **Fitur:** Pengguna dapat **Mencetak** laporan, **Menghapus (Delete)** refleksi, atau mengklik **Edit (Update)**.
    * **Edit:** Membawa pengguna ke `reflection-edit.html`, di mana formulir akan terisi otomatis dengan data lama yang siap diperbarui.

* **B. Halaman Analitik:**
    * **Halaman:** `analytics.html`
    * **Alur:** Menampilkan 3 grafik dinamis (via Chart.js) berdasarkan data historis pengguna:
        1.  **Distribusi Mood** (Doughnut chart)
        2.  **Aktivitas Refleksi 7 Hari Terakhir** (Bar chart)
        3.  **Distribusi Skor Kuis VAK** (Doughnut chart)

### 7. Mengelola Akun

* **Halaman:** `profile.html`
* **Alur:** Halaman ini otomatis terisi dengan data pengguna saat ini.
* **Fitur:**
    * **Update Profil:** Pengguna dapat mengubah **Nama Lengkap** dan **Bio**.
    * **Upload Avatar:** Pengguna dapat mengklik foto profil *default* untuk mengunggah foto baru. Foto akan ditampilkan dalam *preview* dan disimpan ke *server* saat diklik "Simpan".
    * **Koleksi Lencana:** Menampilkan *grid* dari semua lencana yang telah diperoleh (misal: "Master Tetris", "Reflektor Pemula").

---

## ❤️ Terima Kasih

Dibuat dengan semangat belajar & teknologi oleh **EduReflect Project**.

Cocok untuk siswa, mahasiswa, dan siapa pun yang ingin meningkatkan kebiasaan belajar secara positif.
