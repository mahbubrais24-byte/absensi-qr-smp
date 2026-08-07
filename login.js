document.getElementById("btnLogin").addEventListener("click", function(){

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const pesan = document.getElementById("pesan");

    if(username === "" || password === ""){
        pesan.innerHTML = "❌ Username dan Password wajib diisi.";
        return;
    }

    pesan.style.color = "green";
    pesan.innerHTML = "✅ Login berhasil...";

    setTimeout(function(){
        window.location.href = "admin.html";
    },1000);

});
