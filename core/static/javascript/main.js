
/* dynamic main page component behaviour. */



/* https://stackoverflow.com/questions/54835849/django-how-to-send-csrf-token-with-ajax */
let cookie = document.cookie
let csrfToken = cookie.substring(cookie.indexOf('=') + 1)


/* HIDING COMPONENTS ON LOAD */

$(".appbar").hide(); 

$(".app-bar-app").hide();

$(".busInfo").hide();

$(".login").hide();


/* TOOLBAR CLICK FUNCTIONALITY */
$(".vertical-menu a").click(function(){
    if ($(this).hasClass("active")){ // If the clicked item is highlighted
        $(this).removeClass("active") // unhighlight the item
        $(".appbar").animate({width: ['toggle']}); // Collapse or uncollapse the appbar
        item_clicked = $(this).data("value") // Getting data value to know which app to show
        $("." + item_clicked).hide()
    }
    
    else {
        if ($(".vertical-menu a").hasClass("active")){ // If any of the icons are active (other than the one clicked)
            item_to_hide = $(".active").data("value") // Getting data value to know which app to hide
            $("." + item_to_hide).hide(600, "swing")
            $(".vertical-menu a").removeClass("active"); // Unhighlight all icons
            $(this).toggleClass('active'); // Highlight this icon
            item_clicked = $(this).data("value") // Getting data value to know which app to show
            $("." + item_clicked).show(600, "swing")
        } 
        else {
            $(".vertical-menu a").removeClass("active"); 
            $(".appbar").animate({width: 'toggle'}); // Toggle appbar
            $(this).toggleClass('active'); // Make the clicked icon active
            item_clicked = $(this).data("value") // Getting data value to know which app to show
            $("." + item_clicked).show()
        }
    }
})

/* HAMBURGER BUTTON FUNCTIONALITY - MOBILE */

$(".dot-div").click(function(){    
    $(".vertical-menu").animate({width: 'toggle'});
    if ($(".vertical-menu a").hasClass("active")){
        item_to_hide = $(".active").data("value") // Getting data value to know which app to hide
        $("." + item_to_hide).hide(600, "swing")
        $(".active").removeClass("active")
        $(".appbar").animate({width: ['toggle']}); // Hiding appbar

    }

})

/* MAP RENDERING */

let map;

function initMap() {
    var directionsService = new google.maps.DirectionsService();
    var directionsRenderer = new google.maps.DirectionsRenderer();
    // create autocomplete objects for all input
    var dublinBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(53.271937, -6.409767),
        new google.maps.LatLng(53.406819, -6.063698)
    );
    //options to restrict api to only dublin city
    var options = {
    bounds: dublinBounds,
    types: ["geocode"],
    componentRestrictions: { country: "ie" },
    strictBounds: true,
    };

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
    $("#btn").click(function(){
        $(".busInfo").css("display", "inline");
        calcRoute(directionsService, directionsRenderer, map);
        $(".searchbar").css("display", "none");
    });
}

/* DIRECTIONS FUNCTIONALITY */

let carDrivingDistance = 0;
// the function that renders all the routes on the map.
// parameter: result, the parameter from the directionsService.route()
// parameter: map, the map
//return the directionRender[]
function renderDirections(result, gmap){
    var totalRoutes = result["routes"].length;
    const directionRenders = [];
    const color = ["#9ACD32", "#DB7093", "#A0522D", "#4682B4"];// the color for the routes
    for(let i = 0; i < totalRoutes; i++){
            directionRenders[i] = new google.maps.DirectionsRenderer({
            directions: result,
            routeIndex: i,
            map: gmap,
            polylineOptions:{
                strokeColor: color[i],
                strokeOpacity: 0.9, 
            }
        });}
    
    //change color of the stroke https://stackoverflow.com/questions/9311498/change-the-color-of-the-polyline-in-directionsrenderer
    return directionRenders;
}

// this function will return an array contains the dicts of the bus routes and related details pairs
// in case of transfering bus, more than one dict will be in this array

// so the structure of this array is like [{"46a":{}}, {"36":{}}, {"walkingTime":200}..], the length of the array is the number of bus need to transfer
// the bus route details dict contains the: arriving time of this bus, the draving distance, the headsign (last stop on this route) of this bus
// and the number of stops this trip will cover.

