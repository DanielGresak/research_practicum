
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
    const color = ["yellow", "green", "blue", "red"];// the color for the routes
    for(let i = 0; i < totalRoutes; i++){
            directionRenders[i] = new google.maps.DirectionsRenderer({
            directions: result,
            routeIndex: i,
            map: gmap,
            polylineOptions:{
                strokeColor: color[i],
                strokeOpacity: 0.6, 
            }
        });}
    
    //change color of the stroke https://stackoverflow.com/questions/9311498/change-the-color-of-the-polyline-in-directionsrenderer
    return directionRenders;
}

// this function will return a directionary contains the bus routes and arriving time
// in case of transfering, the key and value will be an array(more than one buses)
// routes is from result["routes"][index]
function getBusInfo(routes){
    var busInfo = []
    var busRoutes = {};
    var routeNumber = [];
    var arrivingTime = [];
    var steps = routes["legs"][0]["steps"];
    var numberSteps = steps.length;
    var meters = 0
    for (let i = 0; i < numberSteps; i++){
        if (steps[i]["transit"] !== undefined){// find the step for the bus instead of working
            routeNumber.push(steps[i]["transit"]["line"]["short_name"]);
            arrivingTime.push(steps[i]["transit"]["arrival_time"]["text"]);
            meters += steps[i]["distance"]["value"]
        }
    }
    
    // busRoutes["distance"] = meters
    busRoutes[routeNumber] = arrivingTime;
    busInfo.push(busRoutes);
    
    busInfo.push({distance: meters})
    console.log(busInfo);
    return busInfo;
}


// refer from https://developers.google.com/maps/documentation/javascript/directions?hl=en#TravelModes
function calcRoute(directionsService, directionsRenderer, map) {
    var originString = $("#search_start").val();
    var destString = $("#search_destination").val();
    var startTime = $("#time_of_travel").val();
    console.log(originString+" "+destString+ " "+startTime);

    var mydate = new Date(startTime);
    var resultTime = mydate.getTime();
    console.log(resultTime);

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

            // display all the possible routes on the map in different colors
            const directionRenderers = renderDirections(result, map);

            // total number of possible routes
            var totalNumberOfRoutes = result["routes"].length// total number of routes
            $(".busInfo").show();
            $(".searchbar").hide();
            
            for(let route = 0; route < totalNumberOfRoutes; route++){
                console.log(result)
                var info = getBusInfo(result["routes"][route]);
                var busRoutes = info[0] // the bus number and arriving time pair(directionary)
                var distance = info[1]["distance"]
                var busNumber = Object.keys(busRoutes); // bus number
                var arrivingTime = busRoutes[busNumber];// arriving time of this bus
                var busNumString = "";
                var busArrivingString = "";
                busNumber.forEach(number =>{ busNumString += number});// will be optimized later on for the bus transfering case
                arrivingTime.forEach(number =>{ busArrivingString += number});//will be optimized later on for the bus transfering case
                
                // add a bus info child window for every bus/route
                $(".busInfo").append("<div class = 'oneBus'>\
                                        <p class = 'busHeader'>"+"Bus route "+(route+1)+": "+busNumString+"</p>\
                                        <p class = 'busDetail' id = 'arrivingTime'>Arriving time: <span id ='time'>"+ busArrivingString+"</span></p>\
                                        <p class = 'busDetail' id = 'totalTravelTime'>Total travel time:</p>\
                                        <p class = 'busDetail' id = 'busFare'>Bus fare:</p>\
                                        <p class = 'busDetail' id = 'carbonEmissionSaved'>Carbon emission saved:</p>\
                                        <button class='emissions-btn' onclick='postCO2(" + distance +")'>Add to emisions</button>\
                                    </div>")
            }
            //add a back button, go back to the search bar
            $(".busInfo").append("<button id='busInfoBtn' class='btn btn-dark'>Back</button>");
            
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

            // when click on a bus info window, extract the route index and only display the according route on the map
            $(".oneBus").mousedown(function() {
                var stringToArray = $(this).text().match(/\b(\w+)\b/g);
                var busIndex = stringToArray[2]-1;//extracting the route index

                //for the on clicked route, set the color to red
                var polylineOnClick = new google.maps.Polyline({
                    strokeColor: "red",
                    strokeOpacity: 0.6,
                })

                // only show the selected route
                for (let stroke = 0; stroke < directionRenderers.length; stroke++){
                    directionRenderers[stroke].setOptions({map:null, directions: result, routeIndex:stroke});
                }
                directionRenderers[busIndex].setOptions({polylineOptions:polylineOnClick, map:map, directions: result, routeIndex:busIndex});
             });
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
        $(".co2-saved").text(data["co2_saved"] + " grams of co2.")
    })
}

// $.get("carbon/get/", function(data, status){
//     $(".co2-saved").text(data["co2_saved"] + " grams of co2.")
// })

updateEmissions()

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

