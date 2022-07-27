
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
    document.getElementById("btn").addEventListener('click', event =>{
        $(".loadingAnimation").css("display", "block");
        $("#totalTravelTime").ready(function(){
            $(".loadingAnimation").css("display", "none");
            console.log("the page is loaded");
        })
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
function getBusInfo(routes, startTime){
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
    console.log(option);
    var forecastTravelTime = 0;
    var trip = option["legs"][0]["steps"];
    for(const route of trip){
        if(route["transit"] !== undefined){
            var direction = getDirection(route["transit"]["line"]["short_name"],route["transit"]["departure_stop"]["name"], route["transit"]["arrival_stop"]["name"]);        
            forecastTravelTime = forecastTravelTime + travelTime(route, direction, startTime, route["transit"]["num_stops"], getTotalNumberOfStops(route["transit"]["line"]["short_name"], direction));
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
        url: "./data",
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
        }
    })
    return bound;
}



// pass in the route number and the direction, get the total number of the stops of this route

function getTotalNumberOfStops(line, direction){
    console.log("direction: "+direction+"line: "+line);
    var totalNumberOfRoutes = 0
    $.ajax({
        url: "./data",
        async: false,
        dataType: "json",
        success: function(json){
            if(line in json){
                if (direction === "inbound" || direction === "outbound"){
                    totalNumberOfRoutes = json[line][direction].length;
            }
                else{
                    console.log("no direction is found, direction: "+direction);
                    totalNumberOfRoutes = "notFoundTotalStopNumbers"
            } 
        }
            else{
                console.log("didn't find the line id "+line+" in the dataset of 2018, direction: "+direction);
                totalNumberOfRoutes = "notFoundTotalStopNumbers";
            }
        }
    })
    console.log(totalNumberOfRoutes);
    return totalNumberOfRoutes;

}

// return the forecast travel time for each trip
function travelTime(route, direction, departureTime, numOfStops, totalNumOfStops){
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
    
    return timePrediction*(numOfStops/totalNumOfStops);
}


// refer from https://developers.google.com/maps/documentation/javascript/directions?hl=en#TravelModes
function calcRoute(directionsService, directionsRenderer, map) {
    var originString = $("#search_start").val();
    var destString = $("#search_destination").val();
    var startTime = $("#time_of_travel").val();

    var mydate = new Date(startTime);
    var resultTime = mydate.getTime();// in form of timestamp
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
                        console.log(response)
                        console.log("car in function " + carDrivingDistance)
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
                    continue;
                }
                var busRoutes = getBusInfo(result["routes"][route], resultTime); // an array of routes(transfer) or a route(one go)
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
                        busArrivingString=busArrivingString+r[routeNumber]["arriving_time"]+"; ";
                        busDrivingDistance=busDrivingDistance+r[routeNumber]["driving_distance"];
                        
                    }
                }
                busRouteDistances.push(busDrivingDistance);
                busNumString = busNumString.slice(0, -3);
                busArrivingString = busArrivingString.slice(0, -2);
                
                $(".busInfo").append("<div class = 'oneBus'>\
                                        <p class = 'busHeader'>"+"Bus route "+(route+1)+": "+busNumString+"<button class='selectRoute'>Select</button></p>\
                                        <p class = 'busDetail'>Arriving time: <span class ='keyValue'>"+ busArrivingString+"</span></p>\
                                        <p class = 'busDetail' id = 'forecastTime'>Total travel time: </p>\
                                        <p class = 'busDetail'>Carbon emission saved: <span class ='keyValue'></span></p>\
                                        <p class = 'busDetail'> The bus fare is: <span class ='keyValue'>"+getBusFare(busRoutes, "adult")+"</span></p></div>")// Hi Daniel, the second parameter of the getBusFare() function is the age, age is a string and can be one of "adult", "student" or "child".
                $("#forecastTime").attr("id", route);
                displayTheForecastTime(route, result["routes"][route], walkingTime, resultTime);
            }
            
            var selectedRoute=[];//each time select button is clicked, this var will be refreshed.
            var confirmedRoute=[];// ------> this is the final confirmed route the user has selected.
        
            //confirm button confirms the route selected
            $(".busInfo").append("<button type='button' id='confirm' class='btn btn-dark btn-sm'>Confirm</button>");
            $("#confirm").css("display", "inline-block");

            //add a back button, go back to the search bar
            $(".busInfo").append("<button type='button' id='busInfoBtn' class='btn btn-dark btn-sm'>Back</button>");
            //error alert
            $(".busInfo").append("<div class='alert'> Please select a route first.</div>");
        
            //select button selects route and renders the related route on the  map
            // and get the selected route, when clicking the confirm button, the last selected route will be stored in the confirmRoute;
            $(".selectRoute").mousedown(function(){
                var stringToArray = $(this).parent().text().match(/\b(\w+)\b/g);
                var busIndex = stringToArray[2]-1;//extracting the route index

            
                // only show the selected route
                //1. disable all the routes
                for (let stroke = 0; stroke < directionRenderers.length; stroke++){
                    directionRenderers[stroke].setOptions({map:null, directions: result, routeIndex:stroke});
                }
                //2. show the corresponding route
                directionRenderers[busIndex].setMap(map);

                // get the selected route
                selectedRoute=getBusInfo(result["routes"][busIndex], resultTime);

                $(".selectRoute").css("background-color","white");
                $(".selectRoute").css("color", "black");

                $(this).css("background-color","green");
                $(this).css("color", "white");

            })

            //confirm button confirms the route selected, and use the route array to calculate the co2 and set the notiffication
            $("#confirm").click(function(){
                if(selectedRoute.length === 0){
                    $(".alert").css("display", "block");
                }else{
                    $(".alert").css("display", "none");
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
            $("#busInfoBtn").click(function(){
                for (let stroke = 0; stroke < directionRenderers.length; stroke++){
                    directionRenderers[stroke].setOptions({map:null});
                }// clear the previous map render
                $(".busInfo").empty();//clear all the child element, so user can search again
                $(".searchbar").css("display", "block");//show the searchbar
                $(".busInfo").hide();
                $(".searchbar").show();
            });

            /* the bus fare calculation */
            
            $("#inlineRadio1").click(function(){
                if(getBusFare(confirmedRoute, "adult") != 0){
                    const money=getBusFare(confirmedRoute, "adult");
                    $(".answerContent").text(" ");
                    $(".answerContent").text("Your bus fare for this trip is "+money);
                }else{
                    $(".answerContent").text(" ");
                    $(".answerContent").text("Please select a route first.");
                }
            })
        
            $("#inlineRadio2").click(function(){
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
            $("#inlineRadio3").click(function(){
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
            console.log(status);
        }
        });
 
        
}
function displayTheForecastTime(theRouteId, route, walkingTime, resultTime){
    setTimeout(function(){$("#"+theRouteId).append("<span class ='keyValue'>"+getForecastTravelTime(route, walkingTime, resultTime)+" minutes</span>")}, 0);
    //console.log(theRoute);
}

function changeEmissionInfo(infoClass, bus, car){
    console.log("bus" + bus)
    console.log("car " + car)
    console.log(infoClass)
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
            $(".co2-saved").html("No savings yet, take a trip and save some emissions!")
        }
        else {
            $(".co2-saved").html(data["co2_saved"] + " kgs of co<sub>2</sub> saved!")
        }
    })
}
updateEmissions()
// $.get("carbon/get/", function(data, status){
//     $(".co2-saved").text(data["co2_saved"] + " grams of co2.")
// })

