import requests
from weather.models import Forecast

def _query_forecast():
    weather_url = "http://api.openweathermap.org/data/2.5/forecast"
    # Use latitude and longitude for Dublin
    latitude = 53.350140
    longitude = -6.266155
    api_key = "9cbe779463d67dbaec999233ec9ac33c"
    cnt = 1 # Defines the number of timestamps in the API response

    # Example: api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&cnt={cnt}&appid={API key}
    req = requests.get("{0}?lat={1}&lon={2}&cnt={3}&appid={4}".format(weather_url, latitude, longitude, cnt, api_key))

    try:
        req.raise_for_status()
        result_json = req.json()
    except:
        # Todo: implement error logging
        result_json = None
    
    return result_json

def convert_kelvin_to_celcius(temp_k):
    temp_c = (temp_k -32) * 5 / 9
    return temp_c

def update_weather_forecast():
    forecast_json = _query_forecast()
    
    print("Printing forecast for debugging only...")
    print(forecast_json)
    
    if forecast_json is not None:
        # try:
        new_forecast_entity = Forecast()

        new_forecast_entity.temp = convert_kelvin_to_celcius(forecast_json['list'][0]['main']['temp'])
        new_forecast_entity.temp_min = convert_kelvin_to_celcius(forecast_json['list'][0]['main']['temp_min'])
        new_forecast_entity.temp_max = convert_kelvin_to_celcius(forecast_json['list'][0]['main']['temp_max'])
        new_forecast_entity.humidity = forecast_json['list'][0]['main']['humidity']
        new_forecast_entity.weather_main = forecast_json['list'][0]['weather'][0]['main']
        new_forecast_entity.weather_description = forecast_json['list'][0]['weather'][0]['description']
        new_forecast_entity.weather_icon = forecast_json['list'][0]['weather'][0]['icon']
        new_forecast_entity.clouds = forecast_json['list'][0]['clouds']['all']
        new_forecast_entity.pop = forecast_json['list'][0]['pop']

        # Insert new forecast into database
        new_forecast_entity.save()
        # except:
        #     # Todo: Error logging
        #     print("Error - Inserting new weather forecast entity into database failed!\n")
            



