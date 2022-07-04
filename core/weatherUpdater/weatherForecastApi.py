from html import entities
import os
import requests
from weather.models import Forecast

# Define global constants
LATITUDE = 53.350140 # Latitude of Dublin
LONGITUDE = -6.266155 # Longitude of Dublin
FORECAST_URL = "http://api.openweathermap.org/data/2.5/forecast"
TIMESTAMP_CNT = 40 #  The number of timestamps which will be returned in the API response (every 3 hours for 5 days makes up 40 timestamps)


def _query_forecast():
    """Function that calls the OpenWeather 5 day weather forecaset API and returns the result as JSON"""

    api_key = os.environ.get("OPEN_WEATHER_API"),
    units = "metric" # Units in metrics to get temperature in Celcius

    # Example: api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&cnt={cnt}&units={units}&appid={API key}
    req = requests.get("{0}?lat={1}&lon={2}&cnt={3}&units={4}&appid={5}"\
        .format(FORECAST_URL, LATITUDE, LONGITUDE, TIMESTAMP_CNT, units, api_key))

    try:
        req.raise_for_status()
        result_json = req.json()
    except:
        # Todo: implement error logging
        result_json = None
    
    return result_json


def update_weather_forecast():
    """Function that updates the 5 day weather forecast in the database
    
    - By inserting the latest dataset into the database
    - By deleting all exisiting historical datasets in the database to free up space in the database
    """

    first_timestamp = 0

    def insert_latest_forecast():
        """Sub-function to insert the latest forecast into the database"""
        
        # Iterate over received forecast enitities and save them sequentially in the database
        # Side note: To improve performance, the 'bulk_create()' method could be utilised to write all data at a single stroke. 
        # If time allows we'll look into that...
        for i, entity in enumerate(forecast_json['list']):
                
            if i == 0:
                first_timestamp = entity['dt']

            new_forecast_entity = Forecast()

            new_forecast_entity.dt = entity['dt']
            new_forecast_entity.dt_txt = entity['dt_txt']
            new_forecast_entity.temp = entity['main']['temp']
            new_forecast_entity.temp_min = entity['main']['temp_min']
            new_forecast_entity.temp_max = entity['main']['temp_max']
            new_forecast_entity.humidity = entity['main']['humidity']
            new_forecast_entity.weather_main = entity['weather'][0]['main']
            new_forecast_entity.weather_description = entity['weather'][0]['description']
            new_forecast_entity.weather_icon = entity['weather'][0]['icon']
            new_forecast_entity.clouds = entity['clouds']['all']
            new_forecast_entity.pop = entity['pop']


            # Insert new forecast into database
            new_forecast_entity.save()

    def delete_outdated_forecast():
        """Sub-function to delete outdated forecast datasets"""
        entities_to_delete = Forecast.objects.filter()

    # Query latest weather forecast data 
    forecast_json = _query_forecast()
    
    if forecast_json is not None:
        try:

            insert_latest_forecast()
            delete_outdated_forecast()

        except:
            # Todo: Error logging
            print("Error - Inserting new weather forecast entity into database failed!\n")
            



