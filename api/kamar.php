<?php
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['success' => false, 'message' => 'Metode request tidak didukung.'], 405);
}

function get_room_image(string $roomNumber, ?string $kostPhoto): string
{
    $safeNumber = preg_replace('/[^a-zA-Z0-9_-]/', '', $roomNumber);
    $roomFilename = 'kamar-' . $safeNumber . '.jpg';
    $imageDirectory = __DIR__ . '/../assets/img/';

    if (is_file($imageDirectory . $roomFilename)) {
        return 'assets/img/' . $roomFilename;
    }

    if ($kostPhoto !== null && $kostPhoto !== '') {
        $safeKostPhoto = basename($kostPhoto);
        if (is_file($imageDirectory . $safeKostPhoto)) {
            return 'assets/img/' . $safeKostPhoto;
        }
    }

    return 'assets/img/room-placeholder.svg';
}

try {
    $connection = db_connect();
    $roomId = isset($_GET['id_kamar']) ? filter_var($_GET['id_kamar'], FILTER_VALIDATE_INT) : null;

    if (isset($_GET['id_kamar']) && (!$roomId || $roomId < 1)) {
        json_response(['success' => false, 'message' => 'ID kamar tidak valid.'], 400);
    }

    $sql = "SELECT k.id_kamar, k.nomor_kamar, k.fasilitas_kamar, k.harga_kost,
                   k.status_kamar, ko.nama_kost, ko.alamat, ko.fasilitas AS fasilitas_umum,
                   ko.foto_kost
            FROM kamar k
            INNER JOIN kost ko ON ko.id_kost = k.id_kost";

    if ($roomId !== null) {
        $sql .= ' WHERE k.id_kamar = ? LIMIT 1';
        $statement = $connection->prepare($sql);
        $statement->bind_param('i', $roomId);
        $statement->execute();
        $result = $statement->get_result();
        $room = $result->fetch_assoc();
        $statement->close();

        if (!$room) {
            json_response(['success' => false, 'message' => 'Informasi kamar tidak ditemukan.'], 404);
        }

        $room['foto'] = get_room_image((string) $room['nomor_kamar'], $room['foto_kost'] ?? null);
        $room['fasilitas_array'] = array_values(array_filter(array_map('trim', explode(',', (string) ($room['fasilitas_kamar'] ?? '')))));
        $room['fasilitas_umum_array'] = array_values(array_filter(array_map('trim', explode(',', (string) ($room['fasilitas_umum'] ?? '')))));
        json_response(['success' => true, 'data' => $room]);
    }

    $sql .= ' ORDER BY ko.nama_kost, k.nomor_kamar';
    $result = $connection->query($sql);
    $rooms = [];

    while ($room = $result->fetch_assoc()) {
        $room['foto'] = get_room_image((string) $room['nomor_kamar'], $room['foto_kost'] ?? null);
        $room['fasilitas_array'] = array_values(array_filter(array_map('trim', explode(',', (string) ($room['fasilitas_kamar'] ?? '')))));
        $rooms[] = $room;
    }

    json_response(['success' => true, 'data' => $rooms]);
} catch (Throwable $error) {
    error_log('API kamar: ' . $error->getMessage());
    json_response(['success' => false, 'message' => 'Data kamar belum dapat dimuat. Periksa koneksi database di config/database.php.'], 500);
}
