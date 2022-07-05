from django.urls import path
from carbonCalculator import views

urlpatterns = [
    path("carbon/", views.CarbonCalculator),
    path("carbon/get/", views.ReturningCarbonData),
]