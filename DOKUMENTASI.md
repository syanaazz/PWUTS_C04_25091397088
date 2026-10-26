# Website Kelola Kost

Proyek ini dibuat untuk memenuhi tugas UTS mata kuliah Pemrograman Web.
Website Kelola Kost membantu pengguna melihat informasi kamar dan
mengajukan berhenti ngekos. Website dibuat menggunakan HTML, CSS,
JavaScript/jQuery, AJAX, PHP, dan MySQL, lalu dijalankan secara lokal
melalui XAMPP.

## Fitur Website

### 1. Homepage (Nomor 2a)

Homepage menjadi halaman awal website. Di dalamnya terdapat navigasi ke
menu Home, Kamar, dan Berhenti. Tata letak utama tetap ditampilkan
ketika pengguna berpindah menu.

### 2. Informasi Kamar (Nomor 2b)

Halaman Kamar menampilkan daftar kamar berdasarkan data yang tersimpan
di database. Pengguna dapat melihat informasi seperti nomor kamar, nama
kost, harga sewa, dan status kamar. Kartu kamar dapat diklik untuk
membuka pop-up berisi informasi lebih lengkap, termasuk fasilitas dan
alamat kost.

Foto kamar disimpan sebagai file gambar di folder `assets/img/`. Nama
file harus sesuai dengan yang dipanggil oleh kode, misalnya
`kamar-101.jpg` atau `kamar-102.jpg`. Jika gambar yang sesuai tidak
ditemukan, website dapat menampilkan gambar placeholder.

### 3. Pengajuan Berhenti Ngekost (Nomor 2c)

Halaman Berhenti berisi formulir pengajuan berhenti ngekost. Pengguna
memilih nama penghuni, mengisi tanggal keluar, lalu menuliskan alasan
pengajuan. Formulir diperiksa terlebih dahulu di browser, kemudian
dikirim ke PHP menggunakan AJAX. PHP memeriksa kembali data dan
menyimpan pengajuan ke tabel `pengajuan_keluar` jika datanya valid.

Untuk kebutuhan demonstrasi UTS, nama penghuni dipilih melalui dropdown
karena fitur login belum dibuat. Pilihan ini hanya digunakan untuk
pengujian lokal, bukan sebagai sistem autentikasi untuk aplikasi yang
digunakan secara nyata.

## Teknologi yang Digunakan

-   **HTML** untuk menyusun isi halaman.
-   **CSS** untuk mengatur tampilan dan tata letak website.
-   **JavaScript/jQuery** untuk interaksi di halaman.
-   **AJAX** untuk memuat konten dan mengirim data tanpa memuat ulang
    seluruh halaman.
-   **PHP** untuk menghubungkan website dengan database dan memproses
    pengajuan.
-   **MySQL** untuk menyimpan data.
-   **XAMPP** untuk menjalankan Apache dan MySQL di komputer.

## Struktur Folder

``` text
KelolaKost_UTS/
├── index.html
├── pages/
│   ├── home.html
│   ├── kamar.html
│   └── berhenti.html
├── assets/
│   ├── app.js
│   ├── style.css
│   ├── jquery.min.js
│   └── img/
│       ├── room-placeholder.svg
│       ├── kamar-101.jpg
│       ├── kamar-102.jpg
│       ├── kamar-103.jpg
│       ├── kamar-104.jpg
│       └── kamar-201.jpg
├── api/
│   ├── kamar.php
│   ├── penghuni-aktif.php
│   └── pengajuan-keluar.php
├── config/
│   └── database.php
├── database/
│   └── db_kelola_kost.sql
└── README.md
```

Daftar foto di atas menunjukkan contoh nama file yang bisa digunakan.
Masukkan hanya foto yang memang tersedia. Jika nama file atau ekstensi
di komputer berbeda, sesuaikan dengan nama yang dipakai oleh kode
website.

## Cara Memasang dan Menjalankan Website

