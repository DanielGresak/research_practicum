from django.urls import path
from notifications import views

urlpatterns = [
    path("add-notification", views.add_route_for_notification, name="notify"),
    path("change_notification_settings",
         views.notification_toggle,
         name="toggle_notify"),
    path("change_delay", views.change_delay, name="change_delay"),
]
