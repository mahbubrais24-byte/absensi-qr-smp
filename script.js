const API_URL = "https://script.google.com/macros/s/AKfycbwJYCfcKvqOUsSspYHJlJ3sqNzMYx6XkoY5C0ZLcX1Sbkce1F5v4uFYkr5L--6rqDWT/exec";

let html5QrCode = null;
let modeAbsen = "";
let sedangScan = false;

function pilihMode(mode) {

    modeAbsen = mode;

    document.getElementById("hasil").innerHTML =
        "<b>Mode : " + mode + "</b><br>Mengaktifkan kamera...";

    mulaiScanner();
}

async function mulaiScanner() {

    if (html5QrCode) {

        try {
            await html5QrCode.stop();
        } catch (e) {}

        try {
            await html5QrCode.clear();
        } catch (e) {}
    }

    html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: 250
        },
        suksesScan,
        function () {}
    );
}

async function suksesScan(decodedText) {

    if (sedangScan) return;

    sedangScan = true;

    document.getElementById("hasil").innerHTML = "Mengirim data...";

    try {

        const url =
            API_URL +
            "?api=absen" +
            "&nis=" + encodeURIComponent(decodedText.trim()) +
            "&mode=" + encodeURIComponent(modeAbsen);

        const response = await fetch(url);

        const hasil = await response.json();

        if (hasil.status) {

            document.getElementById("hasil").innerHTML =
                "✅ " + hasil.pesan;

        } else {

            document.getElementById("hasil").innerHTML =
                "❌ " + hasil.pesan;

        }

    } catch (err) {

        document.getElementById("hasil").innerHTML =
            "❌ Error : " + err;

    }

    setTimeout(function () {
        sedangScan = false;
    }, 3000);
}
