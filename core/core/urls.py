from django.contrib import admin
from django.urls import path
from django.urls import include

from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='homepage'),
    path('', include('weather.urls')),
    path('data/', views.data, name='stopsData'),
    path('', include('carbonCalculator.urls')),
    path('', include("users.urls")),
]
