// ==================================================
// DASHBOARD ADMIN
// ==================================================


// ==================================================
// BUKA SCANNER QR
// ==================================================

function bukaScanner() {

  window.location.href =
    "index.html";

}


// ==================================================
// BUKA GENERATOR QR
// ==================================================

function bukaGenerator() {

  window.location.href =
    "generator.html";

}


// ==================================================
// DATA SISWA
// ==================================================

function bukaSiswa() {

  document.getElementById("konten").innerHTML =

    `
      <h2>👨‍🎓 DATA SISWA</h2>

      <p>
        Fitur Data Siswa akan kita buat
        pada tahap berikutnya.
      </p>
    `;

}


// ==================================================
// DATA ABSENSI
// ==================================================

function bukaAbsensi() {

  document.getElementById("konten").innerHTML =

    `
      <h2>📝 DATA ABSENSI</h2>

      <p>
        Fitur Data Absensi akan kita buat
        pada tahap berikutnya.
      </p>
    `;

}


// ==================================================
// STATISTIK
// ==================================================

function bukaStatistik() {

  document.getElementById("konten").innerHTML =

    `
      <h2>📊 STATISTIK</h2>

      <p>
        Fitur Statistik akan kita buat
        pada tahap berikutnya.
      </p>
    `;

}


// ==================================================
// LOGOUT
// ==================================================

function logout() {

  sessionStorage.removeItem(
    "adminLogin"
  );

  sessionStorage.removeItem(
    "adminNama"
  );

  sessionStorage.removeItem(
    "adminLevel"
  );


  window.location.href =
    "login.html";

}
