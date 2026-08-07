const API_URL = "https://script.google.com/macros/s/AKfycbzw6CoOg9xNm6-dGgJxeWZDGKoOne6wIHUU4p6wZhNy3Si9KY9KrrEUBvh1kSvmi368/exec";

document.getElementById("btnCari").onclick = async function () {

    const nis = document.getElementById("nisCari").value.trim();

    if (nis == "") {
        alert("Masukkan NIS");
        return;
    }

    try {

        const response = await fetch(
            API_URL + "?api=carisiswa&nis=" + encodeURIComponent(nis)
        );

        const hasil = await response.json();

        if(!hasil.status){

    const pesan = document.getElementById("pesan");

    pesan.className = "error";
    pesan.innerHTML = "❌ NIS tidak ditemukan.";

    document.getElementById("kartuQR").style.display = "none";
    document.getElementById("aksi").style.display = "none";

    setTimeout(function(){

        pesan.style.display = "none";

    },3000);

    return;

}

        }

        document.getElementById("kartuQR").style.display = "block";

        document.getElementById("aksi").style.display = "flex";

        document.getElementById("kNama").innerHTML = hasil.siswa.nama;

        document.getElementById("kNis").innerHTML = hasil.siswa.nis;

        document.getElementById("kKelas").innerHTML = hasil.siswa.kelas;

        document.getElementById("qrArea").innerHTML = "";

new QRCode(document.getElementById("qrArea"), {
    text: hasil.siswa.nis,
    width: 220,
    height: 220
});

    } catch (err) {

        console.log(err);

        alert("Gagal menghubungi server.");

    }

};

document.getElementById("btnCetak").onclick = function(){

    window.print();

};

document.getElementById("btnDownload").onclick = function(){

    html2canvas(document.getElementById("kartuQR")).then(function(canvas){

        const link = document.createElement("a");

        link.download =
            document.getElementById("kNama").innerHTML + ".png";

        link.href = canvas.toDataURL("image/png");

        link.click();

    });

};
