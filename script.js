const API_URL =
"https://script.google.com/macros/s/AKfycbzF-dkz-qiprRO1UiBXip0LzojGuAAdGyvYuCYEVEiDbh0l1r5-uKfqkouPwzceK-bD/exec";

const params =
new URLSearchParams(
    window.location.search
);

const SCANNER_TICKET =
params.get("ticket") || "";

let modeAbsen = "";
let sedangProses = false;
let scanner = null;


/* ==============================
   BEEP
============================== */

function bunyiBeep() {

    try {

        const AudioCtx =
            window.AudioContext ||
            window.webkitAudioContext;

        const audio =
            new AudioCtx();

        const oscillator =
            audio.createOscillator();

        const gain =
            audio.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = 900;

        oscillator.connect(gain);
        gain.connect(audio.destination);

        oscillator.start();

        gain.gain.exponentialRampToValueAtTime(
            0.00001,
            audio.currentTime + 0.15
        );

        oscillator.stop(
            audio.currentTime + 0.15
        );

    } catch (e) {

        console.log(e);

    }

}


/* ==============================
   JAM
============================== */

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


/* ==============================
   STATUS
============================== */

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


/* ==============================
   CEK TICKET
============================== */

function cekTicket() {

    if (!SCANNER_TICKET) {

        tampilStatus(
            "❌ Scanner tidak memiliki ticket. " +
            "Silakan buka scanner dari aplikasi utama.",
            false
        );

        return false;

    }

    return true;

}


/* ==============================
   MULAI KAMERA
============================== */

function mulaiKamera() {

    try {

        if (
            typeof Html5Qrcode ===
            "undefined"
        ) {

            tampilStatus(
                "❌ Library scanner belum dimuat.",
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

                ketikaQR(
                    decodedText
                );

            },

            function(errorMessage) {

                // Abaikan error pembacaan frame.

            }

        )
        .then(function() {

            tampilStatus(
                modeAbsen
                    ? "📷 Kamera aktif — siap scan."
                    : "📷 Kamera aktif — pilih MASUK atau PULANG."
            );

        })
        .catch(function(error) {

            console.error(
                "Kamera:",
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


/* ==============================
   QR TERBACA
============================== */

function ketikaQR(
    decodedText
) {

    const qr =
        String(
            decodedText || ""
        ).trim();

    if (!qr) {
        return;
    }

    if (
        sedangProses
    ) {
        return;
    }

    if (!modeAbsen) {

        tampilStatus(
            "⚠️ Pilih ABSEN MASUK atau ABSEN PULANG terlebih dahulu.",
            false
        );

        return;

    }

    sedangProses =
        true;

    document.getElementById(
        "nis"
    ).innerHTML =
        qr;

    tampilStatus(
        "⏳ QR terbaca. Memproses absensi..."
    );

    bunyiBeep();

    if (
        navigator.vibrate
    ) {

        navigator.vibrate(
            150
        );

    }

    kirimAbsensi(
        qr,
        modeAbsen
    );

}


/* ==============================
   KIRIM ABSENSI
============================== */

async function kirimAbsensi(
    qr,
    mode
) {

    try {

        if (!SCANNER_TICKET) {

            throw new Error(
                "Ticket scanner tidak ditemukan."
            );

        }

        /*
         * INI PERUBAHAN TERPENTING.
         *
         * Sebelumnya:
         * api=absen
         *
         * Sekarang:
         * api=scan
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
            "Mengirim absensi:",
            url
        );


        const response =
            await fetch(
                url,
                {
                    method:
                        "GET",

                    cache:
                        "no-store",

                    credentials:
                        "omit"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const hasil =
            await response.json();


        console.log(
            "HASIL ABSENSI:",
            hasil
        );


        if (
            hasil.success === true
        ) {

            document.getElementById(
                "nama"
            ).innerHTML =
                hasil.nama ||
                "-";

            document.getElementById(
                "nis"
            ).innerHTML =
                hasil.nisn ||
                qr;

            document.getElementById(
                "kelas"
            ).innerHTML =
                hasil.kelas ||
                "-";


            let pesan =
                hasil.message ||
                "Absensi berhasil.";

            if (
                hasil.jamDatang
            ) {

                pesan +=
                    "<br>Jam Masuk: " +
                    hasil.jamDatang;

            }

            if (
                hasil.jamPulang
            ) {

                pesan +=
                    "<br>Jam Pulang: " +
                    hasil.jamPulang;

            }


            tampilStatus(
                "✅ " +
                pesan,
                true
            );


            /*
             * Setelah berhasil,
             * langsung update statistik.
             */

            await ambilStatistik();


        } else {

            tampilStatus(
                "❌ " +
                (
                    hasil.message ||
                    "Absensi ditolak."
                ),
                false
            );

        }


    } catch (error) {

        console.error(
            "ABSENSI ERROR:",
            error
        );

        tampilStatus(
            "❌ Gagal mengirim absensi: " +
            error.message,
            false
        );

    }


    setTimeout(
        function() {

            sedangProses =
                false;

        },
        2000
    );

}


/* ==============================
   STATISTIK
============================== */

async function ambilStatistik() {

    try {

        const response =
            await fetch(

                API_URL +
                "?api=statistik",

                {
                    method:
                        "GET",

                    cache:
                        "no-store",

                    credentials:
                        "omit"
                }

            );


        if (
            !response.ok
        ) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const hasil =
            await response.json();


        console.log(
            "STATISTIK:",
            hasil
        );


        if (
            hasil.status === true
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
                    Number(
                        hasil.masuk || 0
                    );

            }


            if (pulang) {

                pulang.innerHTML =
                    Number(
                        hasil.pulang || 0
                    );

            }

        }


    } catch (error) {

        console.error(
            "Statistik error:",
            error
        );

    }

}


/* ==============================
   MODE MASUK
============================== */

document.getElementById(
    "btnMasuk"
).onclick =
function() {

    modeAbsen =
        "MASUK";

    tampilStatus(
        "🟢 Mode : ABSEN MASUK"
    );

};


/* ==============================
   MODE PULANG
============================== */

document.getElementById(
    "btnPulang"
).onclick =
function() {

    modeAbsen =
        "PULANG";

    tampilStatus(
        "🔵 Mode : ABSEN PULANG"
    );

};


/* ==============================
   START
============================== */

window.addEventListener(
    "load",
    function() {

        tampilJam();

        setInterval(
            tampilJam,
            1000
        );


        /*
         * Ambil statistik awal.
         */

        ambilStatistik();


        /*
         * Update statistik setiap 5 detik.
         */

        setInterval(
            ambilStatistik,
            5000
        );


        /*
         * Ticket WAJIB ada.
         */

        if (
            cekTicket()
        ) {

            mulaiKamera();

        }

    }
);


/* ==============================
   STOP KAMERA
============================== */

window.addEventListener(
    "beforeunload",
    function() {

        if (
            scanner
        ) {

            try {

                scanner.stop();

            } catch (e) {}

        }

    }
);