// !!!! Temporarily commented out because it threw an Server 500 error - JS
// updateEmissions()

/* FUNCTION FOR POST REQUEST TO ADD CO2 INFORMATION */
function postCO2(busDistance, drivingDistance){
    $.post("carbon/", {'driving_distance': drivingDistance, "bus_distance": busDistance}).done(function(response){
        alert("Your trip has been added to your emmisions saved")
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
                alert("You have suvccfully logged in :) .")
            },
            "statusCode": {
                401: function (xhr, error, thrown) {
                alert("Email or Password Incorrect")
                }
            }
        }).then(function(){
            $("#not-auth").hide();
            $("#auth").show();

            $(".logout").show()
            $(".login").hide()
            updateEmissions()
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
                alert("You have successfully registered and been logged in. ")
            },
            "statusCode": {
                401: function (xhr, error, thrown) {
                alert("Email already exists on our system and password is incorrect.")
                }
            }
        }).then(function(){
            $("#not-auth").hide();
            $("#auth").show();
            $(".logout").show()
            $(".register").hide()
            updateEmissions()
        })
} else {
    $("#password-validation-text").text("Passwords do not match.")
    $("#password-validation-text").css({ 'color': 'red'});
    $("#password-validation-text").show()
}})

$("#logout-button").click(function(){
    console.log("clicked")
    $.ajax({
        type: "GET",
        url: "logout",
        dataType: 'json',
        headers: {
            'X-CSRFToken': csrfToken
        },
        success: function(msg) {
            alert("You have successfully logged out.")
        },
        
    }).then(function(){
        $("#not-auth").show();
        $("#auth").hide();
        $(".logout").hide()
        $(".login").show()
        updateEmissions()
        
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
                alert("Account is deleted!")
            },
            "statusCode": {
                404: function (xhr, error, thrown) {
                alert("Account not found.")
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
        alert("Account not deleted.")
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
            success: function(msg) {
                alert("SUCCESS")
            },
            "statusCode": {
                404: function (xhr, error, thrown) {
                alert("Account not found.")
                }
            }
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
            alert("Settings changed")
        },
        "statusCode": {
            401: function (xhr, error, thrown) {
            alert("error." + error)
            }
        }
    }).then(function(){
       console.log("setting changed")
    })
});

// NOTIFICATION DELAY CHANGE

$("#change-notification-delay").change(function() {
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
            alert("SUCCESS")
        },
        "statusCode": {
            401: function (xhr, error, thrown) {
            alert("Not Authorized")
            }
        }
    }).then(function(){
       console.log("delay changed")
    })
});
