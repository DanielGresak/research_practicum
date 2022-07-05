from django.shortcuts import render
# from sympy import re
from django.core.exceptions import BadRequest
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
#csrf is checking if cookies have been accepted. We can add a cookie pop up later

@csrf_exempt
def CarbonCalculator(request):
    if request.method == 'POST':
        co2_to_add = int(request.POST.get('value', False))
        print(request.POST)
        if 'co2' in request.session:
            request.session['co2'] += co2_to_add 
        else:
            request.session['co2'] = co2_to_add
    else:
        raise BadRequest('Invalid request.')
    return HttpResponse(status=204)


def ReturningCarbonData(request):
    if 'co2' in request.session:
        data = request.session['co2'] 
    else:
        data = 0
    
    responseData = {
        'co2_saved': data
    }

    return JsonResponse(responseData)