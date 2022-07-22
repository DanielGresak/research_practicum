from django.urls import path
from . import views

urlpatterns = [
    path(
            "prediction/<str:line_id>/<str:direction>/<int:traveltime>/",
            views.predict_travel_time, name="api_prediction")
]
