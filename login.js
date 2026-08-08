const API_URL = "https://script.google.com/macros/s/AKfycby2GgA23nomnNL33YYyMAWQiLZv1QOB7O21s3BYnceQ87jVMMt_ZUm1irYUTAoO_DI1/exec";

document.getElementById("btnLogin").addEventListener("click", function () {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const pesan = document.getElementById("pesan");
    const tombol = document.getElementById("btnLogin");

    // Cek kolom kosong
    if (username === "" || password === "") {

        pesan.style.color = "red";
        pesan.innerHTML = "❌ Username dan Password wajib diisi.";

        return;
    }

    // Ubah tombol
    tombol.disabled = true;
    tombol.innerHTML = "⏳ MEMERIKSA...";

    // Nama callback unik
    const callbackName = "loginCallback_" + Date.now();

    // Buat elemen script
    const script = document.createElement("script");

    // Fungsi yang menerima hasil dari Google Apps Script
    window[callbackName] = function (hasil) {

        console.log("Hasil login:", hasil);

        if (hasil.status === true) {

            pesan.style.color = "green";
            pesan.innerHTML = "✅ Login berhasil.";

            // Simpan informasi admin
            sessionStorage.setItem(
                "adminLogin",
                "true"
            );

            sessionStorage.setItem(
                "adminNama",
                hasil.nama || ""
            );

            sessionStorage.setItem(
                "adminLevel",
                hasil.level || ""
            );

            // Masuk dashboard
            setTimeout(function () {

                window.location.href = "admin.html";

            }, 800);

        } else {

            pesan.style.color = "red";
            pesan.innerHTML = "❌ " + hasil.pesan;

            tombol.disabled = false;
            tombol.innerHTML = "🔐 LOGIN";
        }

        delete window[callbackName];
        script.remove();
    };

    // URL API
    script.src =
        API_URL +
        "?api=login" +
        "&username=" + encodeURIComponent(username) +
        "&password=" + encodeURIComponent(password) +
        "&callback=" + callbackName;

    // Jika gagal koneksi
    script.onerror = function () {

        pesan.style.color = "red";
        pesan.innerHTML = "❌ Gagal terhubung ke server.";

        tombol.disabled = false;
        tombol.innerHTML = "🔐 LOGIN";

        delete window[callbackName];
        script.remove();
    };

    document.body.appendChild(script);

});
