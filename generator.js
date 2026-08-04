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

        if (!hasil.status) {

            document.getElementById("kartuQR").style.display = "none";

            alert("NIS tidak ditemukan");

            return;

        }

        document.getElementById("kartuQR").style.display = "block";

        document.getElementById("kNama").innerHTML = hasil.siswa.nama;

        document.getElementById("kNis").innerHTML = hasil.siswa.nis;

        document.getElementById("kKelas").innerHTML = hasil.siswa.kelas;

        document.getElementById("qrArea").innerHTML =
            "<img src='https://chart.googleapis.com/chart?cht=qr&chs=250x250&chl="
            + hasil.siswa.nis +
            "'>";

    } catch (err) {

        console.log(err);

        alert("Gagal menghubungi server.");

    }

};
