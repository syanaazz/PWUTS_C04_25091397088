<?php
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['success' => false, 'message' => 'Metode request tidak didukung.'], 405);
}

try {
    $connection = db_connect();
    $sql = "SELECT p.id_penghuni, p.nama_penghuni, p.nomor_hp,
                   k.nomor_kamar, ko.nama_kost
            FROM penghuni p
            LEFT JOIN kamar k ON k.id_kamar = p.id_kamar
            LEFT JOIN kost ko ON ko.id_kost = k.id_kost
            WHERE p.status_penghuni = 'aktif'
            ORDER BY p.nama_penghuni";
    $result = $connection->query($sql);
    $residents = [];

    while ($resident = $result->fetch_assoc()) {
        $residents[] = $resident;
    }

    json_response(['success' => true, 'data' => $residents]);
} catch (Throwable $error) {
    error_log('API penghuni aktif: ' . $error->getMessage());
    json_response(['success' => false, 'message' => 'Daftar penghuni belum dapat dimuat. Periksa koneksi database.'], 500);
}
