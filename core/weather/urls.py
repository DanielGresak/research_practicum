from django.urls import path
from weather import views

urlpatterns = [
    path("weather/", views.forecaset_models_json, name="ajax_forecast")
]