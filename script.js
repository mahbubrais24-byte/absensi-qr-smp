const API_URL = "https://script.google.com/macros/s/AKfycbzw6CoOg9xNm6-dGgJxeWZDGKoOne6wIHUU4p6wZhNy3Si9KY9KrrEUBvh1kSvmi368/exec"

let modeAbsen = "MASUK";

const scanner = new Html5Qrcode("reader");

scanner.start(

    { facingMode: "environment" },

    {
        fps: 10,
        qrbox: 250
    },

    function(decodedText){

    document.getElementById("nis").innerHTML = decodedText;

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

        console.log(hasil);

    } catch (err) {

        console.error(err);

        alert("Gagal menghubungi server.");

    }

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
