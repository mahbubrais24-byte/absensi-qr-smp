/* =========================================================
   ABSENSI QR SMPN 4 PADAHERANG
   GITHUB SCANNER - TERHUBUNG DENGAN GOOGLE APPS SCRIPT
   ========================================================= */

const API_URL =
  "https://script.google.com/macros/s/AKfycbx9loWsIhD7pxfLVAToK-gl06pIgMd1XxnMrXc_L2eoYcKzaH1B_19dwnlUxWkquxTqOA/exec";

const params = new URLSearchParams(window.location.search);
const SCANNER_TICKET = params.get("ticket") || "";

let scanner = null;
let kameraAktif = false;
let daftarKamera = [];

let modeAbsen = "";
let sedangProses = false;

let scanTerakhir = "";
let waktuScanTerakhir = 0;


/* =========================================================
   ELEMENT
   ========================================================= */

function getElement(id) {
  return document.getElementById(id);
}


/* =========================================================
   STATUS
   ========================================================= */

function tampilStatus(pesan, berhasil = null) {

  const status = getElement("status");

  if (!status) return;

  status.textContent = pesan;

  status.classList.remove(
    "sukses",
    "gagal"
  );

  if (berhasil === true) {
    status.classList.add("sukses");
  }

  if (berhasil === false) {
    status.classList.add("gagal");
  }
}


/* =========================================================
   BEEP
   ========================================================= */

function bunyiBeep() {

  try {

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) return;

    const audio =
      new AudioContext();

    const oscillator =
      audio.createOscillator();

    const gain =
      audio.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 900;

    oscillator.connect(gain);
    gain.connect(audio.destination);

    gain.gain.setValueAtTime(
      0.00001,
      audio.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.2,
      audio.currentTime + 0.01
    );

    gain.gain.exponentialRampToValueAtTime(
      0.00001,
      audio.currentTime + 0.15
    );

    oscillator.start();

    oscillator.stop(
      audio.currentTime + 0.15
    );

  } catch (error) {

    console.log(
      "Audio tidak tersedia",
      error
    );
  }
}


/* =========================================================
   GET KAMERA
   ========================================================= */

async function deteksiKamera() {

  try {

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {

      throw new Error(
        "Browser tidak mendukung kamera."
      );
    }

    /*
     * Meminta izin kamera terlebih dahulu.
     * Setelah izin diberikan, stream dimatikan.
     */

    const stream =
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

    stream
      .getTracks()
      .forEach(track => track.stop());

    /*
     * Ambil daftar kamera.
     */

    daftarKamera =
      await Html5Qrcode.getCameras();

    if (
      !daftarKamera ||
      daftarKamera.length === 0
    ) {

      throw new Error(
        "Kamera tidak ditemukan."
      );
    }

    console.log(
      "Daftar kamera:",
      daftarKamera
    );

    return daftarKamera;

  } catch (error) {

    console.error(
      "Deteksi kamera gagal:",
      error
    );

    tampilStatus(
      "❌ Kamera tidak dapat digunakan. " +
      "Pastikan izin kamera diberikan.",
      false
    );

    return [];
  }
}


/* =========================================================
   PILIH KAMERA BELAKANG
   ========================================================= */

function pilihKameraBelakang(
  cameras
) {

  if (
    !cameras ||
    cameras.length === 0
  ) {

    return null;
  }

  const kataBelakang = [
    "back",
    "rear",
    "environment",
    "belakang"
  ];

  for (
    const kamera of cameras
  ) {

    const nama =
      String(
        kamera.label || ""
      ).toLowerCase();

    if (
      kataBelakang.some(
        kata =>
          nama.includes(kata)
      )
    ) {

      return kamera.id;
    }
  }

  /*
   * Jika hanya satu kamera,
   * gunakan kamera tersebut.
   */

  if (
    cameras.length === 1
  ) {

    return cameras[0].id;
  }

  return cameras[0].id;
}


/* =========================================================
   MULAI SCANNER
   ========================================================= */

