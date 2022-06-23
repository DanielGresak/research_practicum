
let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 53.3498, lng: -6.2603 },
    zoom: 11,
    });
}

window.initMap = initMap;

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