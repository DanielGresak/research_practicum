from time import time
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, time
from .algorithms import linear_regression
from weather.models import Forecast, CurrentWeather

# Create your views here.

@api_view(['GET'])
def predict_travel_time(request, line_id, direction, traveltime):
# def predict_travel_time(request, line_id, direction):
    if request.method == "GET":
        req_line_id = str(line_id)
        req_direction = str(direction)
        # Get UTC timestamp from REST API and divide it by 1000 to match timestamps in the database 
        req_timestamp = round(traveltime / 1000)
        # Create datetime (YYYY-MM-DD HH:MM:SS) from timestamp 
        req_datetime = datetime.fromtimestamp(req_timestamp) 

        # TODO validate requested line id
        # TODO validate direction whether it's 'inbound' or 'outbound'
        # TODO validate provided timestamp

        # Retrieve weather details that are closest to the requested timestamp
        weather_details = retrieve_weather_details(req_timestamp)

        # Feed linear regression model with inputs and get travel trime prediction in return
        time_prediction = linear_regression(req_line_id, req_direction, 
                weather_details['wind_speed'], weather_details['rain_1h'], 
                weather_details['clouds'], req_datetime.hour,
                req_datetime.weekday(), req_datetime.month)


        predictions = {
            "error": "0",
            "line_id": req_line_id,
            "direction": req_direction,
            "req_datetime": req_datetime,
            "req_timestamp": req_timestamp,
            "weather_timestamp": weather_details['dt'],
            "clouds": weather_details['clouds'],
            "wind_speed": weather_details['wind_speed'],
            "rain_1h": weather_details['rain_1h'],
            "time_prediction": time_prediction
        }

    return Response(predictions)


def retrieve_weather_details(timestamp):

    # Retrieve all forecast objects stored in the database
    object_list = []
    forecasts_objects = Forecast.objects.all()
    for object in forecasts_objects:
        object_list.append(object)

    # Retrieve last object in the current weather database and append it to the list
    object_list.append(CurrentWeather.objects.filter(dt__gt=0).last())

    # Traverse over object list and find the timestamp that is closest to the requested timestamp
    time_delta_min = abs(object_list[0].dt - timestamp)
    time_delta_index = 0
    for i, object in enumerate(object_list):
        if abs(object.dt - timestamp) < time_delta_min:
            time_delta_min = abs(object.dt - timestamp)
            time_delta_index = i

    # TODO Check if time delta is reasonable and if not throw an error

    # Save weather details from either forecast or current weather object in dictionary
    details_dict = {}
    if time_delta_index == len(object_list) - 1:
        obj = CurrentWeather.objects.filter(dt__gt=0).last()
        details_dict['rain_1h'] = obj.rain_1h
    else:
        obj = Forecast.objects.get(dt = object_list[time_delta_index].dt)
        details_dict['rain_1h'] = 0 # set to zero because it doesn't exist in forecast object

    # These properties are common to both forecast and current weather object
    details_dict['dt'] = obj.dt
    details_dict['clouds'] = obj.clouds
    details_dict['wind_speed'] = obj.wind_speed

    return details_dict



    # Verify time is of correct format
    # Verify time is in given time range -> compare to timestamps in weather forecast
    # Verify direction is either a string and either 'inbound' or 'outbound'
    # Verify line_id is integer and valid, meaning line id actually exists. Where do we get information from which line IDs exist?
    # Retrieve weather forecast object that fits best in a certain time interval (3h)
    # Load pickle file
    # Excute prediction 
    # Handle errors
    # return Response(predictions)

    # Examples 
    # https://medium.datadriveninvestor.com/deploying-ml-models-using-django-rest-api-part-2-84cea50b3c83
    # https://www.django-rest-framework.org/tutorial/2-requests-and-responses/
    # https://engineertodeveloper.com/how-to-return-a-json-response-in-django/
    # https://www.datacamp.com/tutorial/pickle-python-tutorial
    # https://www.aionlinecourse.com/blog/deploy-machine-learning-model-using-django-and-rest-api
