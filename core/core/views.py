from django.shortcuts import render
from django.http import JsonResponse
# from django.contrib.staticfiles import finders
import json
import os
# csrf is checking if cookies have been accepted.
# We can add a cookie pop up later


def home(request):
    # return render(request, "core/index.html",
    # ontext={"GOOGLE_MAPS_KEY": os.environ.get("GOOGLE_MAPS_KEY")})
    # All in if/else block is for testing
    if request.user.is_authenticated:
        logged_in = True
        current_user = request.user.profile
        notifications = current_user.notifications
        notification_delay = current_user.notification_delay
        age = current_user.age
    else:
        logged_in = False
        notifications = False
        notification_delay = 0
        if 'age' in request.session:
            age = request.session["age"]
        else:
            age = "adult"
    return render(request, "core/index.html",
                  context={"GOOGLE_MAPS_KEY": os.environ.get("GOOGLE_MAPS_KEY"),  # noqa
                  "loggedIn": logged_in,
                  "notifications": notifications,
                  "delay": notification_delay,
                  "age": age})


def travelTime_json(request):
    travelTimeJsonFile = os.path.join(
            os.getcwd(), "static", "data", "travelTimeProportion.json")
    with open(travelTimeJsonFile) as json_file:
        travelTimeProportion_dic = json.load(json_file)
        return JsonResponse(travelTimeProportion_dic)


def stops_json(request):
    stopsJsonFile = os.path.join(os.getcwd(), "static", "data", "stops.json")
    with open(stopsJsonFile) as json_file:
        stops_dic = json.load(json_file)
        return JsonResponse(stops_dic)
