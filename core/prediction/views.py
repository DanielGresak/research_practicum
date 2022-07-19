import pickle
from time import time
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, time
from django.views.decorators.csrf import csrf_exempt

# Create your views here.

@api_view(['GET'])
def predict_travel_time(request, line_id, direction, traveltime):
# def predict_travel_time(request, line_id, direction):
    if request.method == "GET":
        req_line_id = int(line_id)
        req_direction = str(direction)
        req_datetime = datetime.fromtimestamp(traveltime / 1000) 


        predictions = {
            "error": "0",
            "line_id": req_line_id,
            "direction": req_direction,
            "datetime": req_datetime,
        }

    return Response(predictions)


# @csrf_exempt
# @api_view(['GET', 'POST'])
# def predict_travel_time(request):
#     if request.method == "GET":
        
    # def _format_datetime(dt):
    #     regex = '\d{4}-\d{1,2}-\d{1,2} \d{2}:\d{2}:\d{2}'
    #     format = '%Y-%m-%d %H:%M:%S'
    #     return datetime.strptime(dt, format).timestamp()

    # if request.method == "POST":
    #     req_line_id = int(request.data['line_id'])
    #     req_direction = str(request.data['direction'])
    # req_dt = _format_datetime(request.data['traveltime'])



    # predicted_traveltime = 8888

    # predictions = {
    #     "line_id": req_line_id,
    #     "direction": req_direction,
    #     # "traveltime": req_dt,
    #     "predicted_traveltime": predict_travel_time  
    # }

    # return response(predictions)



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
