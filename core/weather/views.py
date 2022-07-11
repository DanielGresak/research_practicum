import json
from MySQLdb import Timestamp
from django.http import HttpResponse, Http404
from weather.models import Forecast, CurrentWeather
from itertools import chain

# Create your views here.

# Example are given here: 
# https://engineertodeveloper.com/how-to-return-a-json-response-in-django/
# https://engineertodeveloper.com/how-to-use-ajax-with-django/

def weather_data_json(request):
    """Weather forecast API that returns the forecast as JSON"""

    try:
        # Get a QuerySets of dictionaries according to the provided values
        forecast_query_set = Forecast.objects.all().values("dt", "dt_txt", "temp", "temp_min", "temp_max", "weather_main", "weather_icon", "pop")
        # Convert the QuerySet to a list of dictionaries
        forecast_list = list(forecast_query_set)

        # Get last weather object of the current weather table, which is also the latest    
        last_weather_obj = CurrentWeather.objects.filter(dt__gt=0).last()
        # Query current weather data by filtering for timestamp value
        # We'll be receiving a QuerySet that contains only one object. 
        # However, we require a QuerySet so that we can actually chain the forecast and current weather information  
        weather_query_set = CurrentWeather.objects.filter(dt=last_weather_obj.dt).values()

        # Chain both QuerySets - forecast and current weather information 
        result_list = list(chain(forecast_list, weather_query_set))
        result_data = json.dumps(result_list)

        return HttpResponse(result_data, content_type="application/json")
    except Exception as e:
         # Instead of using "HttpResponseNotFound", use Http404 instead
        # To use this function a 404.html must be globally defined
        # https://docs.djangoproject.com/en/4.0/topics/http/views/#the-http404-exception
        print(e)
        raise Http404()



