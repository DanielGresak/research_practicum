from django.shortcuts import render
import os
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
#csrf is checking if cookies have been accepted. We can add a cookie pop up later

@csrf_exempt
def home(request):

    # All in if/else block is for testing
    if request.user.is_authenticated:
        logged_in = True
    else:
        logged_in = False
    return render(request, "core/index.html", context={"GOOGLE_MAPS_KEY": os.environ.get("GOOGLE_MAPS_KEY"), "loggedIn": logged_in})