async function mulaiScanner(
  cameraId = null
) {

  try {

    await hentikanScanner();

    tampilStatus(
      "📷 Menyiapkan kamera..."
    );

    /*
     * Pastikan library tersedia.
     */

    if (
      typeof Html5Qrcode ===
      "undefined"
    ) {

      throw new Error(
        "Library Html5Qrcode belum dimuat."
      );
    }

    /*
     * Deteksi kamera.
     */

    if (
      daftarKamera.length === 0
    ) {

      daftarKamera =
        await deteksiKamera();
    }

    if (
      daftarKamera.length === 0
    ) {

      throw new Error(
        "Tidak ada kamera."
      );
    }

    /*
     * Pilih kamera.
     */

    const selectedCamera =
      cameraId ||
      pilihKameraBelakang(
        daftarKamera
      );

    if (!selectedCamera) {

      throw new Error(
        "Kamera belum dipilih."
      );
    }

    /*
     * Buat scanner baru.
     */

    scanner =
      new Html5Qrcode(
        "reader"
      );

    const config = {

      fps: 10,

      qrbox:
        function (
          width,
          height
        ) {

          const ukuran =
            Math.floor(
              Math.min(
                width,
                height
              ) * 0.70
            );

          const finalSize =
            Math.max(
              180,
              Math.min(
                320,
                ukuran
              )
            );

          return {
            width:
              finalSize,

            height:
              finalSize
          };
        },

      aspectRatio: 1.0,

      disableFlip: false
    };

    await scanner.start(

      selectedCamera,

      config,

      ketikaQRBerhasil,

      function () {
        // Error pembacaan frame
        // tidak perlu ditampilkan.
      }
    );

    kameraAktif = true;

    tampilStatus(
      modeAbsen
        ? "📷 Kamera aktif — siap scan."
        : "📷 Kamera aktif — pilih mode absensi."
    );

    console.log(
      "Scanner aktif:",
      selectedCamera
    );

  } catch (error) {

    kameraAktif = false;

    console.error(
      "Scanner gagal:",
      error
    );

    tampilStatus(
      "❌ Kamera gagal dimulai: " +
      (error.message || error),
      false
    );
  }
}


/* =========================================================
   QR BERHASIL
   ========================================================= */

function ketikaQRBerhasil(
  decodedText
) {

  const qr =
    String(
      decodedText || ""
    ).trim();

  if (!qr) {
    return;
  }

  /*
   * Jangan scan saat request sebelumnya
   * masih diproses.
   */

  if (sedangProses) {
    return;
  }

  /*
   * Mode wajib dipilih.
   */

  if (!modeAbsen) {

    tampilStatus(
      "⚠️ Pilih ABSEN MASUK atau ABSEN PULANG terlebih dahulu.",
      false
    );

    return;
  }

  /*
   * Cegah QR sama terbaca berkali-kali.
   */

  const sekarang =
    Date.now();

  if (
    qr === scanTerakhir &&
    sekarang -
      waktuScanTerakhir <
      3000
  ) {

    return;
  }

  scanTerakhir = qr;

  waktuScanTerakhir =
    sekarang;

  sedangProses = true;

  bunyiBeep();

  if (
    navigator.vibrate
  ) {

    navigator.vibrate(
      [
        100,
        50,
        100
      ]
    );
  }

  tampilStatus(
    "⏳ Memproses absensi..."
  );

  kirimAbsensi(
    qr,
    modeAbsen
  );
}


/* =========================================================
   KIRIM ABSENSI KE APPS SCRIPT
   ========================================================= */

async function kirimAbsensi(
  qr,
  mode
) {

  try {

    if (
      !SCANNER_TICKET
    ) {

      throw new Error(
        "Ticket scanner tidak ditemukan."
      );
    }

    /*
     * API baru:
     *
     * api=scan
     * ticket=...
     * qr=...
     * mode=MASUK/PULANG
     */

    const url =
      API_URL +
      "?api=scan" +
      "&ticket=" +
      encodeURIComponent(
        SCANNER_TICKET
      ) +
      "&qr=" +
      encodeURIComponent(
        qr
      ) +
      "&mode=" +
      encodeURIComponent(
        mode
      );

    console.log(
      "Mengirim scan ke server..."
    );

    const response =
      await fetch(
        url,
        {
          method: "GET",
          cache: "no-store"
        }
      );

    if (
      !response.ok
    ) {

      throw new Error(
        "Server HTTP " +
        response.status
      );
    }

    const hasil =
      await response.json();

    console.log(
      "Response:",
      hasil
    );

    if (
      hasil &&
      hasil.success === true
    ) {

      tampilkanBerhasil(
        hasil
      );

    } else {

      tampilkanGagal(
        hasil?.message ||
        "Absensi ditolak."
      );
    }

  } catch (error) {

    console.error(
      "Koneksi server gagal:",
      error
    );

    tampilkanGagal(
      error.message ||
      "Gagal menghubungi server."
    );
  }

  /*
   * Izinkan scan berikutnya.
   */

  setTimeout(
    function () {

      sedangProses =
        false;

    },
    2500
  );
}


