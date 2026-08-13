/*
 * ABSENSI QR SMPN 4 PADAHERANG
 * GitHub Pages Scanner
 * Terhubung ke Google Apps Script melalui API + scanner ticket
 */

const params = new URLSearchParams(window.location.search);

const API_URL = params.get('api') || '';
const SCANNER_TICKET = params.get('ticket') || '';

let modeAbsen = '';
let sedangProses = false;
let scanner = null;
let kameraAktif = false;


/* =========================================================
   STATUS
========================================================= */

function setStatus(text, type = '') {
    const el = document.getElementById('status');
    if (!el) return;

    el.textContent = text;

    el.classList.remove('sukses', 'gagal');

    if (type) {
        el.classList.add(type);
    }
}


/* =========================================================
   DATA SISWA
========================================================= */

function setIdentity(siswa) {
    if (!siswa) return;

    const nama = document.getElementById('nama');
    const nis = document.getElementById('nis');
    const kelas = document.getElementById('kelas');

    if (nama) {
        nama.textContent = siswa.nama || '-';
    }

    if (nis) {
        nis.textContent = siswa.nis || siswa.nisn || '-';
    }

    if (kelas) {
        kelas.textContent = siswa.kelas || '-';
    }
}


/* =========================================================
   BEEP
========================================================= */

function bunyiBeep() {
    try {
        const AudioCtx =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioCtx) return;

        const audio = new AudioCtx();

        const oscillator = audio.createOscillator();
        const gain = audio.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = 900;

        oscillator.connect(gain);
        gain.connect(audio.destination);

        gain.gain.setValueAtTime(
            0.00001,
            audio.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.25,
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

    } catch (e) {
        console.warn('Beep gagal:', e);
    }
}


/* =========================================================
   JAM
========================================================= */

function tampilJam() {

    const el = document.getElementById('jamDigital');

    if (!el) return;

    const sekarang = new Date();

    const hari = [
        'Minggu',
        'Senin',
        'Selasa',
        'Rabu',
        'Kamis',
        'Jumat',
        'Sabtu'
    ];

    const bulan = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember'
    ];

    el.innerHTML =
        hari[sekarang.getDay()] +
        ', ' +
        sekarang.getDate() +
        ' ' +
        bulan[sekarang.getMonth()] +
        ' ' +
        sekarang.getFullYear() +
        '<br>' +
        sekarang.toLocaleTimeString('id-ID') +
        ' WIB';
}


/* =========================================================
   VALIDASI CONFIG
========================================================= */

function validasiKonfigurasi() {

    if (!API_URL) {

        setStatus(
            'Scanner tidak memiliki alamat server.',
            'gagal'
        );

        return false;
    }

    if (!SCANNER_TICKET) {

        setStatus(
            'Scanner dibuka tanpa ticket. Silakan buka scanner dari aplikasi utama.',
            'gagal'
        );

        return false;
    }

    return true;
}


/* =========================================================
   ERROR KAMERA
========================================================= */

function cameraErrorMessage(err) {

    const name =
        err && err.name
            ? err.name
            : '';

    if (
        name === 'NotAllowedError' ||
        name === 'PermissionDeniedError'
    ) {
        return 'Izin kamera ditolak. Izinkan kamera untuk halaman ini.';
    }

    if (
        name === 'NotFoundError' ||
        name === 'DevicesNotFoundError'
    ) {
        return 'Kamera tidak ditemukan oleh browser.';
    }

    if (
        name === 'NotReadableError' ||
        name === 'TrackStartError'
    ) {
        return 'Kamera sedang dipakai aplikasi lain. Tutup Kamera, Meet, Zoom, atau aplikasi kamera lain.';
    }

    if (
        name === 'OverconstrainedError'
    ) {
        return 'Kamera pilihan tidak tersedia. Silakan pilih kamera lain.';
    }

    if (
        err &&
        err.message
    ) {
        return err.message;
    }

    return 'Kamera gagal dijalankan.';
}


/* =========================================================
   DETEKSI KAMERA
========================================================= */

async function getCameraIds() {

    if (!window.Html5Qrcode) {

        throw new Error(
            'Library QR scanner belum termuat.'
        );
    }

    /*
     * Minta izin kamera terlebih dahulu.
     * Setelah izin diberikan, deviceId dan label
     * kamera biasanya tersedia.
     */

    if (
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia
    ) {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

        stream
            .getTracks()
            .forEach(track => track.stop());
    }

    const cameras =
        await Html5Qrcode.getCameras();

    if (
        !cameras ||
        !cameras.length
    ) {

        throw new Error(
            'Tidak ada kamera yang terdeteksi.'
        );
    }

    return cameras;
}


