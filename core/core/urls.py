"""core URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

from django.contrib import admin
from django.urls import path
from django.urls import include

from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='homepage'),
    path('', include('weather.urls')),
    path('data/stops/', views.stops_json, name='stopsData'),
    path(
            'data/travelTimeProportion/', views.travelTime_json,
            name='travelTimeProportionJson'),
    path('', include('carbonCalculator.urls')),
    path('', include("users.urls")),
    path('', include("notifications.urls")),
    path('', include('prediction.urls')),
    path(
        'api-auth/',
        include('rest_framework.urls', namespace='rest_framework')),

    # To enable the automated documentation of APIs we're adding:
    # 'api/schema' will generate the schema four our API,
    # which is the YAML file that describes the API
    path('api/schema', SpectacularAPIView.as_view(), name='api-schema'),
    # 'api/docs/' will serve the swagger documentation tool that is going to
    # use schema to generate a graphical user interface
    # for our API documentation
    path(
        'api/docs/',
        SpectacularSwaggerView.as_view(url_name='api-schema'),
        name='api-docs',
    ),
]
