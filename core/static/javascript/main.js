
$(".appbar").hide();
/* When an icon is clicked */
$(".vertical-menu a").click(function(){
    if ($(this).hasClass("active")){
        $(this).removeClass("active")
        $(".appbar").animate({width: 'toggle'});
    }
    else{
        if ($(".vertical-menu a").hasClass("active")){
            $(".vertical-menu a").removeClass("active");

            $(this).toggleClass('active');
        }
        else {
            $(".vertical-menu a").removeClass("active");
            $(".appbar").animate({width: 'toggle'});
            $(this).toggleClass('active');
        }

    }

})


let map;
//var apikey = 'https://maps.googleapis.com/maps/api/directions/json?origin=Disneyland&destination=Universal+Studios+Hollywood&key=AIzaSyBEulkjFc2UqiZiYyTqCTeYBG_BvpzI4ek';


function initMap() {
    var directionsService = new google.maps.DirectionsService();
    var directionsRenderer = new google.maps.DirectionsRenderer();
    // create autocomplete objects for all input
    var options = {
        types: ['(cities)']
    }
    var input1 = document.getElementById('search_start')
    var autocomplete1 = new google.maps.places.Autocomplete(input1, options)

    var input2 = document.getElementById('search_destination')
    var autocomplete2 = new google.maps.places.Autocomplete(input2, options)
    // create map and set map options
    map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 53.3498, lng: -6.2603 },
    zoom: 11,
    });
    directionsRenderer.setMap(map);
    document.getElementById("btn").addEventListener('click', event => {
        calcRoute(directionsService, directionsRenderer);
});

}


function calcRoute(directionsService, directionsRenderer) {
    var request = {
        origin: document.getElementById('search_start').value, // start location
        destination: document.getElementById('search_destination').value, // end location
        travelMode: 'TRANSIT', // -> public transport
        transitOptions: {
            //departureTime: new Date(), the time of departure, default now
            modes: ['BUS'],
            //routingPreference:'FEWER_TRANSFERS'/'LESS_WALKING'
        },
        //waypoints: DirectionsWaypoint, the points the route will pass throuth
        //optimizeWaypoints: Boolean,
        provideRouteAlternatives: true, // show more than one routes
        avoidHighways: false, // no need to avoid the highway
        avoidTolls: false //no need to avoid the tolles
    };
    directionsService.route(request, function(result, status){
        if(status == 'OK'){
            // display routes
            directionsRenderer.setDirections(result);
        }
        else{
            console.log(status)
        }
        });
}


window.initMap = initMap;



