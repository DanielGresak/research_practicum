import json
import os
from pathlib import Path
from datetime import datetime, timezone, time
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .algorithms import linear_regression
from weather.models import Forecast, CurrentWeather

# Create your views here.

@api_view(['GET'])
def predict_travel_time(request, line_id, direction, traveltime):

    # The weather forecast is for 5 days in the future.
    # We will provide 4 days as the maximum traveltime from the now on.
    # This is equal to 345,000 seconds
    TIME_DELTA_FUTURE_SEC = 345600 # [sec]
    TIME_DELTA_PAST_SEC = 120 # [sec] 

    if request.method == "GET":
        # ***************** Prepare Input Arguments ***************
        # Get line id and direction
        req_line_id = str(line_id)
        req_direction = str(direction)
        # Get UTC timestamp from REST API and divide it by 1000 to convert 
        # the time format from milliseconds into seconds
        req_timestamp = round(traveltime / 1000)
        # Create datetime (YYYY-MM-DD HH:MM:SS) from timestamp 
        req_datetime = datetime.fromtimestamp(req_timestamp) 

        # ***************** Input Validiation ************************
        # 1) Validate requested line id by checking it against the static bus line dictionary
        bus_lines_file = os.path.join(os.path.join(os.getcwd(), \
            "prediction", "static_data"), "df_final_dic.json")
        try:
            with open(bus_lines_file) as json_file:
                bus_lines_dic = json.load(json_file)
                if not req_line_id in bus_lines_dic:
                    print("Error - requested bus line does not exist in the 'df_final_dic.json' file.")
                    return Response(status=status.HTTP_400_BAD_REQUEST)
        except IOError:
            print("Error - could not open or load the 'df_final_dic.json' file.")
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # 2) Validate requested travel direction
        if not (req_direction == "inbound" or req_direction == "outbound"):
            print("Error - travel direction must be either 'inbound' or 'outbound'.")
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # 3) Validate requested timestamp; time needs to be in a reasonable time range
        dt = datetime.now(timezone.utc)  
        utc_time = dt.replace(tzinfo=timezone.utc)
        utc_timestamp = utc_time.timestamp()
        if (req_timestamp + TIME_DELTA_PAST_SEC < utc_timestamp) or \
            (req_timestamp > utc_timestamp + TIME_DELTA_FUTURE_SEC):
                print("Error - provided timestamp is invalid.")
                return Response(status=status.HTTP_400_BAD_REQUEST)

        # ***************** Retrieve Weather Info ***************
        # Retrieve weather details that are closest to the requested timestamp
        weather_details = retrieve_weather_details(req_timestamp)

        # ***************** Feed ML model with Inputs ***************
        # Feed linear regression model with inputs and get travel trime prediction in return
        time_prediction = linear_regression(req_line_id, req_direction, 
                weather_details['wind_speed'], weather_details['rain_1h'], 
                weather_details['clouds'], req_datetime.hour,
                req_datetime.weekday(), req_datetime.month)

        # ***************** Prepare the Response ***************
        resp_request_info = {}
        resp_request_info['line_id'] = req_line_id 
        resp_request_info['direction'] = req_direction 
        resp_request_info['datetime'] = req_datetime 
        resp_request_info['UTC_timestamp'] = req_timestamp

        resp_weather_info = {}
        resp_weather_info['db_name'] = weather_details['db_name']  
        resp_weather_info['datetime'] = datetime.fromtimestamp(weather_details['dt'])
        resp_weather_info['UTC_timestamp'] = weather_details['dt']
        resp_weather_info['clouds'] = weather_details['clouds']
        resp_weather_info['wind_speed'] = weather_details['wind_speed']
        resp_weather_info['rain_1h'] = weather_details['rain_1h']
        
        resp_data = {}
        resp_data['time_prediction'] = time_prediction
        resp_data['request_info'] = resp_request_info
        resp_data['weather_info'] = resp_weather_info

    return Response(resp_data, status=status.HTTP_200_OK)


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

    # Save weather details from either forecast or current weather object in dictionary
    details_dict = {}
    if time_delta_index == len(object_list) - 1:
        obj = CurrentWeather.objects.filter(dt__gt=0).last()
        details_dict['rain_1h'] = obj.rain_1h
    else:
        obj = Forecast.objects.get(dt = object_list[time_delta_index].dt)
        details_dict['rain_1h'] = 0 # set to zero because it doesn't exist in forecast object

    # These properties are common to both forecast and current weather object
    details_dict['db_name'] = obj._meta.db_table
    details_dict['dt'] = obj.dt
    details_dict['clouds'] = obj.clouds
    details_dict['wind_speed'] = obj.wind_speed

    return details_dict

    # Examples 
    # https://medium.datadriveninvestor.com/deploying-ml-models-using-django-rest-api-part-2-84cea50b3c83
    # https://www.django-rest-framework.org/tutorial/2-requests-and-responses/
    # https://engineertodeveloper.com/how-to-return-a-json-response-in-django/
    # https://www.datacamp.com/tutorial/pickle-python-tutorial
    # https://www.aionlinecourse.com/blog/deploy-machine-learning-model-using-django-and-rest-api
