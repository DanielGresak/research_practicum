function getWeather(url) {
    $.ajax({
      url: url,
      type: "GET",
      dataType: "json",
      success: (data) => {
        console.log("successful query!")
        console.log(data);
        },
      error: (error) => {
        console.log(error);
      }
    });
  }

    // $.ajax({
    //     // url: 'weather/',
    //     url: "http://localhost:8000/weather/",
    //     success: function (data) {
    //         console.log(data);
    //         $.each(data, function(i, item) {
    //             var $tr = $('<tr>').append(
    //                 $('<td>').text(item.temp),
    //                 $('<td>').text(item.temp_min),
    //                 $('<td>').text(item.temp_max),
    //                 $('<td>').text(item.humidity),
    //                 $('<td>').text(item.weather_description),
    //                 // Todo: deal with icon seperately
    //                 // $('<td>').text(item.weather_icon), 
    //                 $('<td>').text(item.pop) 
    //             ); //.appendTo('#forecast-table');
    //             console.log($tr.wrap('<p>').html());
    //         });
    //     }
    // });


    // $.getJSON( "{% url 'weather/' %}", function(data) {
    //     console.log(data);

    //     // var items = [];
    //     // $.each( data, function( key, val ) {
    //     //   items.push( "<li id='" + key + "'>" + val + "</li>" );
    //     // });
       
    //     // $( "<ul/>", {
    //     //   "class": "my-new-list",
    //     //   html: items.join( "" )
    //     // }).appendTo( "body" );
    //   });

