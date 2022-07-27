
from django.urls import path

from . import views

urlpatterns = [
  path('login', views.loginUser, name="login"),
  path("register", views.registerUser, name="register"),
  path("logout", views.logoutUser, name="logout"),
  path("delete", views.delete_user, name="delete_user"),
  path("update_age", views.change_age, name="update_age"),
]
