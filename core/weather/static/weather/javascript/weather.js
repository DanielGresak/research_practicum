$(function (){

    $.ajax({
        // url: 'weather/',
        url: "http://localhost:8000/weather/",
        success: function (data) {
            console.log(data);
        }
    });

});