// routes is from result["routes"][index]
function getBusInfo(routes){
    var busRoutes = [];
    var steps = routes["legs"][0]["steps"];
    var numberSteps = steps.length;
    var otherTime=0;
    for (let i = 0; i < numberSteps; i++){
        if (steps[i]["transit"] !== undefined){// find the steps for the bus instead of walking
            var routeInfo={};
            var thisRoute={};
            routeInfo["arriving_time"]=steps[i]["transit"]["departure_time"]["text"];
            routeInfo["arrivalTimestamp"] = steps[i]["transit"]["departure_time"]["value"];
            routeInfo["driving_distance"]=steps[i]["distance"]["value"];
            routeInfo["num_stops"]=steps[i]["transit"]["num_stops"];
            routeInfo["travel_time"]=steps[i]["duration"]["value"];// travel time in second.
            thisRoute[steps[i]["transit"]["line"]["short_name"]]=routeInfo;
            busRoutes.push(thisRoute);
        }
        else{
            otherTime=otherTime + steps[i]["duration"]["value"];
        }
    }
    var walking={};
    walking["walkingTime"]=otherTime;
    busRoutes.push(walking);
    return busRoutes;
}

function getForecastTravelTime(option, walkingTime, startTime){
    //console.log(option);
    var forecastTravelTime = 0;
    var trip = option["legs"][0]["steps"];
    for(const route of trip){
        if(route["transit"] !== undefined){
            var direction = getDirection(route["transit"]["line"]["short_name"],route["transit"]["departure_stop"]["name"], route["transit"]["arrival_stop"]["name"]); 
            var porprotion = getStopPorprotion(route["transit"]["line"]["short_name"], route["transit"]["departure_stop"]["name"], route["transit"]["arrival_stop"]["name"], direction);       
            forecastTravelTime = forecastTravelTime + travelTime(route, direction, startTime, route["transit"]["num_stops"], getTotalNumberOfStops(route["transit"]["line"]["short_name"],direction), porprotion);
        }
    }
    return Math.ceil((forecastTravelTime+walkingTime)/60);
}


function getDirection(line, departure, arrival){
    //console.log("departure stop: "+departure);
    var departureStop = ""+departure.replace(/[^0-9.]/g, "");
    var arrivalStop = ""+arrival.replace(/[^0-9.]/g, "");
    var bound="";
    $.ajax({
        url: "./data/stops/",
        async: false,
        dataType: "json",
        success: function(json){
            if(line in json){
                if((jQuery.inArray(departureStop,json[line]["outbound"]) !== -1) || (jQuery.inArray(arrivalStop,json[line]["outbound"]) !== -1)){
                    bound= "outbound";
                }
                else if((jQuery.inArray(departureStop,json[line]["inbound"]) !== -1) || (jQuery.inArray(arrivalStop,json[line]["inbound"]) !== -1)){
                    bound= "inbound";
                }
                else{
                    bound ="noMatch";
                }
            } 
            else{
                bound="noMatch";
            }
        },
        error: function(){
            console.log("/data/stops/ didn't find");
        }
    })
    return bound;
}



// pass in the route number and the direction, get the total number of the stops of this route

function getTotalNumberOfStops(line, direction){
    console.log("direction: "+direction+"line: "+line);
    var totalNumberOfStops = 0
    $.ajax({
        url: "./data/stops/",
        async: false,
        dataType: "json",
        success: function(json){
            if(line in json){
                if (direction === "inbound" || direction === "outbound"){
                    totalNumberOfStops = json[line][direction].length;
            }
                else{
                    console.log("no direction is found, direction: "+direction);
                    totalNumberOfStops = "notFoundTotalStopNumbers"
            } 
        }
            else{
                console.log("didn't find the line id "+line+" in the dataset of 2018, direction: "+direction);
                totalNumberOfStops = "notFoundTotalStopNumbers";
            }
        }
    })
    console.log(totalNumberOfStops);
    return totalNumberOfStops;

}