/* =========================================================
   HASIL BERHASIL
   ========================================================= */

function tampilkanBerhasil(
  hasil
) {

  bunyiBeep();

  if (
    navigator.vibrate
  ) {

    navigator.vibrate(
      [
        100,
        50,
        100
      ]
    );
  }

  const nama =
    hasil.nama ||
    "-";

  const nisn =
    hasil.nisn ||
    "-";

  const kelas =
    hasil.kelas ||
    "-";

  const pesan =
    hasil.message ||
    "Absensi berhasil.";

  /*
   * Tampilkan data siswa.
   */

  const namaEl =
    getElement("nama");

  const nisEl =
    getElement("nis");

  const kelasEl =
    getElement("kelas");

  if (namaEl) {
    namaEl.textContent =
      nama;
  }

  if (nisEl) {
    nisEl.textContent =
      nisn;
  }

  if (kelasEl) {
    kelasEl.textContent =
      kelas;
  }

  tampilStatus(
    "✅ " +
    pesan,
    true
  );

  /*
   * Bersihkan setelah beberapa detik.
   */

  setTimeout(
    function () {

      if (namaEl) {
        namaEl.textContent =
          "-";
      }

      if (nisEl) {
        nisEl.textContent =
          "-";
      }

      if (kelasEl) {
        kelasEl.textContent =
          "-";
      }

      tampilStatus(
        "📷 Siap scan siswa berikutnya."
      );

    },
    3000
  );
}


/* =========================================================
   HASIL GAGAL
   ========================================================= */

function tampilkanGagal(
  pesan
) {

  tampilStatus(
    "❌ " +
    pesan,
    false
  );

  if (
    navigator.vibrate
  ) {

    navigator.vibrate(
      [
        250,
        100,
        250
      ]
    );
  }

  setTimeout(
    function () {

      sedangProses =
        false;

      tampilStatus(
        modeAbsen
          ? "📷 Siap mencoba scan lagi."
          : "Silakan pilih mode absensi."
      );

    },
    3000
  );
}


/* =========================================================
   MODE MASUK
   ========================================================= */

function setModeMasuk() {

  modeAbsen =
    "MASUK";

  sedangProses =
    false;

  scanTerakhir =
    "";

  waktuScanTerakhir =
    0;

  tampilStatus(
    "🟢 Mode ABSEN MASUK aktif."
  );
}


/* =========================================================
   MODE PULANG
   ========================================================= */

function setModePulang() {

  modeAbsen =
    "PULANG";

  sedangProses =
    false;

  scanTerakhir =
    "";

  waktuScanTerakhir =
    0;

  tampilStatus(
    "🔵 Mode ABSEN PULANG aktif."
  );
}


/* =========================================================
   ALIAS UNTUK TOMBOL LAMA
   ========================================================= */

function absenMasuk() {
  setModeMasuk();
}

function absenPulang() {
  setModePulang();
}

function setMode(mode) {

  const nilai =
    String(
      mode || ""
    ).toUpperCase();

  if (
    nilai === "MASUK"
  ) {

    setModeMasuk();

  } else if (
    nilai === "PULANG"
  ) {

    setModePulang();

  } else {

    tampilStatus(
      "⚠️ Mode tidak valid.",
      false
    );
  }
}


/* =========================================================
   GANTI KAMERA
   ========================================================= */

async function gantiKamera(
  cameraId
) {

  if (!cameraId) {
    return;
  }

  await mulaiScanner(
    cameraId
  );
}


/* =========================================================
   KAMERA BELAKANG
   ========================================================= */

