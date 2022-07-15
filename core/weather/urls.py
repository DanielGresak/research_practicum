from django.urls import path
from weather import views

urlpatterns = [
    path("weather/", views.weather_data_json, name="ajax_weather")
]