function getStopPorprotion(line, startStop, destStop, direction){
    stopPorprotion = 0;
    var start_Stop = ""+startStop.replace(/[^0-9.]/g, "");
    var dest_Stop = ""+destStop.replace(/[^0-9.]/g, "");
    $.ajax({
        url: "./data/travelTimeProportion/",
        async: false,
        dataType: "json",
        success: function(json){
            if(line in json){
                if (direction === "inbound" || direction === "outbound"){
                    if(start_Stop in json[line][direction] && dest_Stop in json[line][direction]){
                        stopPorprotion = json[line][direction][dest_Stop]-json[line][direction][start_Stop];
                    }
                    else{
                        console.log("line: "+line+", direction: "+direction+", missing start stop or destination stop or both, startStop: "+start_Stop+", destStop: "+dest_Stop);
                        stopPorprotion = "noPorprotionFound";
                    }
            }
                else{
                    console.log("no direction is found, direction: "+direction);
                    stopPorprotion = "noPorprotionFound";
            } 
        }
            else{
                console.log("didn't find the line id "+line+" in the dataset of 2018, direction: "+direction);
                stopPorprotion = "noPorprotionFound";
            }
        }
    })
    return stopPorprotion;
}



// return the forecast travel time for each trip
function travelTime(route, direction, departureTime, numOfStops, totalNumOfStops, porprotion){
    //console.log("the direction in the travelTime is: "+direction);
    var timePrediction=0;
    // if can't find the direction of this trip from the data set, just return the result of google map.
    if(direction === ""){
        console.log("no direction is found, will return the result from the google map")
        console.log("didn't forecast, return from the map");
        return route["duration"]["value"];
    }
    // if the user didn't select a travel time, then the departure time will be set to default.
    if(isNaN(departureTime)){
        console.log("the departure time is not selected");
        departureTime=Date.now();
    }
    if(totalNumOfStops === "notFoundTotalStopNumbers"){
        console.log("didn't forecast, return from the map");
        return route["duration"]["value"];
    }
    // if the selected travel time is out of the range, then return the trip time from the Google map.
    if(departureTime > Date.now()+345600000){
        console.log("The selected time is out of the time range.");
        console.log("didn't forecast, return from the map");
        return route["duration"]["value"];
    }
    var line_id = route["transit"]["line"]["short_name"];
    
    let url = "prediction/";
    url += line_id +"/";
    url += direction +"/";
    url += departureTime +"/";

    $.ajax({
        url: url,
        type: "GET",
        async: false,
        dataType: "json",
        success: (data) => {
        timePrediction = data.time_prediction
        console.log("forecasting.....");
        },
        error: (error) => { 
        console.log(error);
        }
    });
    if(porprotion != "noPorprotionFound"){
        console.log("returning the porprotion based result, porprotion: "+porprotion);
        return timePrediction*porprotion;
    }
    console.log("returning the stop number based result");
    return timePrediction*(numOfStops/totalNumOfStops);
}


