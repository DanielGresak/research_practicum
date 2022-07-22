
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
        $(".busInfo").css("display", "inline");
        calcRoute(directionsService, directionsRenderer, map);
        $(".searchbar").css("display", "none");
    });
    
}

/* DIRECTIONS FUNCTIONALITY */

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

// so the structure of this array is like [{47:{}}, {36:{}}..], the length of the array is the number of bus need to transfer
// the bus route details dict contains the: arriving time of this bus, the draving distance, the headsign (last stop on this route) of this bus
// and the number of stops this trip will cover.

// routes is from result["routes"][index]
function getBusInfo(routes, startTime){
    var busRoutes = [];
    var steps = routes["legs"][0]["steps"];
    var numberSteps = steps.length;
    for (let i = 0; i < numberSteps; i++){
        if (steps[i]["transit"] !== undefined){// find the steps for the bus instead of walking
            routeInfo={};
            thisRoute={};
            var direction = getDirection(steps[i]["transit"]["line"]["short_name"],steps[i]["transit"]["departure_stop"]["name"], steps[i]["transit"]["arrival_stop"]["name"]);
            routeInfo["arriving_time"]=steps[i]["transit"]["departure_time"]["text"];
            routeInfo["driving_distance"]=steps[i]["distance"]["value"];
            routeInfo["num_stops"]=steps[i]["transit"]["num_stops"];
            routeInfo["travel_time"]=steps[i]["duration"]["value"];// travel time in second.
            routeInfo["direction"]= direction;
            routeInfo["forecastTripTime"]=travelTime(steps[i], direction, startTime, steps[i]["transit"]["num_stops"], getTotalNumberOfStops());
            console.log("get the travel time is"+routeInfo["forecastTripTime"]);
            thisRoute[steps[i]["transit"]["line"]["short_name"]]=routeInfo;
            busRoutes.push(thisRoute);
        }
    }
    return busRoutes;
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
            } 
        }
    })
    return bound;
}

// pass in the route number and the direction, get the total number of the stops of this route

function getTotalNumberOfStops(route, directions){
    return 50;
}

// return the travel time of a bus route
function travelTime(route, direction, departureTime, numOfStops, totalNumOfStops){
    console.log("departuretime"+departureTime);
    var timePrediction=0;
    // if can't find the direction of this trip from the data set, just return the result of google map
    if(direction === ""){
        console.log("no direction is found, will return the result from the google map")
        return route["duration"]["value"];
    }
    if(departureTime==="NaN"){
        departureTime=Date.now();
    }
    var line_id = route["transit"]["line"]["short_name"];
    /* this is where we get the result from the model

     parameters data form: e.g.
     route: 46a
     direction: "inbound"
     startTime: 1658409120000
    
    */
    
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
        // check the console to see the data response as JSON
        console.log(data);
        // For example, retrieve the time prediction... 
        timePrediction = data.time_prediction
        console.log("timePredition: "+timePrediction);
        },
        error: (error) => { 
        console.log(error);
        }
    });
    console.log("the prediction time from the travelTime function is"+timePrediction*(numOfStops/totalNumOfStops));
    return timePrediction*(numOfStops/totalNumOfStops);
}


