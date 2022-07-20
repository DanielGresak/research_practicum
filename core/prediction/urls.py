from django.urls import path, register_converter
from .converters import DateTimeConverter
from . import views

# register_converter(DateTimeConverter, 'datetime')

urlpatterns = [
    path("prediction/<str:line_id>/<str:direction>/<int:traveltime>/", views.predict_travel_time, name="api_prediction")
]