from django.urls import path
from notifications import views

urlpatterns = [
    path("add_notification", views.add_route_for_notification, name="notify"),
    
]
