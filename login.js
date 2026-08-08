const API_URL = "https://script.google.com/macros/s/AKfycbwJYCfcKvqOUsSspYHJlJ3sqNzMYx6XkoY5C0ZLcX1Sbkce1F5v4uFYkr5L--6rqDWT/exec";

document.getElementById("btnLogin").addEventListener("click", async function(){

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
    tombol.innerHTML = "⏳ Memeriksa...";

    try {

        const response = await fetch(
            API_URL +
            "?api=login" +
            "&username=" + encodeURIComponent(username) +
            "&password=" + encodeURIComponent(password)
        );

        const hasil = await response.json();

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

    } catch(error) {

        console.error(error);

        pesan.style.color = "red";
        pesan.innerHTML = "❌ Gagal terhubung ke server.";

        tombol.disabled = false;
        tombol.innerHTML = "🔐 LOGIN";
    }

});
