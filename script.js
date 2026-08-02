const API_URL = "https://script.google.com/macros/s/AKfycbzw6CoOg9xNm6-dGgJxeWZDGKoOne6wIHUU4p6wZhNy3Si9KY9KrrEUBvh1kSvmi368/exec"

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
