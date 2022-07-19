from django.urls import path, register_converter
from .converters import DateTimeConverter
from . import views

# register_converter(DateTimeConverter, 'datetime')

urlpatterns = [
    # path("prediction/<int:line_id>/<str:direction>/", views.predict_travel_time, name="api_prediction")
    # path("prediction/<int:line_id>/<str:direction>/<datetime:traveltime>/", views.predict_travel_time, name="api_prediction")
    path("prediction/<int:line_id>/<str:direction>/<int:traveltime>/", views.predict_travel_time, name="api_prediction")
    # path("prediction/", views.predict_travel_time, name="api_prediction")
]