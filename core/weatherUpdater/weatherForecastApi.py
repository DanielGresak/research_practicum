from html import entities
import os
import json
import requests
from django.core.serializers.json import DjangoJSONEncoder
from weather.models import Forecast, CurrentWeather
from requests.exceptions import HTTPError


# Define global constants
LATITUDE = 53.350140 # Latitude of Dublin
LONGITUDE = -6.266155 # Longitude of Dublin
FORECAST_URL = "http://api.openweathermap.org/data/2.5/forecast?"
WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather?"
UNITS = "metric" # Units in metrics to get temperature in Celcius
TIMESTAMP_CNT = 40 #  The number of timestamps which will be returned in the API response (every 3 hours for 5 days makes up 40 timestamps)


def query_weather_data(url, **kwargs):
    """Function that calls the OpenWeather API and returns the result as JSON

    It can be used for either querying the current weather or the 5 day forecast.
    For querying the 5 day forecast, pass the optional argument 'cnt'.
    
    OPTIONAL ARGUMENTS: 
    cnt = The number of forecast timestamps, which will be returned in the API response.
    """

    # Get API key for OpenWeather API
    api_key = os.environ.get("OPEN_WEATHER_API")

    # Check if keyword 'cnt' is passed as argument
    if "cnt" in kwargs:
        cnt = kwargs["cnt"]
        # Check if datatype of the argument is integer
        if isinstance(cnt, int):
            # Create the string for the 'forecast' API call
            # Example: api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&cnt={cnt}&units={units}&appid={API key}
            req_url = "{0}lat={1}&lon={2}&cnt={3}&units={4}&appid={5}".format(url, LATITUDE, LONGITUDE, cnt, UNITS, api_key)
        else:
            # Todo error logging
            print("Error - The provided argument 'units' in function 'query_forecast' must be of datatype integer!")
            response_json = None
    else:
        # Create the string for the 'current weather' API call
        # Example: api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units={units}&appid={API key}
        req_url = "{0}lat={1}&lon={2}&units={3}&appid={4}".format(url, LATITUDE, LONGITUDE, UNITS, api_key)

    try:
        # Make API request
        response = requests.get(req_url)
        response.raise_for_status()
        response_json = response.json()
    except HTTPError as exc:
        error_code = exc.response.status_code
        # Todo: implement error logging
        print(f'Error code: {error_code} ; Calling WeatherOpen API has failed!')
        response_json = None
    
    return response_json