async function kameraBelakang() {

  if (
    daftarKamera.length === 0
  ) {

    daftarKamera =
      await deteksiKamera();
  }

  const id =
    pilihKameraBelakang(
      daftarKamera
    );

  if (id) {

    await gantiKamera(
      id
    );
  }
}


/* =========================================================
   KAMERA DEPAN
   ========================================================= */

async function kameraDepan() {

  if (
    daftarKamera.length === 0
  ) {

    daftarKamera =
      await deteksiKamera();
  }

  if (
    daftarKamera.length < 2
  ) {

    tampilStatus(
      "ℹ️ Perangkat hanya memiliki satu kamera."
    );

    return;
  }

  const depan =
    daftarKamera.find(
      kamera => {

        const nama =
          String(
            kamera.label || ""
          ).toLowerCase();

        return (
          nama.includes("front") ||
          nama.includes("user") ||
          nama.includes("depan")
        );
      }
    );

  const id =
    depan
      ? depan.id
      : daftarKamera[
          daftarKamera.length - 1
        ].id;

  await gantiKamera(
    id
  );
}


/* =========================================================
   PILIH KAMERA
   ========================================================= */

async function pilihKamera(
  cameraId
) {

  await gantiKamera(
    cameraId
  );
}


/* =========================================================
   STOP SCANNER
   ========================================================= */

async function hentikanScanner() {

  const scannerLama =
    scanner;

  scanner = null;

  kameraAktif =
    false;

  if (!scannerLama) {
    return;
  }

  try {

    await scannerLama.stop();

  } catch (error) {

    console.log(
      "Stop scanner:",
      error
    );
  }

  try {

    scannerLama.clear();

  } catch (error) {

    console.log(
      "Clear scanner:",
      error
    );
  }
}


/* =========================================================
   STOP CAMERA
   ========================================================= */

async function stopCamera() {

  await hentikanScanner();
}


/* =========================================================
   TORCH / LAMPU
   ========================================================= */

async function toggleTorch() {

  /*
   * html5-qrcode tidak selalu menyediakan
   * torch pada semua perangkat.
   */

  try {

    if (
      !scanner ||
      !kameraAktif
    ) {

      tampilStatus(
        "Kamera belum aktif.",
        false
      );

      return;
    }

    if (
      typeof scanner.applyVideoConstraints !==
      "function"
    ) {

      tampilStatus(
        "Lampu kamera tidak didukung perangkat ini."
      );

      return;
    }

    tampilStatus(
      "💡 Kontrol lampu kamera tergantung dukungan perangkat."
    );

  } catch (error) {

    console.error(
      error
    );
  }
}


/* =========================================================
   RESET
   ========================================================= */

async function resetScanner() {

  sedangProses =
    false;

  scanTerakhir =
    "";

  waktuScanTerakhir =
    0;

  await mulaiScanner();
}


/* =========================================================
   JAM DIGITAL
   ========================================================= */

function updateJam() {

  const jam =
    getElement(
      "jamDigital"
    );

  if (!jam) {
    return;
  }

  jam.textContent =
    new Date().toLocaleString(
      "id-ID",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }
    ) +
    " WIB";
}


/* =========================================================
   VALIDASI TICKET
   ========================================================= */

function cekTicket() {

  if (
    !SCANNER_TICKET
  ) {

    tampilStatus(
      "❌ Scanner tidak memiliki ticket. " +
      "Silakan buka scanner dari aplikasi utama.",
      false
    );

    return false;
  }

  return true;
}


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initScannerApp() {

  console.log(
    "Absensi QR Scanner dimulai."
  );

  /*
   * Ticket wajib ada.
   */

  if (
    !cekTicket()
  ) {

    return;
  }

  /*
   * Jam.
   */

  updateJam();

  setInterval(
    updateJam,
    1000
  );

  /*
   * Mulai kamera.
   */

  await mulaiScanner();
}


/* =========================================================
   PAGE LOAD
   ========================================================= */

window.addEventListener(
  "DOMContentLoaded",
  function () {

    initScannerApp();

  }
);


/* =========================================================
   PAGE CLOSE
   ========================================================= */

window.addEventListener(
  "beforeunload",
  function () {

    if (scanner) {

      try {

        scanner.stop();

      } catch (_) {}
    }
  }
);
