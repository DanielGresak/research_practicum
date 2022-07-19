function showWeatherData(url) {
    $.ajax({
      url: url,
      type: "GET",
      dataType: "json",
      success: (data) => {
        // Check if data received from API has the expected length
        // Array elements [0] up to [39] contain the forecast details, where each element represents a three hour interval
        // Array element [40] contains the current weather information
        if (data.length != 41) {
          console.log("Error - Unexpected data field length received from API");
          console.log(data);
          return;
        } else {
          // Extract current weather data
          var currentWeather = data[40];
        }

        // Display current weather icon
        $("#current-weather-icon").html(
          '<img src="http://openweathermap.org/img/wn/' 
          + currentWeather.weather_icon
          + '@2x.png" alt="weather icon" class="w-icon"></img>'
        );

        // Display current weather description, e.g. few clouds, etc. 
        $(".condition").html('<p>' + currentWeather.weather_description + '</p>');

        // Display current weather details
        $("#current-weather-details").html(
          '<div class="weather-detail">\
            <div>Temperature:</div>\
            <div>' + currentWeather.main_temp.toFixed(1) + ' &#176C</div>\
          </div>\
          <div class="weather-detail">\
            <div>Min. temperature:</div>\
            <div>' + currentWeather.main_temp_min.toFixed(1) + ' &#176C</div>\
          </div>\
          <div class="weather-detail">\
            <div>Max. temperature:</div>\
            <div>' + currentWeather.main_temp_max.toFixed(1) + ' &#176C</div>\
          </div>\
          <div class="weather-detail">\
            <div>Wind speed:</div>\
            <div>' + currentWeather.wind_speed.toFixed(1) + ' m/s</div>\
          </div>'
        );

        // Create dynamically a sort of media scroller by utilising the flexbox element
        const weekday = ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."];
        let forecast = ''
        data.forEach((item, index) => {
          // Array elements [0] up to [39] contain the forecast details, where each element represents a three hour interval
          if (index <= 39) {
            // Create a date object based on the received UTC timestamp given in milliseconds
            let d = new Date(item.dt * 1000);
            // Convert time into a local time string of the format [hh.mm.ss] and remove seconds from the string
            let localTime = d.toLocaleTimeString();
            localTime = localTime.substring(0,5);
            
            // Multiply pop (Probablity of Precipitation) by 100 to get 0..100%
            let pop = item.pop * 100;
            pop = pop.toFixed(); // Round the number to 0 decimals and convert into a string

            // For each timestamp, create a forecast (flexbox) element
            // Note: 'pop' stands for Probability of Precipitation and is given between 0 ... 1, so we need to multiply by 100 to get 0% ... 100%
            forecast += '<div class="forecast-element">\
              <div class="day">' + weekday[d.getUTCDay()] + '</div>\
              <div class="time">' + localTime + '</div>\
              <div class="temp">' + item.temp.toFixed(1) + ' &#176;C</div>\
              <img src="http://openweathermap.org/img/wn/' + item.weather_icon + '@2x.png" alt="weather icon" class="w-icon">\
              <div class="pop"><i class="fa-solid fa-droplet"></i> '+ pop +' &#37;</div>\
              </div>'    
          }
        });
        $(".forecast-container").html(forecast);
      },
      error: (error) => {
        console.log(error);
      }
    });
  };
