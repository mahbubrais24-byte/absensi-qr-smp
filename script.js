const API_URL = "https://script.google.com/macros/s/AKfycbzw6CoOg9xNm6-dGgJxeWZDGKoOne6wIHUU4p6wZhNy3Si9KY9KrrEUBvh1kSvmi368/exec"

function bunyiBeep() {

    const audio = new AudioContext();

    const oscillator = audio.createOscillator();

    const gain = audio.createGain();

    oscillator.type = "sine";

    oscillator.frequency.value = 900;

    oscillator.connect(gain);

    gain.connect(audio.destination);

    oscillator.start();

    gain.gain.exponentialRampToValueAtTime(
        0.00001,
        audio.currentTime + 0.15
    );

    oscillator.stop(audio.currentTime + 0.15);

}

let modeAbsen = "MASUK";

let sedangProses = false;

const scanner = new Html5Qrcode("reader");

alert("Script berhasil dimuat");

scanner.start(
    { facingMode: "environment" },
    {
        fps: 10,
        qrbox: 180
    },

    function(decodedText){

    alert("QR Terbaca : " + decodedText);

    if (sedangProses) return;

    sedangProses = true;

    document.getElementById("nis").innerHTML = decodedText;

    bunyiBeep();

    if (navigator.vibrate) {
    navigator.vibrate(150,100,150);
}

    document.getElementById("status").innerHTML = "Mengirim absensi...";

    kirimAbsensi(decodedText, modeAbsen);

},

    function(error){

        // abaikan

    }

);

async function kirimAbsensi(nis, mode) {

    try {

        const response = await fetch(
            API_URL +
            "?nis=" + encodeURIComponent(nis) +
            "&mode=" + encodeURIComponent(mode)
        );

        const hasil = await response.json();

        const status = document.getElementById("status");

status.innerHTML = hasil.pesan;

status.classList.remove("sukses");

status.classList.remove("gagal");

if (hasil.status){

    status.classList.add("sukses");

}else{

    status.classList.add("gagal");

}

if (hasil.siswa) {

    document.getElementById("nama").innerHTML = hasil.siswa.nama;

    document.getElementById("nis").innerHTML = hasil.siswa.nis;

    document.getElementById("kelas").innerHTML = hasil.siswa.kelas;

}

    } catch (err) {

        console.error(err);

        alert("Gagal menghubungi server.");

    }

    setTimeout(function () {

    sedangProses = false;

    document.getElementById("nama").innerHTML = "-";

    document.getElementById("nis").innerHTML = "-";

    document.getElementById("kelas").innerHTML = "-";

    document.getElementById("status").innerHTML = "Menunggu Scan...";

    document.getElementById("status").classList.remove("sukses");

    document.getElementById("status").classList.remove("gagal");

}, 2000);
    
}

// kirimAbsensi("3131232652", "MASUK");

document.getElementById("btnMasuk").onclick = function () {

    modeAbsen = "MASUK";

    document.getElementById("status").innerHTML =
        "Mode : ABSEN MASUK";

};

document.getElementById("btnPulang").onclick = function () {

    modeAbsen = "PULANG";

    document.getElementById("status").innerHTML =
        "Mode : ABSEN PULANG";

};
