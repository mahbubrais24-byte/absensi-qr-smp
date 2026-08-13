const API_URL =
"https://script.google.com/macros/s/AKfycbzF-dkz-qiprRO1UiBXip0LzojGuAAdGyvYuCYEVEiDbh0l1r5-uKfqkouPwzceK-bD/exec";

const params = new URLSearchParams(window.location.search);
const SCANNER_TICKET = params.get("ticket") || "";

let modeAbsen = "";
let sedangProses = false;
let scanner = null;


/* =========================
   BEEP
========================= */

function bunyiBeep() {

    try {

        const AudioCtx =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioCtx) return;

        const audio = new AudioCtx();

        const oscillator =
            audio.createOscillator();

        const gain =
            audio.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = 900;

        oscillator.connect(gain);
        gain.connect(audio.destination);

        gain.gain.setValueAtTime(
            0.2,
            audio.currentTime
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

        console.log(e);

    }
}


/* =========================
   JAM
========================= */

function tampilJam() {

    const sekarang =
        new Date();

    const hari = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu"
    ];

    const bulan = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember"
    ];

    const tanggal =
        hari[sekarang.getDay()] +
        ", " +
        sekarang.getDate() +
        " " +
        bulan[sekarang.getMonth()] +
        " " +
        sekarang.getFullYear();

    const jam =
        sekarang.toLocaleTimeString(
            "id-ID"
        ) +
        " WIB";

    const el =
        document.getElementById(
            "jamDigital"
        );

    if (el) {

        el.innerHTML =
            tanggal +
            "<br>" +
            jam;

    }
}


/* =========================
   STATUS
========================= */

function tampilStatus(
    pesan,
    berhasil = null
) {

    const status =
        document.getElementById(
            "status"
        );

    if (!status) return;

    status.innerHTML =
        pesan;

    status.classList.remove(
        "sukses"
    );

    status.classList.remove(
        "gagal"
    );

    if (berhasil === true) {

        status.classList.add(
            "sukses"
        );

    }

    if (berhasil === false) {

        status.classList.add(
            "gagal"
        );

    }
}


/* =========================
   MULAI SCANNER
========================= */

function mulaiScanner() {

    try {

        if (
            typeof Html5Qrcode ===
            "undefined"
        ) {

            tampilStatus(
                "❌ Library QR belum dimuat.",
                false
            );

            return;

        }

        scanner =
            new Html5Qrcode(
                "reader"
            );

        tampilStatus(
            "📷 Membuka kamera..."
        );


        /*
         * INI BAGIAN PENTING.
         *
         * Kita kembali menggunakan
         * facingMode environment.
         *
         * Metode ini adalah metode
         * scanner lama yang sudah
         * pernah berhasil di HP Mas Rais.
         */

        scanner.start(

            {
                facingMode:
                    "environment"
            },

            {
                fps: 10,

                qrbox: {
                    width: 250,
                    height: 250
                },

                aspectRatio: 1.0

            },

            function(decodedText) {

                ketikaQRTerbaca(
                    decodedText
                );

            },

            function(errorMessage) {

                // Jangan tampilkan error
                // setiap frame.

            }

        )
        .then(function() {

            tampilStatus(
                modeAbsen
                    ? "📷 Kamera aktif — siap scan."
                    : "📷 Kamera aktif — pilih MASUK/PULANG."
            );

            console.log(
                "Kamera berhasil aktif."
            );

        })
        .catch(function(error) {

            console.error(
                "Kamera gagal:",
                error
            );

            tampilStatus(
                "❌ Kamera gagal dibuka. " +
                "Pastikan izin kamera Chrome aktif.",
                false
            );

        });

    } catch (error) {

        console.error(
            error
        );

        tampilStatus(
            "❌ Scanner gagal dimulai.",
            false
        );

    }

}


/* =========================
   QR TERBACA
========================= */

function ketikaQRTerbaca(
    decodedText
) {

    if (
        sedangProses
    ) {

        return;

    }

    if (
        !modeAbsen
    ) {

        tampilStatus(
            "⚠️ Silakan pilih ABSEN MASUK atau ABSEN PULANG terlebih dahulu.",
            false
        );

        return;

    }

    if (
        !decodedText
    ) {

        return;

    }

    sedangProses =
        true;

    const qr =
        String(
            decodedText
        ).trim();

    document.getElementById(
        "nis"
    ).innerHTML =
        qr;

    bunyiBeep();

    if (
        navigator.vibrate
    ) {

        navigator.vibrate(
            200
        );

    }

    tampilStatus(
        "⏳ Mengirim absensi..."
    );

    kirimAbsensi(
        qr,
        modeAbsen
    );

}


/* =========================
   KIRIM ABSENSI
========================= */

