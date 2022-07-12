from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, logout, login
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
from users.models import Profile
from django.contrib.auth.decorators import login_required
# from sympy import re

def registerUser(request):
    
    if request.method == 'POST':
        
        user_email = request.POST.get("userEmail")
        user_password = request.POST.get("userPassword")
        if username_exists(user_email):
            user = authenticate(request, username=user_email, password=user_password)
            if user is not None and user.is_authenticated:
                login(request, user)
                return HttpResponse(status=204)
            else:
                return HttpResponse(status=401)
        else:
            if 'co2' in request.session:
                emissions = request.session["co2"]
                print(emissions)
            else:
                emissions = 0
            user = User.objects.create_user(email=user_email, username=user_email, password=user_password)
            profile = Profile.objects.create(user=user)
            current_user_emissions = user.profile
            current_user_emissions.emissions = emissions
            profile.save()
            user.save()
            user = authenticate(request, username=user_email, password=user_password)
            login(request, user)
            return HttpResponse(status=204)


def loginUser(request):
    if request.method == 'POST':
        user_email = request.POST.get("userEmail")
        user_password = request.POST.get("userPassword")
        user = authenticate(request, username=user_email, password=user_password)
        if user is not None and user.is_authenticated:
            login(request, user)
            return HttpResponse(status=204)
        else:
            return HttpResponse(status=401)
    return HttpResponse(status=404)


def logoutUser(request):
    
    logout(request)
    
    return HttpResponse(status=204)

def username_exists(username):
    return User.objects.filter(username=username).exists()

# https://stackoverflow.com/questions/33715879/how-to-delete-user-in-django
@login_required
def delete_user(request):
    try:
        u = request.user
        u.delete()
        return HttpResponse(status=204)           

    except User.DoesNotExist:
        return HttpResponse(status=404)

    except Exception as e: 
        return HttpResponse(status=401)