// refer from https://developers.google.com/maps/documentation/javascript/directions?hl=en#TravelModes
function calcRoute(directionsService, directionsRenderer, map) {
    var originString = $("#search_start").val();
    var destString = $("#search_destination").val();
    var startTime = $("#time_of_travel").val();
    var mydate = new Date(startTime);
    var resultTime = mydate.getTime();// in form of timestamp
    currentTime = new Date().getTime();
    console.log("startTime: "+startTime);
    console.log("new date:  "+new Date());
    console.log("resultTime: "+resultTime);
    console.log("currenttime:"+currentTime);
    var request = {
        origin: originString, // start location, now is ucd
        destination: destString, // end location, now is temple bar
        travelMode: "TRANSIT", // -> public transport
        transitOptions: {
            departureTime: new Date(resultTime), //Epoch time in miliseconds, now this value stands for 27th June 16:24
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

            var service = new google.maps.DistanceMatrixService();
            let myPromise = new Promise(function(myResolve, myReject) {
                service.getDistanceMatrix(
                {
                    origins: [originString],
                    destinations: [destString],
                    travelMode: 'DRIVING',
                  },(response, status) =>{
                    if(status =="OK"){
                        carDrivingDistance = response["rows"][0]["elements"][0]["distance"]["value"];
                        console.log("car in function " + carDrivingDistance);
            }
            if(carDrivingDistance > 0){
                myResolve(carDrivingDistance)
            }
            else {
                myReject("error")
            }
        });
    });

            console.log(result["routes"]);
            // display all the possible routes on the map in different colors
            const directionRenderers = renderDirections(result, map);

            // total number of possible routes
            var totalNumberOfRoutes = result["routes"].length// total number of routes
            $(".busInfo").show();
            $(".searchbar").hide();
            let busRouteDistances = []
            // for all the suggested ways(routes) the google map provides:
            for(let route = 0; route < totalNumberOfRoutes; route++){
                //console.log(result["routes"][route]);
                if (result["routes"][route]["legs"][0]["steps"].length < 2){
                    busRouteDistances.push(busDrivingDistance);
                    continue;
                }
                var busRoutes = getBusInfo(result["routes"][route]); // an array of routes(transfer) or a route(one go)
                // if no need to transfer a bus, only one key will be in this dict
                var busNumString = "";
                var busArrivingString="";
                var busDrivingDistance=0;
                var walkingTime=0;
        
                for(const r of busRoutes) {
                    const routeNumber = Object.keys(r);
                    if(routeNumber[0] === "walkingTime"){
                        walkingTime = r["walkingTime"];
                        //console.log("in isNaN, walking time of this option is "+walkingTime);
                    }
                    else{
                        busNumString = busNumString+routeNumber+" -> ";
                        busArrivingString=busArrivingString+r[routeNumber]["arriving_time"]+" -> ";
                        busDrivingDistance=busDrivingDistance+r[routeNumber]["driving_distance"];
                        
                    }
                }
                var new_age = $("input.age:checked").val();
                busRouteDistances.push(busDrivingDistance);
                busNumString = busNumString.slice(0, -3);
                busArrivingString = busArrivingString.slice(0, -4);

                
                $(".busInfo-items-container").append("<div class = 'busInfo-item'>\
                                        <p class = 'busHeader'>"+"Bus: "+busNumString+"<button class='selectRoute btn btn-light' id='selectBtn'>Select</button></p>\
                                        <p class = 'busDetail'>Arrival time: <span class ='keyValue'>"+ busArrivingString+"</span></p>\
                                        <p class = 'busDetail' id = 'forecastTime'>Travel time: <i class='fas fa-spinner fa-pulse' id = 'spinner' style='font-color: white;'></i> </p>\
                                        <p class = 'busDetail' id = 'carbonEmissionSaved'>CO2 saved: <span class ='keyValue carbon-" + route +"'><i class='fas fa-spinner fa-pulse' id='spinner-co2' style='color: white;'></i></span></p>\
                                        <p class = 'busDetail'> Bus fare: <span class ='keyValue'>"+getBusFare(busRoutes, new_age)+"</span></p></div>");

                $("#selectBtn").attr("id", "selectBtn"+route);
                $("#forecastTime").attr("id", route);
                $("#spinner").attr("id", "spinner"+route);
                $(".fas").css("color", "white");
                displayTheForecastTime(route, result["routes"][route], walkingTime, resultTime).then(function(value){
                $("#spinner"+route).css("display", "none");
                });

                myPromise.then(
                    
                    function(value) {
                        $("#spinner-co2").hide()
                        changeEmissionInfo(route, busRouteDistances[route], value);
                    },
                    function(error){console.log(error)}
                );
        
            }
            
            var selectedRoute=[];//each time select button is clicked, this var will be refreshed.
            var confirmedRoute=[];// ------> this is the final confirmed route the user has selected.
        
            //confirm button confirms the route selected
            $(".busInfo-controls-container").append("<button type='button' id='confirm' class='btn btn-dark btn-sm'>Confirm</button>");
            $("#confirm").css("display", "inline-block");

            //add a back button, go back to the search bar
            $(".busInfo-controls-container").append("<button type='button' id='backToSearch' class='btn btn-dark btn-sm'>Back</button>");
            //error alert
            $(".busInfo").append("<div class='alert-info'> Please select a route first.</div>");
        
            //select button selects route and renders the related route on the  map
            // and get the selected route, when clicking the confirm button, the last selected route will be stored in the confirmRoute;
            $(".selectRoute").mousedown(function(){
                //var stringToArray = $(this).parent().text().match(/\b(\w+)\b/g);
                //var busIndex = stringToArray[2]-1;//extracting the route index

                var busIndex = $(this).attr("id").slice(-1);
                console.log("this "+$(this));
                //console.log($(this).parent());
                console.log(busIndex);
            
                // only show the selected route
                //1. disable all the routes
                for (let stroke = 0; stroke < directionRenderers.length; stroke++){
                    directionRenderers[stroke].setOptions({map:null, directions: result, routeIndex:stroke});
                }
                //2. show the corresponding route
                directionRenderers[busIndex].setMap(map);
                //console.log("directionRander"+busIndex);

                // get the selected route
                selectedRoute=getBusInfo(result["routes"][busIndex]);

                $(".selectRoute").css("background-color","white");
                $(".selectRoute").css("color", "black");

                $(this).css("background-color","green");
                $(this).css("color", "white");

            })

            //confirm button confirms the route selected, and use the route array to calculate the co2 and set the notiffication
            $("#confirm").click(function(){
                if(selectedRoute.length === 0){
                    // $(".alert-info").css("display", "block");
                    alertUser("error", "Please select a route first.", false)
                }else{
                    $(".alert-info").css("display", "none");
                    confirmedRoute=selectedRoute;// confirmedRoute will be the last clicked route
                    var busDrivingDistance=0;// the bus drving distance
                    var counter = 0
                    for (var r of confirmedRoute){
                        if (counter != confirmedRoute.length - 1){
                            console.log(confirmedRoute.length)
                            counter++;
                            var routeNumber = Object.keys(r);
                            busDrivingDistance=busDrivingDistance+r[routeNumber[0]]["driving_distance"];
                        }
                    }

                    postCO2(busDrivingDistance, carDrivingDistance);

                    var theFirstBusString = Object.keys(confirmedRoute[0])[0];
                    var arrivalTimestamp = confirmedRoute[0][theFirstBusString]["arrivalTimestamp"].getTime()
                    sendNotificaiton(arrivalTimestamp, theFirstBusString);

                }
            });

            //when back is clicked, clear the map and render the new results on it.
            $("#backToSearch").click(function(){
                for (let stroke = 0; stroke < directionRenderers.length; stroke++){
                    directionRenderers[stroke].setOptions({map:null});
                }// clear the previous map render

                $(".busInfo-items-container").empty();//clear all the child element, so user can search again
                $(".busInfo-controls-container").empty();
                $(".searchbar").css("display", "block");//show the searchbar
                $(".busInfo").hide();
                $(".searchbar").show();

                //clear the forms in the search bar
                $("#search_start").val("");
                $("#search_destination").val("");

                //clear the confirmed route
                confirmedRoute = [];
            });

            /* the bus fare calculation */
            
            $("#adult").click(function(){
                if(getBusFare(confirmedRoute, "adult") != 0){
                    const money=getBusFare(confirmedRoute, "adult");
                    $(".answerContent").text(" ");
                    $(".answerContent").text("Your bus fare for this trip is "+money);
                }else{
                    $(".answerContent").text(" ");
                    $(".answerContent").text("Please select a route first.");
                }
            })
        
            $("#student").click(function(){
                if(getBusFare(confirmedRoute, "student") != 0){
                    console.log("gaga"+getBusFare(confirmedRoute, "student"));
                    const money=getBusFare(confirmedRoute, "student");
                    $(".answerContent").text(" ");
                    $(".answerContent").text("Your bus fare for this trip is "+money);
                }else{
                    $(".answerContent").text(" ");
                    $(".answerContent").text("Please select a route first.");
                }
                })
            $("#child").click(function(){
                if(getBusFare(confirmedRoute, "child") != 0){
                    const money=getBusFare(confirmedRoute, "child");
                    $(".answerContent").text(" ");
                    $(".answerContent").text("Your bus fare for this trip is "+money);
                }else{
                    $(".answerContent").text(" ");
                    $(".answerContent").text("Please select a route first.");
                }
                })
        }
        else{
            $(".searchbar").show();
            alertUser("ERROR", "No route found!", false)
            
        }
        });
 
        
}
function displayTheForecastTime(theRouteId, route, walkingTime, resultTime, startStop, destStop){
    return new Promise(function(resolve, reject){
        setTimeout(function(){resolve($("#"+theRouteId).append("<span class ='keyValue'>"+getForecastTravelTime(route, walkingTime, resultTime, startStop, destStop)+" minutes</span>"))}, 0);
    })
    
    //console.log(theRoute);
}


