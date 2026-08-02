const API_URL = https://script.google.com/macros/s/AKfycbzw6CoOg9xNm6-dGgJxeWZDGKoOne6wIHUU4p6wZhNy3Si9KY9KrrEUBvh1kSvmi368/exec

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
