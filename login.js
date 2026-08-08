const API_URL = "https://script.google.com/macros/s/AKfycby2GgA23nomnNL33YYyMAWQiLZv1QOB7O21s3BYnceQ87jVMMt_ZUm1irYUTAoO_DI1/exec";

document.getElementById("btnLogin").addEventListener("click", function(){

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const pesan = document.getElementById("pesan");
    const tombol = document.getElementById("btnLogin");

    if(username === "" || password === ""){

        pesan.style.color = "red";
        pesan.innerHTML = "❌ Username dan Password wajib diisi.";

        return;
    }

    tombol.disabled = true;
    tombol.innerHTML = "⏳ MEMERIKSA...";

    const callbackName = "loginCallback_" + Date.now();

    window[callbackName] = function(hasil){

        if(hasil.status){

            pesan.style.color = "green";
            pesan.innerHTML = "✅ Login berhasil.";

            setTimeout(function(){

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

    const script = document.createElement("script");

    script.src =
        API_URL +
        "?api=login" +
        "&username=" + encodeURIComponent(username) +
        "&password=" + encodeURIComponent(password) +
        "&callback=" + callbackName;

    script.onerror = function(){

        pesan.style.color = "red";
        pesan.innerHTML = "❌ Gagal terhubung ke server.";

        tombol.disabled = false;
        tombol.innerHTML = "🔐 LOGIN";

        delete window[callbackName];
        script.remove();
    };

    document.body.appendChild(script);

});
