from django.shortcuts import render
import os

def home(request):
    return render(request, "core/index.html", context={"GOOGLE_MAPS_KEY": os.environ.get("GOOGLE_MAPS_KEY")})