/* =========================================================
   PILIH KAMERA BELAKANG
========================================================= */

function pilihKameraBelakang(cameras) {

    if (
        !cameras ||
        !cameras.length
    ) {
        return null;
    }

    const rear =
        cameras.find(camera =>
            /back|rear|environment|belakang/i.test(
                String(camera.label || '')
            )
        );

    /*
     * Jika kamera belakang tidak ditemukan,
     * gunakan kamera terakhir sebagai fallback.
     */

    return rear || cameras[cameras.length - 1];
}


/* =========================================================
   START SCANNER
========================================================= */

async function startScanner() {

    if (!validasiKonfigurasi()) {
        return;
    }

    try {

        /*
         * Hentikan scanner sebelumnya.
         */

        if (scanner) {

            try {
                await scanner.stop();
            } catch (e) {}

            try {
                scanner.clear();
            } catch (e) {}

            scanner = null;
        }


        setStatus(
            'Meminta akses kamera...'
        );


        /*
         * Ambil daftar kamera.
         */

        const cameras =
            await getCameraIds();


        const selected =
            pilihKameraBelakang(cameras);


        if (!selected) {

            throw new Error(
                'Kamera tidak tersedia.'
            );
        }


        /*
         * Buat scanner baru.
         */

        scanner =
            new Html5Qrcode(
                'reader',
                {
                    verbose: false
                }
            );


        /*
         * QR BOX RESPONSIVE
         */

        const config = {

            fps: 10,

            qrbox: function(width, height) {

                const size =
                    Math.max(
                        180,
                        Math.min(
                            300,
                            Math.floor(
                                Math.min(
                                    width,
                                    height
                                ) * 0.68
                            )
                        )
                    );

                return {
                    width: size,
                    height: size
                };
            },

            aspectRatio: 1.0,

            disableFlip: false,

            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
            }
        };


        /*
         * MULAI KAMERA BERDASARKAN CAMERA ID
         *
         * Ini bagian penting.
         * Tidak lagi hanya menggunakan facingMode.
         */

        await scanner.start(

            selected.id,

            config,

            function(decodedText) {

                onScanSuccess(
                    decodedText
                );
            },

            function(errorMessage) {

                /*
                 * Error scanning normal diabaikan.
                 * Kamera tetap berjalan.
                 */

            }
        );


        kameraAktif = true;

        setStatus(
            'Kamera aktif. Arahkan QR Code ke kotak scanner.'
        );


    } catch (err) {

        kameraAktif = false;

        console.error(
            'Camera error:',
            err
        );

        setStatus(
            cameraErrorMessage(err),
            'gagal'
        );


        const reader =
            document.getElementById(
                'reader'
            );


        if (reader) {

            reader.innerHTML = `
                <div style="
                    padding:40px;
                    text-align:center;
                ">
                    📷 Kamera gagal dibuka.

                    <br><br>

                    <button
                        onclick="startScanner()"
                        style="
                            padding:10px 20px;
                            border:none;
                            border-radius:8px;
                            background:#2563eb;
                            color:white;
                            font-weight:bold;
                            cursor:pointer;
                        "
                    >
                        🔄 Coba Lagi
                    </button>
                </div>
            `;
        }
    }
}


/* =========================================================
   STOP SCANNER
========================================================= */

async function stopScanner() {

    kameraAktif = false;

    if (!scanner) {
        return;
    }

    try {
        await scanner.stop();
    } catch (e) {}

    try {
        scanner.clear();
    } catch (e) {}

    scanner = null;
}


/* =========================================================
   API ABSENSI
========================================================= */

async function panggilAPI(qrToken) {

    if (!API_URL) {

        throw new Error(
            'API URL tidak tersedia.'
        );
    }


    if (!SCANNER_TICKET) {

        throw new Error(
            'Scanner ticket tidak tersedia.'
        );
    }


    /*
     * API menggunakan:
     *
     * api=scan
     * ticket=...
     * qr=...
     * mode=MASUK/PULANG
     */

    const separator =
        API_URL.includes('?')
            ? '&'
            : '?';


    const url =
        API_URL +
        separator +
        'api=scan' +
        '&ticket=' +
        encodeURIComponent(
            SCANNER_TICKET
        ) +
        '&qr=' +
        encodeURIComponent(
            qrToken
        ) +
        '&mode=' +
        encodeURIComponent(
            modeAbsen
        );


    const response =
        await fetch(
            url,
            {
                method: 'GET',
                cache: 'no-store',
                credentials: 'omit'
            }
        );


    if (!response.ok) {

        throw new Error(
            'Server mengembalikan HTTP ' +
            response.status
        );
    }


    return await response.json();
}


