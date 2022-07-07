from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, logout, login
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
# from sympy import re

@csrf_exempt
def registerUser(request):
    
    if request.method == 'POST':
        user_email = request.POST.get("userEmail")
        user_password = request.POST.get("userPassword")
        if username_exists(user_email):
            user = authenticate(email=user_email, username=user_email, password=user_password)
            if user is not None:
                return HttpResponse(status=204)
            else:
                return HttpResponse(status=401)
        else:
            user = User.objects.create_user(email=user_email, username=user_email, password=user_password)
            user.save()
            return HttpResponse(status=204)

@csrf_exempt
def loginUser(request):
    if request.method == 'POST':
        user_email = request.POST.get("userEmail")
        user_password = request.POST.get("userPassword")
        user = authenticate(email=user_email, username=user_email, password=user_password)
        if user is not None and user.is_authenticated:
            
            login(request, user)
            return HttpResponse(status=204)
        else:
            return HttpResponse(status=401)
    return HttpResponse(status=404)

@csrf_exempt
def logoutUser(request):
    
    logout(request)
    return HttpResponse(status=204)

def username_exists(username):
    return User.objects.filter(username=username).exists()