const API_URL = "https://script.google.com/macros/s/AKfycbzw6CoOg9xNm6-dGgJxeWZDGKoOne6wIHUU4p6wZhNy3Si9KY9KrrEUBvh1kSvmi368/exec";

document.getElementById("btnCari").onclick = async function(){

    const nis = document.getElementById("nisCari").value.trim();

    if(nis==""){

        alert("Masukkan NIS");

        return;

    }

    const response = await fetch(

        API_URL +

        "?api=carisiswa&nis="+encodeURIComponent(nis)

    );

    const hasil = await response.json();

    if(!hasil.status){

        document.getElementById("hasil").innerHTML=

        "<h2>NIS tidak ditemukan</h2>";

        return;

    }

    document.getElementById("hasil").innerHTML=

    "<h2>"+hasil.siswa.nama+"</h2>"+

    "<p>NIS : "+hasil.siswa.nis+"</p>"+

    "<p>Kelas : "+hasil.siswa.kelas+"</p>";

};
