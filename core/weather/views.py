import json
from MySQLdb import Timestamp
from django.http import HttpResponse
from django.shortcuts import render
from weather.models import Forecast, CurrentWeather
from django.core.serializers import serialize

# Create your views here.

# Example are given here: 
# https://engineertodeveloper.com/how-to-return-a-json-response-in-django/
# https://engineertodeveloper.com/how-to-use-ajax-with-django/

def weather_data_json(request):
    """Weather forecast API that returns the forecast as JSON"""

    # Get a QuerySets of dictionaries according to the provided values
    forecast_query_set = Forecast.objects.all().values("dt", "dt_txt", "temp", "temp_min", "temp_max", "weather_main", "weather_icon", "pop")
    # Convert the QuerySet to a list of dictionaries
    forecast_list = list(forecast_query_set)
    # Convert list of dictionaries to JSON
    forecast_data = json.dumps(forecast_list)
    
    return HttpResponse(forecast_data, content_type="application/json")


# class ForecastPage(TemplateView):
#     # Define the template name
#     template_name = 'weather_forecast.html'

#     def get(self, request, *args, **kwargs):

#         # Instantiate weather forecast object which latest entity (tuple)
#         # 'dt' is the datetime attribute
#         latest_entity = Forecast.objects.latest('dt')

#         timestamp = "{t.year}/{t.month:02d}/{t.day:02d} - {t.hour:02d}:{t.minute:02d}:{t.second:02d}".format(t=latest_entity.dt)
#         weather_icon = latest_entity.weather_icon
#         # pop - probability of precipitation. The values of the parameter vary between 0 and 1, where 0 is equal to 0%, 1 is equal to 100%
#         # So let's multiply it with 100 to display it in %
#         pop_percentage = latest_entity.pop * 100

#         # Let's create the dynamic content that will be displayed on the web page
#         content = {
#             'temp': latest_entity.temp,
#             'temp_min': latest_entity.temp_min,
#             'temp_max': latest_entity.temp_max,
#             'weather_main': latest_entity.weather_main,
#             'weather_description': latest_entity.weather_description,
#             'weather_icon': latest_entity.weather_icon,
#             'propability_of_precipitation': pop_percentage,
#             'timestamp': timestamp}

#         return render(request, self.template_name, content)