def update_weather_forecast():
    """Function that updates the 5 day weather forecast in the database
    
    - By inserting the latest dataset into the database
    - By deleting all exisiting historical datasets in the database to free up space in the database
    """

    new_timestamp = 0

    def update_create_forecast():
        """Sub-function to insert the latest forecast into the database"""
        
        # As we want to locally modify variables which are defined in the enclosing function, 
        # we need to declare that variable using 'nonlocal'. This allows to modify nonlocal variables within nested functions.
        nonlocal new_timestamp
        # Iterate over received forecast objects and update/save them sequentially in the database
        # Remember: If TIMESTAMP_CNT == 40 then we'll receive 40 weather objects, 
        # representing the forecast for 5 days with an interval of 3 hours.
        # e.g. 24 hours / 3 hours  * 5 days = 40
        for i, entity in enumerate(forecast_json["list"]):

            # For each entity create a dictionary and store the extraxt values that are desired
            entity_dict = {}
            entity_dict["dt"] = entity["dt"] # datetime as integer in UTC format (seconds) 
            entity_dict["dt_txt"] = entity["dt_txt"] # datetime as string
            entity_dict["temp"] = entity["main"]["temp"]
            entity_dict["temp_min"] = entity["main"]["temp_min"]
            entity_dict["temp_max"] = entity["main"]["temp_max"]
            entity_dict["humidity"] = entity["main"]["humidity"]
            entity_dict["weather_main"] = entity["weather"][0]["main"]
            entity_dict["weather_description"] = entity["weather"][0]["description"]
            entity_dict["weather_icon"] = entity["weather"][0]["icon"]
            entity_dict["clouds"] = entity["clouds"]["all"]
            entity_dict["pop"] = entity["pop"]

            # Store the timestamp of the first entity received so that we can later delete older forecast entities
            # which have become obsolete.
            if i == 0:
                new_timestamp = entity_dict["dt"]

            # Update object in database if it already exists, otherwise create a new one
            # It 'dt' - timestamp - already exists, then udpate with object with the latest forecast information 
            obj, created = Forecast.objects.update_or_create(
                dt=entity_dict["dt"], defaults=entity_dict)

            # Returns a tuple of (object, created), 
            # where object is the created or updated object and created is a boolean specifying whether a new object was created.

            print("Object:", obj) # 
            print("Object was created:", created)


    def delete_outdated_forecast():
        """Sub-function to delete outdated forecast datasets"""

        try:
            # Delete all tuples in the database where the timestamp is older then new timestamp
            # Note: A Unix timestamp is the number, represented as a integer, of seconds between a particular date and January 1, 1970 at UTC
            # https://www.programiz.com/python-programming/datetime
            objects_deleted = Forecast.objects.filter(dt__lt=new_timestamp).delete()
            print("Objects deleted:", objects_deleted)
        except:
            # Todo: Error logging
            print("Error - Deleting outdated forecast entities failed!\n")

    # Query latest weather forecast data 
    forecast_json = query_weather_data(FORECAST_URL, cnt=TIMESTAMP_CNT)
    if forecast_json is not None:
        update_create_forecast()
        delete_outdated_forecast()
            

def update_current_weather():
    """Function that updates the current weather in the database
    
    - By adding each response from OpenWeather to the database 
    """
    # Query current weather data 
    current_weather_json = query_weather_data(WEATHER_URL)
    if current_weather_json is not None:     
        # For each entity create a dictionary and store the extraxt values that are desired
        entity_dict = {}
        entity_dict["dt"] = current_weather_json["dt"] # datetime as integer in UTC format (seconds)
        entity_dict["weather_id"] = current_weather_json["weather"][0]["id"]
        entity_dict["weather_main"] = current_weather_json["weather"][0]["main"]
        entity_dict["weather_description"] = current_weather_json["weather"][0]["description"]
        entity_dict["weather_icon"] = current_weather_json["weather"][0]["icon"]
        entity_dict["main_temp"] = current_weather_json["main"]["temp"]
        entity_dict["main_temp_min"] = current_weather_json["main"]["temp_min"]
        entity_dict["main_temp_max"] = current_weather_json["main"]["temp_max"]
        entity_dict["humidity"] = current_weather_json["main"]["humidity"]
        entity_dict["wind_speed"] = current_weather_json["wind"]["speed"]
        entity_dict["clouds"] = current_weather_json["clouds"]["all"]
        # If we don't receive some of the parameters in our API response,
        # it means that these weather phenomena are just not happened for the time of measurement for the city or location chosen. 
        # Only really measured or calculated data is displayed in API response
        if "rain" in current_weather_json:
            if "1h" in current_weather_json["rain"]:          
                entity_dict["rain_1h"] = current_weather_json["rain"]["1h"]
            else:
                entity_dict["rain_1h"] = 0
            if "3h" in current_weather_json["rain"]:          
                entity_dict["rain_3h"] = current_weather_json["rain"]["3h"]
            else:
                entity_dict["rain_3h"] = 0

        try:
            # Update object in database if it already exists, otherwise create a new one
            # It 'dt' - timestamp - already exists, then simply udpate the object 
            # Returns a tuple of (object, created), 
            # where object is the created or updated object and created is a boolean specifying whether a new object was created.
            obj, created = CurrentWeather.objects.update_or_create(
                dt=entity_dict["dt"], defaults=entity_dict)

            print("Object:", obj) # 
            print("Object was created:", created)
        except:
            # Todo: Error logging
            print("Error - Writing current weather information to database has failed!\n")