// refer from https://developers.google.com/maps/documentation/javascript/directions?hl=en#TravelModes
function calcRoute(directionsService, directionsRenderer, map) {
    var originString = $("#search_start").val();
    var destString = $("#search_destination").val();
    var startTime = $("#time_of_travel").val();

    var mydate = new Date(startTime);
    var resultTime = mydate.getTime();// in form of timestamp
    console.log(resultTime);
    console.log(startTime);
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
            console.log(result["routes"]);
            // display all the possible routes on the map in different colors
            const directionRenderers = renderDirections(result, map);

            // total number of possible routes
            var totalNumberOfRoutes = result["routes"].length// total number of routes
            $(".busInfo").show();
            $(".searchbar").hide();
        
            // for all the suggested ways(routes) the google map provides:
            for(let route = 0; route < totalNumberOfRoutes; route++){
                if (result["routes"][route]["legs"][0]["steps"].length < 2){
                    continue;
                }
                var busRoutes = getBusInfo(result["routes"][route], resultTime); // an array of routes(transfer) or a route(one go)
                // if no need to transfer a bus, only one key will be in this dict
                var busNumString = "";
                var busArrivingString="";
                var busTravelTime=0;
                var busDrivingDistance=0;

                for(const r of busRoutes) {
                    const routeNumber = Object.keys(r);
                    busNumString = busNumString+routeNumber+" -> ";
                    busArrivingString=busArrivingString+r[routeNumber]["arriving_time"]+"; ";
                    busDrivingDistance=busDrivingDistance+r[routeNumber]["driving_distance"];
                    busTravelTime=busTravelTime+r[routeNumber]["forecastTripTime"];
                    
                }

                busNumString = busNumString.slice(0, -3);
                busArrivingString = busArrivingString.slice(0, -2);    

                // add a bus info child window for every bus/route
                $(".busInfo").append("<div class = 'oneBus'>\
                                        <p class = 'busHeader'>"+"Bus route "+(route+1)+": "+busNumString+"<button class='selectRoute'>Select</button></p>\
                                        <p class = 'busDetail' id = 'arrivingTime'>Arriving time:<span class ='keyValue'>"+ busArrivingString+"</span></p>\
                                        <p class = 'busDetail' id = 'totalTravelTime'>Total travel time:<span class ='keyValue'>"+busTravelTime+"</span></p>\
                                        <p class = 'busDetail' id = 'busFare'>Bus fare: <span class ='keyValue'></span></p>\
                                        <p class = 'busDetail' id = 'carbonEmissionSaved'>Carbon emission saved: <span class ='keyValue'>:</span></p></div>")
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
                selectedRoute=getBusInfo(result["routes"][busIndex]);

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
                    var drivingDistance = getDrivingDistance(originString, destString);// this is the (car) driving distance
                    // calculate the total bus driving distance of the chosen trip plan
                    for (const r of confirmedRoute){
                        const routeNumber = Object.keys(r);
                        busDrivingDistance=busDrivingDistance+r[routeNumber]["driving_distance"];
                    }
                    console.log(confirmedRoute)

                    console.log("busDriving distance: "+busDrivingDistance);
                    console.log("driving distanceeee: "+ drivingDistance);
                    postCO2(busDrivingDistance);

                }
            });

            //when back is clicked, clear the map and render the new results on it.
            $("#busInfoBtn").click(function(){
                for (let stroke = 0; stroke < directionRenderers.length; stroke++){
                    directionRenderers[stroke].setOptions({map:null});
                }// clear the previous map render
                $(".busInfo").empty();//clear all the child element, so user can search again
                // $(".busInfo").css("display", "none");// hide the info bar
                $(".searchbar").css("display", "block");//show the searchbar
                $(".busInfo").hide();
                $(".searchbar").show();
            });

            /* the bus fare calculation */
            
            $("#inlineRadio1").click(function(){
                if(getBusFare[confirmedRoute] != []){
                    const recharge=getBusFare(confirmedRoute)[1];
                    var money = 2+2*recharge;
                    $(".answerContent").text(" ");
                    $(".answerContent").text("Your bus fare for this trip is "+money+" euro.");
                }
            })
        
            $("#inlineRadio2").click(function(){
                if(getBusFare[confirmedRoute] != []){
                    const recharge=getBusFare(confirmedRoute)[1];
                    var money = 1+1*recharge;
                    $(".answerContent").text(" ");
                    $(".answerContent").text("Your bus fare for this trip is "+money+ " euro.");
                }
                })
            $("#inlineRadio3").click(function(){
                if(getBusFare[confirmedRoute] != []){
                    const recharge=getBusFare(confirmedRoute)[1];
                    var money = 0.65+0.65*recharge;
                    $(".answerContent").text(" ");
                    $(".answerContent").text("Your bus fare for this trip is "+money +" euro.");
                }
                })
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

// Get users location
//https://www.w3schools.com/html/html5_geolocation.asp
window.initMap = initMap;

