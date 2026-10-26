(function ($) {
  'use strict';

  const pageFiles = {
    home: 'pages/home.html',
    kamar: 'pages/kamar.html',
    berhenti: 'pages/berhenti.html'
  };

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character];
    });
  }

  function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', maximumFractionDigits: 0
    }).format(Number(value || 0));
  }

  function setActiveNavigation(page) {
    $('.nav-item').removeClass('active').removeAttr('aria-current');
    $('.nav-item[data-page="' + page + '"]').addClass('active').attr('aria-current', 'page');
  }

  function loadPage(page, updateHistory) {
    if (!pageFiles[page]) page = 'home';
    $('#page-content').html('<div class="page-loading"><span class="spinner"></span> Memuat halaman...</div>');
    setActiveNavigation(page);

    $.ajax({ url: pageFiles[page], method: 'GET', dataType: 'html', cache: false })
      .done(function (html) {
        $('#page-content').html(html).attr('data-page', page);
        if (updateHistory) {
          window.history.pushState({ page: page }, '', '#' + page);
        }
        if (page === 'kamar') loadRooms();
        if (page === 'berhenti') {
          loadActiveResidents();
          setMinimumDate();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .fail(function () {
        $('#page-content').html('<section class="content-page"><h1>Halaman gagal dimuat</h1><p>Pastikan Apache aktif dan file halaman tersedia di folder pages.</p><button class="button button-primary js-nav" data-page="home" type="button">Kembali ke Home</button></section>');
      });
  }

  function statusLabel(status) {
    return status === 'kosong' ? 'Tersedia' : 'Terisi';
  }

  function renderRoomCard(room) {
    const isAvailable = room.status_kamar === 'kosong';
    const facilities = Array.isArray(room.fasilitas_array) ? room.fasilitas_array : [];
    const facilityPreview = facilities.slice(0, 2).map(escapeHtml).join(' · ') || 'Fasilitas belum dicantumkan';
    return `
      <article class="room-card" role="button" tabindex="0" data-room-id="${Number(room.id_kamar)}" aria-label="Lihat detail kamar ${escapeHtml(room.nomor_kamar)}">
        <img src="${escapeHtml(room.foto)}" alt="Foto kamar ${escapeHtml(room.nomor_kamar)}" loading="lazy" onerror="this.onerror=null;this.src='assets/img/room-placeholder.svg';">
        <h2>Kamar ${escapeHtml(room.nomor_kamar)}</h2>
        <p class="room-kost">${escapeHtml(room.nama_kost)}</p>
        <span class="room-price">${formatRupiah(room.harga_kost)} <small>/ bulan</small></span>
        <div class="room-card-footer">
          <span class="status-pill ${isAvailable ? 'available' : 'occupied'}">${statusLabel(room.status_kamar)}</span>
          <span class="card-detail-link">Lihat detail →</span>
        </div>
        <span class="visually-hidden">${facilityPreview}</span>
      </article>`;
  }

  function loadRooms() {
    $('#room-status').text('Memuat data kamar dari database...');
    $('#room-list').empty();
    $.ajax({ url: 'api/kamar.php', method: 'GET', dataType: 'json' })
      .done(function (response) {
        if (!response.success || !Array.isArray(response.data)) {
          $('#room-status').text(response.message || 'Data kamar tidak tersedia.');
          return;
        }
        if (response.data.length === 0) {
          $('#room-status').text('Belum ada data kamar di database.');
          return;
        }
        $('#room-status').text(response.data.length + ' kamar ditemukan');
        $('#room-list').html(response.data.map(renderRoomCard).join(''));
      })
      .fail(function (xhr) {
        const message = xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'Gagal mengambil data kamar. Pastikan database db_kelola_kost sudah aktif.';
        $('#room-status').text(message);
      });
  }

  function renderFacilities(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return '<li>Belum ada informasi fasilitas</li>';
    }
    return items.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('');
  }

  function showRoomModal(room) {
    const isAvailable = room.status_kamar === 'kosong';
    const roomFacilities = Array.isArray(room.fasilitas_array) ? room.fasilitas_array : [];
    const commonFacilities = Array.isArray(room.fasilitas_umum_array) ? room.fasilitas_umum_array : [];
    const html = `
      <div class="modal-backdrop js-modal-backdrop">
        <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="room-modal-title">
          <div class="modal-room-layout">
            <img class="modal-room-image" src="${escapeHtml(room.foto)}" alt="Foto kamar ${escapeHtml(room.nomor_kamar)}" onerror="this.onerror=null;this.src='assets/img/room-placeholder.svg';">
            <div class="modal-room-content">
              <p class="eyebrow">DETAIL INFORMASI KAMAR</p>
              <h2 id="room-modal-title">Kamar ${escapeHtml(room.nomor_kamar)}</h2>
              <p class="room-kost">${escapeHtml(room.nama_kost)}</p>
              <p class="modal-price">${formatRupiah(room.harga_kost)} <span>/ bulan</span></p>
              <span class="status-pill ${isAvailable ? 'available' : 'occupied'}">${statusLabel(room.status_kamar)}</span>
              <div class="modal-section"><h3>Fasilitas Kamar</h3><ul class="facility-list">${renderFacilities(roomFacilities)}</ul></div>
              <div class="modal-section"><h3>Alamat Kost</h3><p class="modal-address">${escapeHtml(room.alamat || 'Alamat belum tersedia')}</p></div>
              <div class="modal-section"><h3>Fasilitas Umum Kost</h3><ul class="facility-list">${renderFacilities(commonFacilities)}</ul></div>
              <div class="modal-footer"><button type="button" class="button button-primary js-close-modal">Kembali ke Daftar Kamar</button></div>
            </div>
          </div>
        </section>
      </div>`;
    $('#modal-root').html(html);
    $('.js-close-modal').trigger('focus');
  }

  function showSuccessModal(message, applicationId) {
    const idText = applicationId ? '<span class="success-meta">Nomor pengajuan: #' + Number(applicationId) + '</span>' : '';
    const html = `
      <div class="modal-backdrop js-modal-backdrop">
        <section class="modal-card success-modal" role="dialog" aria-modal="true" aria-labelledby="success-modal-title">
          <div class="success-symbol" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg></div>
          <h2 id="success-modal-title">Pengajuan Berhasil!</h2>
          <p>${escapeHtml(message)}</p>
          ${idText}
          <button type="button" class="button button-primary js-close-modal">Kembali ke Halaman Pengajuan</button>
        </section>
      </div>`;
    $('#modal-root').html(html);
    $('.js-close-modal').trigger('focus');
  }

  function loadActiveResidents() {
    const $select = $('#id_penghuni');
    if (!$select.length) return;
    $select.html('<option value="">Memuat daftar penghuni...</option>');

    $.ajax({ url: 'api/penghuni-aktif.php', method: 'GET', dataType: 'json' })
      .done(function (response) {
        if (!response.success || !Array.isArray(response.data)) {
          $select.html('<option value="">Daftar penghuni tidak tersedia</option>');
          showFormFeedback(response.message || 'Daftar penghuni tidak dapat dimuat.', 'error');
          return;
        }
        if (response.data.length === 0) {
          $select.html('<option value="">Tidak ada penghuni aktif</option>');
          showFormFeedback('Database belum memiliki penghuni berstatus aktif.', 'error');
          return;
        }
        let options = '<option value="">Pilih nama penghuni</option>';
        response.data.forEach(function (resident) {
          const room = resident.nomor_kamar ? ' · Kamar ' + resident.nomor_kamar : '';
          options += '<option value="' + Number(resident.id_penghuni) + '">' + escapeHtml(resident.nama_penghuni + room) + '</option>';
        });
        $select.html(options);
      })
      .fail(function (xhr) {
        $select.html('<option value="">Gagal memuat penghuni</option>');
        const message = xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'Gagal memuat penghuni. Periksa database.';
        showFormFeedback(message, 'error');
      });
  }

  function setMinimumDate() {
    const $date = $('#tanggal_keluar');
    if (!$date.length) return;
    const now = new Date();
    const localDate = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    $date.attr('min', localDate);
  }

  function showFormFeedback(message, type) {
    const $feedback = $('#leave-feedback');
    if (!$feedback.length) return;
    $feedback.removeClass('error success').addClass('is-visible ' + (type || 'error')).text(message);
  }

  function clearFormFeedback() {
    $('#leave-feedback').removeClass('is-visible error success').text('');
  }

  $(document).on('click', '.js-nav', function (event) {
    event.preventDefault();
    const page = $(this).data('page');
    loadPage(page, true);
  });

  $(window).on('popstate', function () {
    loadPage((window.location.hash || '#home').slice(1), false);
  });

  $(document).on('keydown', '.room-card', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      $(this).trigger('click');
    }
  });

  $(document).on('click', '.room-card', function () {
    const roomId = Number($(this).data('room-id'));
    if (!roomId) return;
    $.ajax({ url: 'api/kamar.php', method: 'GET', data: { id_kamar: roomId }, dataType: 'json' })
      .done(function (response) {
        if (response.success && response.data) showRoomModal(response.data);
        else $('#room-status').text(response.message || 'Detail kamar tidak ditemukan.');
      })
      .fail(function (xhr) {
        const message = xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'Detail kamar gagal dimuat.';
        $('#room-status').text(message);
      });
  });

  $(document).on('click', '.js-close-modal', function () { $('#modal-root').empty(); });
  $(document).on('click', '.js-modal-backdrop', function (event) {
    if (event.target === this) $('#modal-root').empty();
  });
  $(document).on('keydown', function (event) {
    if (event.key === 'Escape') $('#modal-root').empty();
  });

  $(document).on('change', '#id_penghuni, #tanggal_keluar, #alasan_keluar', clearFormFeedback);

  $(document).on('submit', '#leave-form', function (event) {
    event.preventDefault();
    clearFormFeedback();
    const form = this;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const reasonField = form.elements.alasan_keluar;
    const reason = String(reasonField.value || '').trim();
    if (reason.length < 5) {
      showFormFeedback('Alasan berhenti minimal 5 karakter.', 'error');
      reasonField.focus();
      return;
    }

    const $button = $(form).find('button[type="submit"]');
    const $label = $button.find('.submit-label');
    $button.prop('disabled', true);
    $label.text('Mengirim...');

    $.ajax({
      url: 'api/pengajuan-keluar.php',
      method: 'POST',
      data: $(form).serialize(),
      dataType: 'json'
    }).done(function (response) {
      if (response.success) {
        const applicationId = response.data ? response.data.id_pengajuan : null;
        form.reset();
        setMinimumDate();
        showSuccessModal(response.message, applicationId);
      } else {
        showFormFeedback(response.message || 'Pengajuan belum berhasil dikirim.', 'error');
      }
    }).fail(function (xhr) {
      const response = xhr.responseJSON || {};
      showFormFeedback(response.message || 'Terjadi kesalahan saat mengirim pengajuan. Periksa koneksi database.', 'error');
    }).always(function () {
      $button.prop('disabled', false);
      $label.text('Kirim Pengajuan');
    });
  });

  $(function () {
    const initialPage = (window.location.hash || '#home').slice(1);
    loadPage(initialPage, false);
  });
})(jQuery);
