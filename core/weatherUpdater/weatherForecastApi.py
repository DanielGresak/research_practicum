from html import entities
import os
import json
import requests
from django.core.serializers.json import DjangoJSONEncoder
from weather.models import Forecast

# Define global constants
LATITUDE = 53.350140 # Latitude of Dublin
LONGITUDE = -6.266155 # Longitude of Dublin
FORECAST_URL = "http://api.openweathermap.org/data/2.5/forecast"
TIMESTAMP_CNT = 40 #  The number of timestamps which will be returned in the API response (every 3 hours for 5 days makes up 40 timestamps)


def _query_forecast():
    """Function that calls the OpenWeather 5 day weather forecaset API and returns the result as JSON"""

    api_key = os.environ.get("OPEN_WEATHER_API")
    units = "metric" # Units in metrics to get temperature in Celcius

    # Example: api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&cnt={cnt}&units={units}&appid={API key}
    req = requests.get("{0}?lat={1}&lon={2}&cnt={3}&units={4}&appid={5}".format(FORECAST_URL, LATITUDE, LONGITUDE, TIMESTAMP_CNT, units, api_key))

    try:
        req.raise_for_status()
        result_json = req.json()
    except:
        # Todo: implement error logging
        print("Error - Calling forecast API failed!")
        result_json = None
    
    return result_json


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

            # print("Printing dict ", i, "\n", entity_dict)
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
    forecast_json = _query_forecast()
    if forecast_json is not None:
        update_create_forecast()
        delete_outdated_forecast()
            


