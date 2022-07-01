from MySQLdb import Timestamp
from django.shortcuts import render
from django.views.generic import TemplateView
from weather.models import Forecast

# Create your views here.
class ForecastPage(TemplateView):
    # Define the template name
    template_name = 'weather_forecast.html'

    def get(self, request, *args, **kwargs):

        # Instantiate weather forecast object which latest entity (tuple)
        # 'dt' is the datetime attribute
        latest_entity = Forecast.objects.latest('dt')

        timestamp = "{t.year}/{t.month:02d}/{t.day:02d} - {t.hour:02d}:{t.minute:02d}:{t.second:02d}".format(t=latest_entity.dt)
        weather_icon = latest_entity.weather_icon
        # pop - probability of precipitation. The values of the parameter vary between 0 and 1, where 0 is equal to 0%, 1 is equal to 100%
        # So let's multiply it with 100 to display it in %
        pop_percentage = latest_entity.pop * 100

        # Let's create the dynamic content that will be displayed on the web page
        content = {
            'temp': latest_entity.temp,
            'temp_min': latest_entity.temp_min,
            'temp_max': latest_entity.temp_max,
            'weather_main': latest_entity.weather_main,
            'weather_description': latest_entity.weather_description,
            'weather_icon': latest_entity.weather_icon,
            'propability_of_precipitation': pop_percentage,
            'timestamp': timestamp}

        return render(request, self.template_name, content)


