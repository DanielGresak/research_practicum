from django.db import models
from django.utils import timezone
from datetime import datetime

# Create your models here.
class Forecast(models.Model):
    # Timestamp - Time of data forecasted, unix, UTC 
    dt = models.BigIntegerField() 
    # Timestamp text - Timestamp as string "yyyy-mm-dd hh:mm:ss"
    dt_txt = models.CharField(max_length=50, default="")
    # Temperature
    temp = models.FloatField(default=0.0)
    # Min. temperature
    temp_min = models.FloatField(default=0.0)
    # Max. temperature
    temp_max = models.FloatField(default=0.0)
    # Humidity
    humidity = models.IntegerField(default=0)
    # Weather main
    weather_main = models.CharField(max_length=50)
    # Weather description
    weather_description = models.CharField(max_length=255)
    # Weather icon id
    weather_icon = models.CharField(max_length=255)
    # Clouds - Cloudiness in %
    clouds = models.IntegerField(default=0)
    # pop - Probability of precipitation. The values of the parameter vary between 0 and 1, where 0 is equal to 0%, 1 is equal to 100%
    pop = models.FloatField(default=0.0)
