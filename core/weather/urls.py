from django.urls import path
from weather import views

urlpatterns = [
    path("weather_forecast/", views.ForecastPage.as_view())
]