/* GET BUS FARE */
function getBusFare(confirmed){
    if(confirmed.length!=0){
        /* get the bus routes of the confirmed route*/
        var busNumString = "";
        for(const r of confirmed) {
            const routeNumber = Object.keys(r);
            busNumString = busNumString+routeNumber+"; ";
        }
        busNumString = busNumString.slice(0, -2);

        /* get the number of times of recharging the bus fare when tap the card because the travle time is more than 90 min */
        var travelTime=0; // the travel time of all the buses routes taken in the previous bus trip in a transfer case
        var recharge=0;
        for(const route of confirmed){
            const routeNumber = Object.keys(route);
            travelTime = travelTime + route[routeNumber]["travel_time"];
            console.log("travelTime"+travelTime);
            if(travelTime >= 5400){
                recharge = recharge+1; // times of respend money because 90 min is passsed
                travelTime = 0;//record the time from the start
            }
        }
        return [busNumString, recharge];
    }
    else{
        return [];
    }
}

/* Get Car Driving Distance */
function getDrivingDistance(origin, dest){
    var service = new google.maps.DistanceMatrixService();
    var request={
        origins: [origin],
        destinations: [dest],
        travelMode: 'DRIVING',
      };
    service.getDistanceMatrix(request,function(response, status){
            if(status =="OK"){
                var carDrivingDistance = response["rows"][0]["elements"][0]["distance"]["value"];
                console.log(carDrivingDistance);
                console.log(response["rows"]);
                return carDrivingDistance;
            }
            else{
                console.log("status is not ok")
            }
        })
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
    console.log("Latitude: " + position.coords.latitude + 
  "Longitude: " + position.coords.longitude);
    var position = position.coords.latitude + ", " + position.coords.longitude;
  $("#search_start").val(position);
}


/* GETTING UP TO DATE CO2 INFORMATION */

function updateEmissions(){
    $.get("carbon/get/", function(data, status){
        if (data["co2_saved"] == 0){
            $(".co2-saved").text("No savings yet, take a trip and save some emissions!")
        }
        else {
            $(".co2-saved").text(data["co2_saved"] + " gs of co2 saved!")
        }
    })
}

// $.get("carbon/get/", function(data, status){
//     $(".co2-saved").text(data["co2_saved"] + " grams of co2.")
// })

// !!!! Temporarily commented out because it threw an Server 500 error - JS
// updateEmissions()

/* FUNCTION FOR POST REQUEST TO ADD CO2 INFORMATION */
function postCO2(toAdd){
    $.post("carbon/", {'value': toAdd}).done(function(response){
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
            $("#not-not-auth").hide();
            $("#notif-auth").show();

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
            $("#not-not-auth").hide();
            $("#notif-auth").show();
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
        $("#not-not-auth").show();
        $("#notif-auth").hide();
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
            $("#not-not-auth").show();
            $("#notif-auth").hide();
            $(".logout").hide()
            $(".login").show()
            updateEmissions() 
        })
    }
    else {
        alert("Account not deleted.")
    }
})

Notification.requestPermission().then(function(result) {
    if (result == "granted"){
        const text = 'HEY! Your task  is now overdue.';
        const notification = new Notification('To do list', { body: text });
    }
  });

function newNotification(bus, interval){
    const text = "The " + bus + " bus is " + interval +" Minutes away from your stop!";
    const notification = new Notification('To do list', { body: text });
}

newNotification(15, 5)

function sendNotificaiton(time, bus){
    var minutesToAdd=2;
    
    var chosenRoute = {
        bus: 15 ,
        time: futureDate.getTime(),
    }
   
        $.ajax({
            type: "POST",
            url: "add_notification",
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


// @Yating -  feel free to tweak and change the function you need it :) Happy coding...
// Function to get the predicted travel time (full route) for following parameters:
// - line_id ; STRING, e.g. 46A
// - direction ; STRING, either 'inbound' or 'outbound'
// - departureTime ; UTC timestamp in milliseconds, INT, e.g. Date.now()


// !!! This button is only for testing purposes and should be removed afterwards
$("#btn_getPrediction").click(function(){
    let traveltime = Date.now()
    // let traveltime = 1658459237000; // some date in the future
    getTravelTimePrediction("46A", "outbound", traveltime);
});


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