<?php
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'message' => 'Gunakan metode POST untuk mengirim pengajuan.'], 405);
}

$idPenghuni = filter_var($_POST['id_penghuni'] ?? null, FILTER_VALIDATE_INT);
$tanggalKeluar = trim((string) ($_POST['tanggal_keluar'] ?? ''));
$alasanKeluar = trim((string) ($_POST['alasan_keluar'] ?? ''));

if (!$idPenghuni || $idPenghuni < 1) {
    json_response(['success' => false, 'message' => 'Pilih nama penghuni terlebih dahulu.'], 422);
}

$dateObject = DateTimeImmutable::createFromFormat('!Y-m-d', $tanggalKeluar);
$dateErrors = DateTimeImmutable::getLastErrors();
$dateIsValid = $dateObject instanceof DateTimeImmutable
    && ($dateErrors === false || ($dateErrors['warning_count'] === 0 && $dateErrors['error_count'] === 0))
    && $dateObject->format('Y-m-d') === $tanggalKeluar;

if (!$dateIsValid) {
    json_response(['success' => false, 'message' => 'Tanggal keluar tidak valid.'], 422);
}

$today = new DateTimeImmutable('today');
if ($dateObject < $today) {
    json_response(['success' => false, 'message' => 'Tanggal keluar tidak boleh sebelum hari ini.'], 422);
}

if (mb_strlen($alasanKeluar) < 5) {
    json_response(['success' => false, 'message' => 'Alasan keluar minimal 5 karakter.'], 422);
}

if (mb_strlen($alasanKeluar) > 5000) {
    json_response(['success' => false, 'message' => 'Alasan keluar terlalu panjang.'], 422);
}

try {
    $connection = db_connect();

    // Mode demo: form menyediakan pilihan penghuni karena halaman login belum dibuat.
    // Pada implementasi dengan login, id_penghuni sebaiknya diambil dari session pengguna.
    $residentStatement = $connection->prepare("SELECT id_penghuni FROM penghuni WHERE id_penghuni = ? AND status_penghuni = 'aktif' LIMIT 1");
    $residentStatement->bind_param('i', $idPenghuni);
    $residentStatement->execute();
    $resident = $residentStatement->get_result()->fetch_assoc();
    $residentStatement->close();

    if (!$resident) {
        json_response(['success' => false, 'message' => 'Penghuni tidak ditemukan atau statusnya tidak aktif.'], 422);
    }

    // Hindari dua pengajuan berstatus menunggu dari penghuni yang sama.
    $pendingStatement = $connection->prepare("SELECT id_pengajuan FROM pengajuan_keluar WHERE id_penghuni = ? AND status_pengajuan = 'menunggu' LIMIT 1");
    $pendingStatement->bind_param('i', $idPenghuni);
    $pendingStatement->execute();
    $pending = $pendingStatement->get_result()->fetch_assoc();
    $pendingStatement->close();

    if ($pending) {
        json_response(['success' => false, 'message' => 'Penghuni ini masih memiliki pengajuan yang menunggu konfirmasi owner.'], 409);
    }

    $tanggalPengajuan = (new DateTimeImmutable('today'))->format('Y-m-d');
    $insertStatement = $connection->prepare("INSERT INTO pengajuan_keluar (id_penghuni, tanggal_pengajuan, tanggal_keluar, alasan_keluar, status_pengajuan) VALUES (?, ?, ?, ?, 'menunggu')");
    $insertStatement->bind_param('isss', $idPenghuni, $tanggalPengajuan, $tanggalKeluar, $alasanKeluar);
    $insertStatement->execute();
    $newId = $insertStatement->insert_id;
    $insertStatement->close();

    json_response([
        'success' => true,
        'message' => 'Pengajuan berhenti ngekos berhasil disimpan. Status awal: menunggu konfirmasi owner.',
        'data' => ['id_pengajuan' => $newId, 'status_pengajuan' => 'menunggu']
    ], 201);
} catch (Throwable $error) {
    error_log('API pengajuan keluar: ' . $error->getMessage());
    json_response(['success' => false, 'message' => 'Pengajuan belum berhasil disimpan. Periksa koneksi database lalu coba lagi.'], 500);
}
