const scanner = new Html5Qrcode("reader");

scanner.start(

    { facingMode: "environment" },

    {
        fps: 10,
        qrbox: 250
    },

    function(decodedText){

    document.getElementById("nis").innerHTML = decodedText;

}

    function(error){

        // abaikan

    }

);
