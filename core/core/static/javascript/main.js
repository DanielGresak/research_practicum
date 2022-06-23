
let map;
//var apikey = 'https://maps.googleapis.com/maps/api/directions/json?origin=Disneyland&destination=Universal+Studios+Hollywood&key=AIzaSyBEulkjFc2UqiZiYyTqCTeYBG_BvpzI4ek';


function initMap() {
    var directionsService = new google.maps.DirectionsService();
    var directionsRenderer = new google.maps.DirectionsRenderer();
    map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 53.3498, lng: -6.2603 },
    zoom: 11,
    });
    directionsRenderer.setMap(map);
    calcRoute(directionsService, directionsRenderer)
}

// refer from https://developers.google.com/maps/documentation/javascript/directions?hl=en#TravelModes
function calcRoute(directionsService, directionsRenderer) {
    var request = {
        origin: {lat: 53.3068, lng:-6.2229}, // start location
        destination: {lat:53.3449, lng:-6.2601}, // end location
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
            directionsRenderer.setDirections(result);
        }
        else{
            console.log(status)
        }
        });
}
window.initMap = initMap;

