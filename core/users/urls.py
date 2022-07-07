
from django.urls import path

from . import views

urlpatterns=[
  path('login',views.loginUser),
  path("register", views.registerUser),
  path("logout", views.logoutUser),
]