function changeEmissionInfo(infoClass, bus, car){
    //console.log("bus" + bus)
    //console.log("car " + car)
    //console.log(infoClass)
    $(".carbon-" + infoClass).text(calculateCo2(bus, car) + "kgs")
}
//
//https://stackoverflow.com/questions/35050401/display-multiple-routes-between-two-points-on-google-maps
//display more than one routes on the map
//https://stackoverflow.com/questions/2466215/google-maps-api-directionsrendereroptions-not-working

// Get users location
//https://www.w3schools.com/html/html5_geolocation.asp

/* Calculate co2 savings */

function calculateCo2(busDistance, carDisstance){
    var carEmission = (carDisstance / 1000) * .17152;
    var busEmission =  (busDistance / 1000) * .10391;
    var saved = (carEmission - busEmission).toFixed(2)
    return saved

}
window.initMap = initMap;

/* GET BUS FARE */
// age can be
function getBusFare(confirmed, age){
    if(confirmed.length!=0){
        /* get the number of times of recharging the bus fare when tap the card because the travle time is more than 90 min */
        var accumulatetravelTime=0; // the travel time of all the buses routes taken in the previous bus trip in a transfer case
        var distance = 0;
        var recharge=0;
        for(const route of confirmed){
            const routeNumber = Object.keys(route);
            if(accumulatetravelTime === 0 && route[routeNumber]["driving_distance"] < 2000/3){
                distance= distance+1;
            }
            accumulatetravelTime = accumulatetravelTime + route[routeNumber]["travel_time"];
            //console.log("travelTime"+accumulatetravelTime);
            if(accumulatetravelTime >= 5400){
                recharge = recharge+1; // times of respend money because 90 min is passsed
                accumulatetravelTime = 0;//record the time from the start
            }
        }
        if(age === "adult"){
            return (2*(1+recharge-distance)+distance*1.3)+" \u20AC";
        }if(age === "student"){
            return (1*(1+recharge-distance)+distance*0.65)+" \u20AC";
        }if(age === "child"){
            return (0.65*(1+recharge-distance)+distance*0.65)+" \u20AC";
        }
    }
    else{
        return 0;
    }
}
  
