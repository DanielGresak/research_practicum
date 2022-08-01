from django.urls import path
from carbonCalculator import views

urlpatterns = [
    path("carbon/", views.CarbonCalculator, name="carbon_calculator"),
    path("carbon/get/", views.ReturningCarbonData, name="get_carbon"),
]