async function kirimAbsensi(
    qr,
    mode
) {

    try {

        /*
         * Kalau scanner dibuka
         * dari aplikasi utama,
         * ticket akan tersedia.
         */

        let url;

        if (
            SCANNER_TICKET
        ) {

            url =
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

        } else {

            /*
             * Kompatibilitas dengan
             * sistem lama.
             */

            url =
                API_URL +
                "?api=absen" +
                "&nis=" +
                encodeURIComponent(
                    qr
                ) +
                "&mode=" +
                encodeURIComponent(
                    mode
                );

        }


        const response =
            await fetch(
                url,
                {
                    method:
                        "GET",

                    cache:
                        "no-store"
                }
            );


        const hasil =
            await response.json();


        console.log(
            "Hasil server:",
            hasil
        );


        /*
         * Sistem baru
         */

        if (
            hasil.success === true
        ) {

            tampilkanBerhasil(
                hasil
            );

        }

        /*
         * Sistem lama
         */

        else if (
            hasil.status === true
        ) {

            tampilkanBerhasilLama(
                hasil
            );

        }

        else {

            tampilkanGagal(
                hasil.message ||
                hasil.pesan ||
                "Absensi ditolak."
            );

        }


    } catch (error) {

        console.error(
            "Error:",
            error
        );

        tampilkanGagal(
            "Gagal menghubungi server."
        );

    }


    setTimeout(
        function() {

            sedangProses =
                false;

        },
        2500
    );

}


/* =========================
   HASIL BARU
========================= */

function tampilkanBerhasil(
    hasil
) {

    const nama =
        hasil.nama ||
        "-";

    const nis =
        hasil.nisn ||
        "-";

    const kelas =
        hasil.kelas ||
        "-";

    document.getElementById(
        "nama"
    ).innerHTML =
        nama;

    document.getElementById(
        "nis"
    ).innerHTML =
        nis;

    document.getElementById(
        "kelas"
    ).innerHTML =
        kelas;

    tampilStatus(
        "✅ " +
        (
            hasil.message ||
            "Absensi berhasil."
        ),
        true
    );

    ambilStatistik();

    resetSetelahScan();

}


/* =========================
   HASIL SISTEM LAMA
========================= */

function tampilkanBerhasilLama(
    hasil
) {

    if (
        hasil.siswa
    ) {

        document.getElementById(
            "nama"
        ).innerHTML =
            hasil.siswa.nama;

        document.getElementById(
            "nis"
        ).innerHTML =
            hasil.siswa.nis;

        document.getElementById(
            "kelas"
        ).innerHTML =
            hasil.siswa.kelas;

    }

    tampilStatus(
        hasil.pesan ||
        "Absensi berhasil.",
        true
    );

    ambilStatistik();

    resetSetelahScan();

}


/* =========================
   GAGAL
========================= */

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
                200,
                100,
                200
            ]
        );

    }

    setTimeout(
        function() {

            sedangProses =
                false;

            tampilStatus(
                modeAbsen
                    ? "📷 Siap scan lagi."
                    : "Silakan pilih ABSEN MASUK atau ABSEN PULANG."
            );

        },
        2500
    );

}


/* =========================
   RESET
========================= */

function resetSetelahScan() {

    setTimeout(
        function() {

            document.getElementById(
                "nama"
            ).innerHTML =
                "-";

            document.getElementById(
                "nis"
            ).innerHTML =
                "-";

            document.getElementById(
                "kelas"
            ).innerHTML =
                "-";

            tampilStatus(
                "📷 Siap scan siswa berikutnya."
            );

            modeAbsen =
                "";

            sedangProses =
                false;

        },
        2500
    );

}


/* =========================
   STATISTIK
========================= */

async function ambilStatistik() {

    try {

        const response =
            await fetch(
                API_URL +
                "?api=statistik",
                {
                    cache:
                        "no-store"
                }
            );

        const hasil =
            await response.json();


        if (
            hasil.status
        ) {

            const masuk =
                document.getElementById(
                    "jmlMasuk"
                );

            const pulang =
                document.getElementById(
                    "jmlPulang"
                );

            if (masuk) {

                masuk.innerHTML =
                    hasil.masuk;

            }

            if (pulang) {

                pulang.innerHTML =
                    hasil.pulang;

            }

        }

    } catch (error) {

        console.log(
            "Statistik:",
            error
        );

    }

}


/* =========================
   TOMBOL MASUK
========================= */

document.getElementById(
    "btnMasuk"
).onclick =
function() {

    modeAbsen =
        "MASUK";

    sedangProses =
        false;

    tampilStatus(
        "🟢 Mode : ABSEN MASUK"
    );

};


/* =========================
   TOMBOL PULANG
========================= */

document.getElementById(
    "btnPulang"
).onclick =
function() {

    modeAbsen =
        "PULANG";

    sedangProses =
        false;

    tampilStatus(
        "🔵 Mode : ABSEN PULANG"
    );

};


/* =========================
   START
========================= */

tampilJam();

ambilStatistik();

setInterval(
    tampilJam,
    1000
);

setInterval(
    ambilStatistik,
    10000
);


/*
 * Mulai kamera setelah
 * halaman benar-benar siap.
 */

window.addEventListener(
    "load",
    function() {

        setTimeout(
            function() {

                mulaiScanner();

            },
            500
        );

    }
);
