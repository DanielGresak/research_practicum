
let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 53.3498, lng: -6.2603 },
    zoom: 11,
    });
}

window.initMap = initMap;

console.log("hi")