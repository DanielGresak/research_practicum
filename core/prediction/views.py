import json
import os
import pytz
from datetime import datetime, timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from weather.models import Forecast, CurrentWeather
from .algorithms import Prediction

# Create your views here.

# Function to predict the travel time based on the line-ID,
# direction and traveltime were the inputs are expected as follow:
#  - line_id ; STRING, e.g. 46A
#  - direction ; STRING, either 'inbound' or 'outbound'
#  - departureTime ; UTC timestamp in milliseconds (JavaScript),
# INT, e.g. Date.now()


def convert_utc_to_local_datetime(utc_timestamp):
    """Function that converts UTC into a local datetime object"""
    dt_naive = datetime.fromtimestamp(utc_timestamp)
    # Convert naive into aware datetime object that includes timezone info
    dt_aware = dt_naive.replace(tzinfo=pytz.UTC)
    # Set local timezone
    dt_local = dt_aware.astimezone(pytz.timezone('Europe/London'))
    return dt_local


@api_view(['GET'])
def predict_travel_time(request, line_id, direction, traveltime):

    # The weather forecast is for 5 days in the future.
    # We will provide 4 days as the maximum traveltime from the now on.
    # This is equal to 345,000 seconds
    TIME_DELTA_FUTURE = 345600  # [sec]
    TIME_DELTA_PAST = 120  # [sec]

    if request.method == "GET":
        # ***************** Prepare Input Arguments ***************
        # Get line id and direction
        req_line_id = str(line_id)
        req_direction = str(direction)
        # Get UTC timestamp from REST API and divide it by 1000 to convert
        # the time format from milliseconds into seconds
        utc_timestamp_req = round(traveltime / 1000)
        # Convert UTC timestamp into local time
        dt_local_req = convert_utc_to_local_datetime(utc_timestamp_req)

        # ***************** Input Validiation ************************
        # 1) Validate requested line id by checking it against
        # the static bus line dictionary
        bus_lines_file = os.path.join(
            os.path.join(
                    os.getcwd(), "prediction", "static",
                    "prediction", "models"),
            "df_final_dic.json")
        try:
            with open(bus_lines_file) as json_file:
                bus_lines_dic = json.load(json_file)
                if req_line_id not in bus_lines_dic:
                    print("Error - requested bus line does not exist in the\
                        'df_final_dic.json' file.")
                    return Response(status=status.HTTP_400_BAD_REQUEST)
        except IOError:
            print("Error - could not open or load the\
                'df_final_dic.json' file.")
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # 2) Validate requested travel direction
        if not (req_direction == "inbound" or req_direction == "outbound"):
            print("Error - travel direction must be either\
                'inbound' or 'outbound'.")
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # 3) Validate requested timestamp
        # Time needs to be in a reasonable time range
        dt = datetime.now(timezone.utc)
        utc_time_now = dt.replace(tzinfo=timezone.utc)
        utc_timestamp_now = utc_time_now.timestamp()
        if (utc_timestamp_req + TIME_DELTA_PAST < utc_timestamp_now) or\
                (utc_timestamp_req > utc_timestamp_now + TIME_DELTA_FUTURE):
            print("Error - provided timestamp is invalid.")
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # ***************** Retrieve Weather Info ***************
        # Retrieve weather details that are closest to the requested timestamp
        weather_details = retrieve_weather_details(utc_timestamp_req)

        # ***************** Feed ML model with Inputs ***************
        # Use either Linear Regression or Random Forest Model,
        # depending on what's configured in the .env file
        if os.getenv("USE_LINEAR_REGRESSION", 'False').lower()\
                in ('true', '1'):
            model = Prediction("Linear Regression Model", "linearRegression")
        else:
            model = Prediction("Random Forest Model", "randomForest")
        # Feed model with input features and get response as follows:
        # [travel_time_sec, execution_time]
        prediction = model.get_prediction(
            req_line_id,
            req_direction,
            weather_details['wind_speed'],
            weather_details['rain_1h'],
            weather_details['clouds'],
            dt_local_req)

        # ***************** Prepare the Response ***************

        # Request related information
        resp_request_info = {}
        resp_request_info['line_id'] = req_line_id
        resp_request_info['direction'] = req_direction
        resp_request_info['datetime'] = dt_local_req
        resp_request_info['UTC_timestamp'] = utc_timestamp_req

        # Weather related information
        resp_weather_info = {}
        resp_weather_info['db_name'] = weather_details['db_name']
        resp_weather_info['datetime'] = convert_utc_to_local_datetime(
                weather_details['dt'])
        resp_weather_info['UTC_timestamp'] = weather_details['dt']
        resp_weather_info['clouds'] = weather_details['clouds']
        resp_weather_info['wind_speed'] = weather_details['wind_speed']
        resp_weather_info['rain_1h'] = weather_details['rain_1h']

        # Response details
        resp_info = {}
        resp_info['model'] = model.name
        resp_info['time_execution'] = round(prediction[1], 2)

        # Wrap details and time prediction up in response data
        resp_data = {}
        resp_data['time_prediction'] = prediction[0]
        resp_data['request_info'] = resp_request_info
        resp_data['response_info'] = resp_info
        resp_data['weather_info'] = resp_weather_info

    return Response(resp_data, status=status.HTTP_200_OK)

# Function to retrieve the the weather details based on the provided
# timestamps from one of the following database tables:
# - weather_forecast
# - weather_currentweather


def retrieve_weather_details(timestamp):

    details_dict = {}

    # Retrieve last object in the current weather database
    try:
        current_weather_obj = CurrentWeather.objects.last()
    except Exception as e:
        print("Database error:", e)
        return details_dict
    if current_weather_obj is not None:
        obj = current_weather_obj
        time_delta = abs(obj.dt - timestamp)

    # Traverse over object list and find the timestamp
    # that is closest to the requested timestamp
    # Retrieve all forecast objects stored in the database
    try:
        forecasts_objects = Forecast.objects.all()
    except Exception as e:
        print("Database error:", e)
        return details_dict
    if forecasts_objects is not None:
        for object in forecasts_objects:
            if abs(object.dt - timestamp) < time_delta:
                time_delta = abs(object.dt - timestamp)
                obj = object

    # Save weather details from either forecast or current weather object
    # in dictionary
    if obj == current_weather_obj:
        details_dict['rain_1h'] = obj.rain_1h
    else:
        # set to zero because it doesn't exist in forecast object
        details_dict['rain_1h'] = 0

    # These properties are common to both forecast and current weather object
    details_dict['db_name'] = obj._meta.db_table
    details_dict['dt'] = obj.dt
    details_dict['clouds'] = obj.clouds
    details_dict['wind_speed'] = obj.wind_speed

    return details_dict