/* =========================================================
   HASIL SCAN
========================================================= */

async function onScanSuccess(decodedText) {

    const value =
        String(
            decodedText || ''
        ).trim();


    /*
     * Abaikan QR kosong.
     */

    if (
        !value ||
        value === 'undefined'
    ) {
        return;
    }


    /*
     * Cegah double scan.
     */

    if (sedangProses) {
        return;
    }


    /*
     * Mode harus dipilih.
     */

    if (!modeAbsen) {

        setStatus(
            'Pilih ABSEN MASUK atau ABSEN PULANG terlebih dahulu.',
            'gagal'
        );

        return;
    }


    sedangProses = true;


    setStatus(
        'QR terbaca. Memproses absensi...'
    );


    /*
     * Suara scan.
     */

    bunyiBeep();


    /*
     * Getar HP.
     */

    if (
        navigator.vibrate
    ) {

        navigator.vibrate(
            150
        );
    }


    try {

        const hasil =
            await panggilAPI(
                value
            );


        /*
         * Jika server mengembalikan data siswa.
         */

        if (
            hasil &&
            hasil.status === true
        ) {

            setIdentity(
                hasil.siswa || {
                    nama: hasil.nama,
                    nisn: hasil.nisn,
                    kelas: hasil.kelas
                }
            );
        }


        /*
         * ABSENSI BERHASIL
         */

        if (
            hasil &&
            hasil.success
        ) {

            const waktu =
                hasil.type === 'pulang'
                    ? hasil.jamPulang
                    : hasil.jamDatang;


            setStatus(

                (hasil.message ||
                    'Absensi berhasil') +

                (
                    waktu
                        ? ' — ' + waktu
                        : ''
                ),

                'sukses'
            );


        } else {

            /*
             * ABSENSI DITOLAK
             */

            setStatus(

                (
                    hasil &&
                    hasil.message
                ) ||

                'Scan ditolak.',

                'gagal'
            );
        }


    } catch (err) {

        console.error(
            'API error:',
            err
        );


        setStatus(

            'Gagal menghubungi server: ' +
            (
                err.message ||
                err
            ),

            'gagal'
        );


    } finally {

        /*
         * Setelah 1,8 detik
         * scanner siap membaca QR berikutnya.
         */

        setTimeout(
            function() {

                sedangProses = false;

                setStatus(

                    modeAbsen
                        ? 'Mode: ABSEN ' +
                          modeAbsen

                        : 'Pilih ABSEN MASUK atau ABSEN PULANG'
                );

            },
            1800
        );
    }
}


/* =========================================================
   MODE ABSENSI
========================================================= */

function setMode(mode) {

    modeAbsen = mode;


    const masuk =
        document.getElementById(
            'btnMasuk'
        );


    const pulang =
        document.getElementById(
            'btnPulang'
        );


    if (masuk) {

        masuk.style.opacity =
            mode === 'MASUK'
                ? '1'
                : '0.7';
    }


    if (pulang) {

        pulang.style.opacity =
            mode === 'PULANG'
                ? '1'
                : '0.7';
    }


    setStatus(
        'Mode: ABSEN ' +
        mode
    );
}


/* =========================================================
   STATISTIK
========================================================= */

function ambilStatistik() {

    /*
     * Tidak digunakan untuk proses scan.
     *
     * Endpoint statistik tidak dipanggil
     * tanpa ticket agar tidak menjadi
     * endpoint publik.
     */

}


/* =========================================================
   START APP
========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    function() {

        const btnMasuk =
            document.getElementById(
                'btnMasuk'
            );


        const btnPulang =
            document.getElementById(
                'btnPulang'
            );


        if (btnMasuk) {

            btnMasuk.onclick =
                function() {

                    setMode(
                        'MASUK'
                    );
                };
        }


        if (btnPulang) {

            btnPulang.onclick =
                function() {

                    setMode(
                        'PULANG'
                    );
                };
        }


        tampilJam();


        setInterval(
            tampilJam,
            1000
        );


        /*
         * Validasi URL.
         */

        if (
            validasiKonfigurasi()
        ) {

            setStatus(
                'Menyiapkan kamera...'
            );

            startScanner();
        }

    }
);


/* =========================================================
   BERSIHKAN KAMERA SAAT HALAMAN DITUTUP
========================================================= */

window.addEventListener(
    'beforeunload',
    function() {

        if (scanner) {

            try {
                scanner.stop();
            } catch (e) {}

        }

    }
);
