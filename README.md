# Booklist: Web Aplikasi Manajemen Buku

Booklist adalah aplikasi web untuk mengelola daftar buku, penulis, dan kategori. Aplikasi ini memungkinkan pengguna untuk melihat, menambah, memperbarui, dan menghapus data dengan antarmuka yang intuitif dan reaktif.

## ✨ Fitur-Fitur Utama

  - **Manajemen Buku:** Tambah, perbarui, dan hapus data buku dengan detail lengkap seperti judul, deskripsi, penulis, penerbit, dan tanggal publikasi.
  - **Manajemen Kategori:** Kelola daftar kategori buku dengan mudah.
  - **Manajemen Penulis:** Kelola daftar penulis buku.
  - **Daftar Buku Interaktif:** Lihat daftar buku dalam tabel yang dapat disaring dan diurutkan.
  - **Filter Canggih:** Saring daftar buku berdasarkan kategori, teks (judul, penulis, penerbit), dan rentang tanggal publikasi.
  - **Otentikasi Pengguna:** Sistem *login* sederhana untuk mengamankan akses ke fitur-fitur manajemen.

-----

## 🖼️ Preview

### Halaman Login

Halaman utama untuk masuk ke dalam sistem.
![Login Page](./screenshots/login.png)

-----

### Daftar Buku

Tampilan utama yang menampilkan semua buku.
![Book List Page](./screenshots/books.png)

-----

### Filter Buku

Tampilan saat filter diterapkan.
![Book List Page](./screenshots/books-filter.png)

-----

### Tambah Buku Baru

Form untuk menambah buku ke dalam daftar.
![Book Add](./screenshots/books-add.png)

-----

### Perbarui Buku

![Book Update](./screenshots/books-update.png)

-----

### Daftar Kategori

Halaman untuk mengelola kategori buku.
![Categories List](./screenshots/categories.png)

-----

### Daftar Penulis

Halaman untuk mengelola penulis buku.
![Authors List](./screenshots/authors.png)

-----

## 🚀 Teknologi yang Digunakan

Aplikasi ini dibangun dengan teknologi modern untuk memastikan performa yang cepat dan pengalaman pengembangan yang baik.

- [SvelteKit](https://kit.svelte.dev/): Framework web untuk membuat UI.
- [TypeScript](https://www.typescriptlang.org/): Bahasa pemrograman yang menambahkan statictype ke JavaScript.
- [Tailwind CSS](https://tailwindcss.com/): Framework CSS untuk styling.
- [Shadcn Svelte](https://www.shadcn-svelte.com/): Kumpulan UI komponen.

## 📦 Panduan Instalasi

Ikuti langkah-langkah di bawah ini untuk menginstal dan menjalankan proyek di lingkungan lokal Anda.

### Prasyarat

Pastikan Anda sudah menginstal:

  - [Node.js](https://nodejs.org/) atau [Bun](https://bun.com/)
  - [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), atau [bun](https://bun.com/)
  - Akses ke API backend yang sudah berjalan (asumsi Anda memiliki backend Go di `localhost:8000`).

### Langkah-langkah

1.  **Clone Repositori:**

    ```bash
    git clone https://github.com/ziruiproject/books-frontend.git
    cd books-frontend
    ```

2.  **Instal Dependensi Frontend:**

    ```bash
    # Menggunakan npm
    npm install

    # Atau menggunakan pnpm
    pnpm install

    # Atau menggunakan bun
    bun install
    ```

3.  **Jalankan Aplikasi:**
    Jalankan server pengembangan SvelteKit.

    ```bash
    # Menggunakan npm
    npm run dev

    # Menggunakan bun
    bun run dev
    ```

    Aplikasi akan tersedia di `http://localhost:5173`.

-----

## 📝 Penggunaan Aplikasi

-   **Login:** Buka aplikasi di browser, masukkan kredensial berikut, dan klik tombol `Login`.
    -   **Email:** `sa@test.com`
    -   **Password:** `rahasia123`
-   **Melihat Daftar:** Navigasi ke halaman **Books** untuk melihat daftar buku, atau halaman **Categories** untuk melihat daftar kategori.
-   **Filter:** Gunakan kolom pencarian dan *dropdown* di halaman **Books** untuk memfilter daftar berdasarkan judul, penulis, penerbit, atau kategori.
-   **Tambah/Edit:** Gunakan tombol `Add Book` atau tombol pensil di samping setiap buku untuk menambah atau memperbarui data.