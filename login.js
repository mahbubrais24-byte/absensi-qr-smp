// ==================================================
// LOGIN ADMIN - GITHUB PAGES
// ==================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycby2GgA23nomnNL33YYyMAWQiLZv1QOB7O21s3BYnceQ87jVMMt_ZUm1irYUTAoO_DI1/exec";


// ==================================================
// EVENT TOMBOL LOGIN
// ==================================================

document.addEventListener("DOMContentLoaded", function () {

  const tombol =
    document.getElementById("btnLogin");

  if (!tombol) {

    console.error(
      "❌ Tombol btnLogin tidak ditemukan."
    );

    return;
  }


  tombol.addEventListener(
    "click",
    prosesLogin
  );

});


// ==================================================
// FUNGSI LOGIN
// ==================================================

function prosesLogin() {

  const username =
    document
      .getElementById("username")
      .value
      .trim();


  const password =
    document
      .getElementById("password")
      .value
      .trim();


  const pesan =
    document.getElementById("pesan");


  const tombol =
    document.getElementById("btnLogin");


  // ==================================================
  // CEK INPUT
  // ==================================================

  if (
    username === "" ||
    password === ""
  ) {

    pesan.style.color = "red";

    pesan.innerHTML =
      "❌ Username dan Password wajib diisi.";

    return;
  }


  // ==================================================
  // TOMBOL LOADING
  // ==================================================

  tombol.disabled = true;

  tombol.innerHTML =
    "⏳ MEMERIKSA...";


  pesan.innerHTML = "";


  // ==================================================
  // CALLBACK UNIK
  // ==================================================

  const callbackName =
    "loginCallback_" +
    Date.now();


  // ==================================================
  // BUAT SCRIPT JSONP
  // ==================================================

  const script =
    document.createElement("script");


  // ==================================================
  // CALLBACK DARI GOOGLE APPS SCRIPT
  // ==================================================

  window[callbackName] =
    function (hasil) {

      console.log(
        "RESPON LOGIN:",
        hasil
      );


      // ----------------------------------------------
      // HAPUS SCRIPT JSONP
      // ----------------------------------------------

      if (script.parentNode) {

        script.parentNode.removeChild(
          script
        );

      }


      delete window[callbackName];


      // ----------------------------------------------
      // CEK RESPON
      // ----------------------------------------------

      if (!hasil) {

        pesan.style.color =
          "red";

        pesan.innerHTML =
          "❌ Server tidak memberikan respon.";

        tombol.disabled = false;

        tombol.innerHTML =
          "🔐 LOGIN";

        return;
      }


      // ==================================================
      // LOGIN BERHASIL
      // ==================================================

      if (
        hasil.status === true
      ) {

        console.log(
          "✅ LOGIN BERHASIL"
        );


        sessionStorage.setItem(
          "adminLogin",
          "true"
        );


        sessionStorage.setItem(
          "adminNama",
          hasil.nama || "Administrator"
        );


        sessionStorage.setItem(
          "adminLevel",
          hasil.level || "ADMIN"
        );


        pesan.style.color =
          "green";

        pesan.innerHTML =
          "✅ Login berhasil.";


        tombol.innerHTML =
          "✅ BERHASIL";


        // ----------------------------------------------
        // MASUK KE ADMIN
        // ----------------------------------------------

        setTimeout(
          function () {

            window.location.href =
              "admin.html";

          },
          500
        );


        return;
      }


      // ==================================================
      // LOGIN GAGAL
      // ==================================================

      pesan.style.color =
        "red";


      pesan.innerHTML =
        "❌ " +
        (
          hasil.pesan ||
          "Username atau password salah."
        );


      tombol.disabled = false;

      tombol.innerHTML =
        "🔐 LOGIN";

    };


  // ==================================================
  // JIKA GAGAL TERHUBUNG
  // ==================================================

  script.onerror =
    function () {

      console.error(
        "❌ JSONP gagal terhubung ke Apps Script."
      );


      pesan.style.color =
        "red";


      pesan.innerHTML =
        "❌ Gagal terhubung ke server Google Apps Script.";


      tombol.disabled = false;

      tombol.innerHTML =
        "🔐 LOGIN";


      delete window[callbackName];


      if (script.parentNode) {

        script.parentNode.removeChild(
          script
        );

      }

    };


  // ==================================================
  // URL REQUEST
  // ==================================================

  script.src =
    API_URL +
    "?api=login" +
    "&username=" +
    encodeURIComponent(username) +
    "&password=" +
    encodeURIComponent(password) +
    "&callback=" +
    encodeURIComponent(callbackName);


  console.log(
    "REQUEST LOGIN:",
    script.src
  );


  // ==================================================
  // KIRIM REQUEST
  // ==================================================

  document.body.appendChild(
    script
  );

}