/* GET CURRENT LOCATION FUNCTIONALITY */

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else { 
    console.log("Geolocation is not supported by this browser.")
  }
}

function showPosition(position) {
    //console.log("Latitude: " + position.coords.latitude + 
  //"Longitude: " + position.coords.longitude);
    var position = position.coords.latitude + ", " + position.coords.longitude;
  $("#search_start").val(position);
}


/* GETTING UP TO DATE CO2 INFORMATION */

function updateEmissions(){
    $.get("carbon/get/", function(data, status){
        if (data["co2_saved"] == 0){
            $(".co2-saved").html("No savings yet, take a trip and save some emissions!");
        }
        else {
            $(".co2-saved").html(data["co2_saved"] + " kgs of co<sub>2</sub> saved!");
        }
    })
}

function updateNotifications(){
    $.get("update_notifications", function(data, status){
        if (data["notificationOnOff"] == true){
            $("#notify-box").prop("checked", true);
            console.log(data["notificationOnOff"])
            
        } else {
            $("#notify-box").prop("checked", false);
            console.log(data["notificationOnOff"])
        }
        $("option:selected").prop("selected", false);
        if (data["delay"] == 5){
            $("#five").prop("selected", true);
        } else if (data["delay"] == 10){
            $("#ten").prop("selected", true);
        } else if (data["delay"] == 15){
            $("#fifteen").prop("selected", true);
        }else if (data["delay"] == 30){
            $("#thirty").prop("selected", true);
        }

        $("#user-email").text(data["email"])
        $("#" + data["age"]).prop("checked", true);
    })
}
updateNotifications();
updateEmissions();
// $.get("carbon/get/", function(data, status){
//     $(".co2-saved").text(data["co2_saved"] + " grams of co2.")
// })

// !!!! Temporarily commented out because it threw an Server 500 error - JS
// updateEmissions()

/* FUNCTION FOR POST REQUEST TO ADD CO2 INFORMATION */
function postCO2(busDistance, drivingDistance){
    $.post("carbon/", {'driving_distance': drivingDistance, "bus_distance": busDistance}).done(function(response){
        alertUser("Success", "Your trip has been added to your emmisions saved", true)
    }).then(function(){
        updateEmissions()
    })
}

/* AUTHENTICATION */