### Langkah 1 --- Siapkan aplikasi
Pastikan XAMPP dan editor kode seperti Visual Studio Code sudah
terpasang di komputer.

### Langkah 2 --- Masukkan folder proyek ke XAMPP
1.  Ekstrak folder proyek jika masih berbentuk ZIP.

2.  Salin folder `KelolaKost_UTS` ke lokasi berikut:

    ``` text
    C:\xampp\htdocs\
    ```

3.  Periksa agar file `index.html` berada langsung di dalam folder
    proyek, bukan di folder proyek lain yang bersarang.

    Contoh lokasi yang benar:

    ``` text
    C:\xampp\htdocs\KelolaKost_UTS\index.html
    ```

### Langkah 3 --- Jalankan Apache dan MySQL
1.  Buka XAMPP Control Panel.
2.  Klik Start pada Apache.
3.  Klik Start pada MySQL.
4.  Pastikan keduanya aktif sebelum membuka website.

### Langkah 4 --- Periksa database

1.  Buka browser dan masuk ke `http://localhost/phpmyadmin`.
2.  Cari database `db_kelola_kost`.
3.  Pastikan database tersebut memiliki tabel yang diperlukan, seperti
    `kamar`, `kost`, `penghuni`, dan `pengajuan_keluar`.

Jika database sudah ada dan berisi data, jangan mengimpor file SQL lagi
ke database yang sama. Jika database belum tersedia, pilih menu
**Import** di phpMyAdmin dan impor file `database/db_kelola_kost.sql`
satu kali.

File SQL sebaiknya berisi struktur tabel dan data contoh yang diperlukan
untuk menjalankan website. Jangan masukkan data pribadi atau kata sandi
asli ke dalam file yang akan diunggah ke repository publik.

### Langkah 5 --- Periksa koneksi database
1.  Buka proyek di Visual Studio Code.

2.  Buka file `config/database.php`.

3.  Periksa pengaturan koneksi berikut:

    ``` php
    define('DB_HOST', 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_NAME', 'db_kelola_kost');
    ```

Pengaturan tersebut digunakan pada instalasi XAMPP standar yang memakai
username `root` tanpa password. Jika pengaturan MySQL di komputer
berbeda, sesuaikan nilainya. Jangan memasukkan password pribadi ke
repository publik.

### Langkah 6 --- Buka website
Setelah Apache dan MySQL aktif, buka alamat berikut di browser:

``` text
http://localhost/KelolaKost_UTS/
```

## Cara Menguji Fitur

### Menguji Homepage dan Navigasi
1.  Buka website melalui `http://localhost/KelolaKost_UTS/`.
2.  Klik menu Home, Kamar, dan Berhenti secara bergantian.
3.  Pastikan konten berpindah tanpa memuat ulang seluruh kerangka
    halaman.

Navigasi ini menggunakan jQuery AJAX. File `assets/app.js` memuat
halaman yang dipilih dari folder `pages/` dan menampilkannya pada area
konten utama.

### Menguji Informasi Kamar
1.  Klik menu Kamar.
2.  Pastikan daftar kamar muncul.
3.  Periksa nomor kamar, nama kost, harga, dan status yang ditampilkan.
4.  Klik salah satu kartu kamar.
5.  Periksa informasi tambahan yang muncul di pop-up.

Jika daftar kamar tidak muncul, coba buka alamat berikut untuk melihat
respons API:

``` text
http://localhost/KelolaKost_UTS/api/kamar.php
```

### Menguji Foto Kamar

Pastikan foto disimpan di folder `assets/img/` dan nama file sama persis
dengan nama yang digunakan di kode. Contoh alamat untuk menguji foto
kamar 101:

``` text
http://localhost/KelolaKost_UTS/assets/img/kamar-101.jpg
```

Jika gambar tidak terbuka, periksa kembali nama file, ekstensi, dan
lokasi penyimpanannya. Jangan hanya mengganti ekstensi file jika format
gambar aslinya berbeda.

