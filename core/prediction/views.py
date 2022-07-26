import json
import os
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


@api_view(['GET'])
def predict_travel_time(request, line_id, direction, traveltime):

    # The weather forecast is for 5 days in the future.
    # We will provide 4 days as the maximum traveltime from the now on.
    # This is equal to 345,000 seconds
    TIME_DELTA_FUTURE_SEC = 345600  # [sec]
    TIME_DELTA_PAST_SEC = 120  # [sec]

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
        utc_time = dt.replace(tzinfo=timezone.utc)
        utc_timestamp = utc_time.timestamp()
        if (req_timestamp + TIME_DELTA_PAST_SEC < utc_timestamp) or\
                (req_timestamp > utc_timestamp + TIME_DELTA_FUTURE_SEC):
            print("Error - provided timestamp is invalid.")
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # ***************** Retrieve Weather Info ***************
        # Retrieve weather details that are closest to the requested timestamp
        weather_details = retrieve_weather_details(req_timestamp)

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
            req_datetime)

        # ***************** Prepare the Response ***************

        # Request related information
        resp_request_info = {}
        resp_request_info['line_id'] = req_line_id
        resp_request_info['direction'] = req_direction
        resp_request_info['datetime'] = req_datetime
        resp_request_info['UTC_timestamp'] = req_timestamp

        # Weather related information
        resp_weather_info = {}
        resp_weather_info['db_name'] = weather_details['db_name']
        resp_weather_info['datetime'] = datetime.fromtimestamp(
                weather_details['dt'])
        resp_weather_info['UTC_timestamp'] = weather_details['dt']
        resp_weather_info['clouds'] = weather_details['clouds']
        resp_weather_info['wind_speed'] = weather_details['wind_speed']
        resp_weather_info['rain_1h'] = weather_details['rain_1h']

        # Response details
        resp_info = {}
        resp_info['model'] = model.name
        resp_info['time_execution'] = prediction[1]

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