$("#login-button").click(function(){
    var emailField = document.getElementById("login-email")
    if (!emailField.checkValidity()){
        $("#login-email-validation-text").text("Please enter a valid email.")
        $("#login-email-validation-text").css({ 'color': 'red'});
        $("#login-email-validation-text").show()
    } else {
        $("#login-email-validation-text").hide()
        let cookie = document.cookie
        let csrfToken = cookie.substring(cookie.indexOf('=') + 1)
        var registerData = {
            userEmail: $("#login-email").val(),
            userPassword: $("#login-password").val()
        }
        $.ajax({
            type: "POST",
            url: "login",
            data: registerData,
            dataType: "json",
            encode: true,
            headers: {
                'X-CSRFToken': csrfToken
            },
            success: function(msg) {
                alertUser("Success", "You are logged in.", true)
            },
            "statusCode": {
                401: function (xhr, error, thrown) {
                alertUser("Error", "Incorrect email or password.", false)
                }
            }
        }).then(function(){
            $("#not-auth").hide();
            $("#auth").show();

            $(".logout").show()
            $(".login").hide()

            updateEmissions();
            updateNotifications();
            $("#login-email").val("")
            $("#login-password").val("")
            

        })

    }
    
})

$("#register-button").click(function(){
    var emailField = document.getElementById("register-email")
    if (!emailField.checkValidity()){
        $("#register-email-validation-text").text("Please enter a valid email.")
        $("#register-email-validation-text").css({ 'color': 'red'});
        $("#register-email-validation-text").show()
    }
    else if ($("#register-password").val() == $("#confirm-register-password").val()){
        $("#register-email-validation-text").hide()
        $("#password-validation-text").hide()
        let cookie = document.cookie
        let csrfToken = cookie.substring(cookie.indexOf('=') + 1)
        var registerData = {
            userEmail: $("#register-email").val(),
            userPassword: $("#register-password").val()
        }
        $.ajax({
            type: "POST",
            url: "register",
            data: registerData,
            dataType: "json",
            encode: true,
            headers: {
                'X-CSRFToken': csrfToken
            },
            success: function(msg) {
                alertUser("Success", "You are logged in!", true)
            },
            "statusCode": {
                401: function (xhr, error, thrown) {
                alertUser("Woops" + "Email already exists on our system and password is incorrect.", false)
                }
            }
        }).then(function(){
            $("#not-auth").hide();
            $("#auth").show();
            $(".logout").show()
            $(".register").hide()
            updateEmissions();
            updateNotifications();
            $("#register-email").val("")
            $("#register-password").val("")
            $("#confirm-register-password").val("")
        })
} else {
    $("#password-validation-text").text("Passwords do not match.")
    $("#password-validation-text").css({ 'color': 'red'});
    $("#password-validation-text").show()
}})

$("#logout-button").click(function(){
    $.ajax({
        type: "GET",
        url: "logout",
        dataType: 'json',
        headers: {
            'X-CSRFToken': csrfToken
        },
        success: function(msg) {
            alertUser("Success", "You have logged out!", true)
        },
        
    }).then(function(){
        $("#not-auth").show();
        $("#auth").hide();
        $(".logout").hide()
        $(".login").show()
        updateEmissions()
        $("#adult").prop("checked", true);
        
    })
})

/* CHANGING THE PAGE DEPENDING OF IN THE USER WANTS TO LOGIN OR REGISTER  */ 
$("#login-to-reg").click(function(){
    $(".register").show()
    $(".login").hide()
})


$("#reg-to-login").click(function(){
    $(".register").hide()
    $(".login").show()
})


/* DELETE ACCOUNT FUNCTIONALITY */
$("#delete-button").click(function(){
    let confirmAction = confirm("Are you sure you want to delete your account with us?")
    if (confirmAction){
        $.ajax({
            type: "GET",
            url: "delete",
            dataType: 'json',
            headers: {
                'X-CSRFToken': csrfToken
            },
            success: function(msg) {
                alertUser("Success", "Account is deleted!", true)
            },
            "statusCode": {
                404: function (xhr, error, thrown) {
                alertUser("Woops", "Account not found.", false)
                }
            }
        }).then(function(){
            $("#not-auth").show();
            $("#auth").hide();
            $(".logout").hide()
            $(".login").show()
            updateEmissions() 
        })
    }
    else {
        alertUser("Woops", "Account not deleted.", false)
    }
})