### Menguji Form Pengajuan Berhenti
1.  Klik menu Berhenti.
2.  Tunggu sampai daftar penghuni aktif muncul.
3.  Pilih penghuni yang belum memiliki pengajuan berstatus `menunggu`.
4.  Pilih tanggal keluar hari ini atau tanggal setelahnya.
5.  Isi alasan berhenti sekurang-kurangnya 5 karakter.
6.  Klik tombol Kirim Pengajuan.
7.  Jika pengajuan berhasil disimpan, website akan menampilkan pop-up
    pemberitahuan.
8.  Buka phpMyAdmin, pilih database `db_kelola_kost`, buka tabel
    `pengajuan_keluar`, lalu pilih **Browse**.
9.  Pastikan data pengajuan yang baru dikirim sudah tercatat.

Penghuni yang sudah memiliki pengajuan berstatus `menunggu` tidak dapat
mengirim pengajuan baru sampai pengajuan sebelumnya ditangani. Jika
pengajuan ditolak karena masih ada pengajuan yang menunggu, pilih
penghuni aktif lain yang belum memiliki pengajuan tersebut.

## Catatan Database dan Formulir
-   Informasi kamar diambil dari tabel `kamar` yang terhubung dengan
    tabel `kost`.
-   Pengajuan berhenti disimpan ke tabel `pengajuan_keluar`.
-   Database yang digunakan tidak menyediakan kolom khusus untuk
    menyimpan foto kamar. Oleh karena itu, foto dikelola sebagai file di
    folder `assets/img/`.
-   Formulir memeriksa nama penghuni, tanggal keluar, dan alasan
    pengajuan. Tanggal keluar tidak boleh sebelum hari ini, sedangkan
    alasan harus diisi minimal 5 karakter.
-   Data juga diperiksa kembali oleh PHP sebelum disimpan. Pemeriksaan
    di server tetap diperlukan meskipun formulir sudah divalidasi di
    browser.
-   Untuk aplikasi yang digunakan secara nyata, identitas penghuni
    seharusnya diambil dari sesi login yang sudah diverifikasi. Dropdown
    nama penghuni pada proyek ini hanya untuk kebutuhan demo UTS.

## Mengenali File Penting
  -----------------------------------------------------------------------
  File atau folder                    Kegunaan
  ----------------------------------- -----------------------------------
  `index.html`                        Kerangka utama website dan
                                      navigasi.

  `pages/home.html`                   Isi halaman Home.

  `pages/kamar.html`                  Struktur halaman informasi kamar.

  `pages/berhenti.html`               Formulir pengajuan berhenti
                                      ngekost.

  `assets/style.css`                  Mengatur warna, tata letak, kartu,
                                      pop-up, formulir, dan tampilan
                                      responsif.

  `assets/app.js`                     Mengatur navigasi AJAX, data kamar,
                                      pop-up, validasi, dan pengiriman
                                      formulir.

  `assets/img/`                       Menyimpan foto kamar dan gambar
                                      placeholder.

  `api/kamar.php`                     Mengambil data daftar dan detail
                                      kamar.

  `api/penghuni-aktif.php`            Mengambil data penghuni aktif untuk
                                      pilihan pada formulir.

  `api/pengajuan-keluar.php`          Memeriksa dan menyimpan pengajuan
                                      berhenti.

  `config/database.php`               Mengatur koneksi ke MySQL.

  `database/db_kelola_kost.sql`       File ekspor database untuk
                                      instalasi di komputer lain.
  -----------------------------------------------------------------------

## Penutup
Website ini mengerjakan tiga bagian utama UTS: homepage, informasi
kamar, dan pengajuan berhenti ngekost. Pengujian dilakukan melalui
browser dan phpMyAdmin untuk memastikan tampilan berjalan, data kamar
terbaca, serta pengajuan yang valid tersimpan di database.
