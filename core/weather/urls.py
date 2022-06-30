from django.conf.urls import path
from . import views

urlpatterns = [
    path("weather_forecast/", views.ForecastPage.as_view())
]