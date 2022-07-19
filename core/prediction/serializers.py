from rest_framework import serializers
from weather.models import CurrentWeather


class ForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurrentWeather
        fields = ('dt', 'wind_speed', 'clouds', 'rain_1h')
        