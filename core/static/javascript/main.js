
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
    map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 53.3498, lng: -6.2603 },
    zoom: 11,
    });
    directionsRenderer.setMap(map);
    calcRoute(directionsService, directionsRenderer, map)
}

// the function that renders all the routes on the map.
// parameter: result, the parameter from the directionsService.route()
// parameter: map, the map
function renderDirections(result, gmap){
    var totalRoutes = result["routes"].length;
    const directionRenders = [];
    const color = ["yellow", "green", "red", "blue", "gray"];
    for(let i = 0; i < totalRoutes; i++){
        directionRenders[i] = new google.maps.DirectionsRenderer({
            directions: result,
            routeIndex: i,
            map: gmap,
            polylineOptions:{
                strokeColor: color[i], 
            }
        });
    } 
}

// this function will return one or more bus numbers of a given routes
// routes is from result["routes"][index]
function getBusNumber(routes){
    var busRoutes = [];
    var steps = routes["legs"][0]["steps"];
    var numberSteps = steps.length;
    for (let i = 0; i < numberSteps; i++){
        if (steps[i]["transit"] !== undefined){
            busRoutes.push(steps[i]["transit"]["line"]["short_name"]);
        }
    }
    return busRoutes;
}

// refer from https://developers.google.com/maps/documentation/javascript/directions?hl=en#TravelModes
function calcRoute(directionsService, directionsRenderer, map) {
    var request = {
        origin: {lat: 53.3068, lng:-6.2229}, // start location
        destination: {lat:53.3449, lng:-6.2601}, // end location
        travelMode: "TRANSIT", // -> public transport
        transitOptions: {
            //departureTime: new Date(), the time of departure, default now
            modes: ["BUS"],
            //routingPreference:'FEWER_TRANSFERS'/'LESS_WALKING' 
        },
        //waypoints: DirectionsWaypoint, the points the route will pass throuth
        //optimizeWaypoints: Boolean,
        provideRouteAlternatives: true, // show more than one routes
        avoidHighways: false, // no need to avoid the highway
        avoidTolls: false, //no need to avoid the tolles
    };
    directionsService.route(request, function(result, status){
        if(status == "OK"){

            // display all the possible routes on the map
            renderDirections(result, map);

            // pass the bus numbers of every route to the busInfoBar and display it.
            var totalNumberOfRoutes = result["routes"].length// total number of routes

            for(let route = 0; route < totalNumberOfRoutes; route++){
                $(".busInfo").append("<div class = 'oneBus'>\
                                        <p class = 'busHeader'>"+"BUS "+getBusNumber(result["routes"][route])+"</p>\
                                        <p class = 'busDetail' id = 'arrivingTime'>Arriving time:</p>\
                                        <p class = 'busDetail' id = 'totalTravelTime'>Total travel time:</p>\
                                        <p class = 'busDetail' id = 'busFare'>Bus fare:</p>\
                                        <p class = 'busDetail' id = 'carbonEmissionSaved'>Carbon emission saved:</p>\
                                    </div>")
            }
            
            

            //console.log(totalNumberOfRoutes);
            //directionsRenderer.setDirections(result);
            //directionsRenderer.setRouteIndex(1);
            //directionsRenderer.setRouteIndex(2);
            console.log(result["routes"][1]);
            //console.log(result["routes"][busRouteIndex]["legs"][0]["steps"][1]["transit"]["line"]["short_name"]);// --> to get the bus number of this route
        }
        else{
            console.log(status);
        }
        });
}
//
//https://stackoverflow.com/questions/35050401/display-multiple-routes-between-two-points-on-google-maps
//display more than one routes on the map
//https://stackoverflow.com/questions/2466215/google-maps-api-directionsrendereroptions-not-working
window.initMap = initMap;