// Notification.requestPermission().then(function(result) {
//     if (result == "granted"){
//         const text = 'HEY! Your task  is now overdue.';
//         const notification = new Notification('To do list', { body: text });
//     }
//   });

// function newNotification(bus, interval){
//     const text = "The " + bus + " bus is " + interval +" Minutes away from your stop!";
//     const notification = new Notification('To do list', { body: text });
// }

// newNotification(15, 5)

function sendNotificaiton(time, bus){
    let cookie = document.cookie
    let csrfToken = cookie.substring(cookie.indexOf('=') + 1)
    var chosenRoute = {
        bus: bus ,
        time: time,
    }
        $.ajax({
            type: "POST",
            url: "add-notification",
            data: chosenRoute,
            dataType: "json",
            encode: true,
            headers: {
                'X-CSRFToken': csrfToken
            },
            // success: function(msg) {
            //     alertUser("SUCCESS", "")
            // },
            // "statusCode": {
            //     404: function (xhr, error, thrown) {
            //     alertUser("Account not found.")
            //     }
            // }
        }).then(function(){
           console.log("success?")
        })
}


// NOTIFICATION CHECKBOX FUNCTIONALITY
$("#notify-box").change(function() {
    $.ajax({
        type: "GET",
        url: "change_notification_settings",
        success: function(msg) {
            alertUser("Success", "Notification preference changed", true)
        },
        "statusCode": {
            401: function (xhr, error, thrown) {
            alertUser("error", "", false)
            }
        }
    })
});

// NOTIFICATION DELAY CHANGE

$("#change-notification-delay").change(function() {
    let cookie = document.cookie
    let csrfToken = cookie.substring(cookie.indexOf('=') + 1)
    var newDelay = {
        delay: $('#change-notification-delay').find(":selected").text(),
    }

    $.ajax({
        type: "POST",
        url: "change_delay",
        data: newDelay,
        dataType: "json",
        encode: true,
        headers: {
            'X-CSRFToken': csrfToken
        },
        success: function(msg) {
            alertUser("Success", "Notification preference changed", true)
        },
        "statusCode": {
            401: function (xhr, error, thrown) {
            alertUser("Error", "Not Authorized", false)
            }
        }
    }).then(function(){
       console.log("delay changed")
    })
});


/* CHANGE AGE */

$("input.age").on("change click", function(){
    let cookie = document.cookie
    let csrfToken = cookie.substring(cookie.indexOf('=') + 1)
    var new_age = $("input.age:checked").val()
    var data = {
        age: new_age
    }
    $.ajax({
        type: "POST",
        url: "update_age",
        data: data,
        dataType: "json",
        encode: true,
        headers: {
            'X-CSRFToken': csrfToken
        },
        success: function(msg) {
            console.log("age changed to: " + new_age )
        },
    }) 
    })

/* PASSWORD SHOW */

$("#login-pwd-show").mousedown(function(){
    if ($("#login-password").attr("type") == "text"){
        $("#login-pwd-show").removeClass("fa-eye-slash")
        $("#login-pwd-show").addClass("fa-eye")

        $("#login-password").attr('type', 'password'); 
    }
    else{
        $("#login-password").attr('type', 'text'); 
        $("#login-pwd-show").addClass("fa-eye-slash")
        $("#login-pwd-show").removeClass("fa-eye")

    }
})

$("#register-pwd-show").mousedown(function(){
    if ($("#register-password").attr("type") == "text"){
        $("#register-pwd-show").removeClass("fa-eye-slash")
        $("#register-pwd-show").addClass("fa-eye")
        $("#register-password").attr('type', 'password'); 
    }
    else{
        $("#register-pwd-show").addClass("fa-eye-slash")
        $("#register-pwd-show").removeClass("fa-eye")
        $("#register-password").attr('type', 'text'); 

    }
})

$("#alert").hide();

function alertUser(title, message, isSuccess){
    var alert = $("#alert")
    if (isSuccess){
        alert.removeClass("alert-danger")
        alert.addClass("alert-success")
        
    }
    else {
        alert.removeClass("alert-success")
        alert.addClass("alert-danger")
    }

    var fullMessage = "<span style='text-transform:uppercase;'>" + title + ":</span> " + message;
    alert.html(fullMessage)
    alert.fadeIn(300)
    setTimeout(
        function() 
        {
            alert.fadeOut(1000)
        }, 4000);
}

