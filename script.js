// ===========================
// KONFIGURASI
// ===========================

// GANTI DENGAN URL WEB APP APPS SCRIPT BAPAK
const API_URL = "https://script.google.com/macros/s/AKfycbwJYCfcKvqOUsSspYHJlJ3sqNzMYx6XkoY5C0ZLcX1Sbkce1F5v4uFYkr5L--6rqDWT/exec";

let html5QrCode = null;
let modeAbsen = "";
let sedangScan = false;

// ===========================
// PILIH MODE
// ===========================

function pilihMode(mode){

    modeAbsen = mode;

    document.getElementById("hasil").innerHTML =
        "<b>Mode : " + mode + "</b><br>Mengaktifkan kamera...";

    mulaiScanner();

}

// ===========================
// MULAI SCANNER
// ===========================

async function mulaiScanner(){

    if(html5QrCode){

        try{
            await html5QrCode.stop();
        }catch(e){}

        try{
            await html5QrCode.clear();
        }catch(e){}
    }

    html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(

        {
            facingMode:"environment"
        },

        {
            fps:10,
            qrbox:250
        },

        suksesScan,

        function(){}

    );

}

// ===========================
// SAAT QR BERHASIL
// ===========================

async function suksesScan(decodedText){

    if(sedangScan) return;

    sedangScan = true;

    document.getElementById("hasil").innerHTML =
        "Mengirim data...";

    try{

        const response = await fetch(API_URL,{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                nis:decodedText.trim(),
                mode:modeAbsen

            })

        });

        const text = await response.text();

alert(text);

document.getElementById("hasil").innerHTML = text;

    }catch(err){

    console.error(err);

    document.getElementById("hasil").innerHTML =
        "❌ " + err.message;

    alert(err.message);

}
