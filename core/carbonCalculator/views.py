from django.shortcuts import render
# from sympy import re
from django.core.exceptions import BadRequest
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
#csrf is checking if cookies have been accepted. We can add a cookie pop up later

"""
Best way I found so far to calculate co2 saved is to take the information found in this article

https://www.bbc.com/future/article/20200317-climate-change-cut-carbon-emissions-from-your-commute

This shows the average car emits 180g per km vs the bus which is 82g.
BEIS Conversion factors 2019/Javier Hirschfeld
this is based in the UK so would obviously need to be taken with a grain of salt and we can put
a caviat on the page too.
https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
Here is the study on this.
"""

@csrf_exempt
def CarbonCalculator(request):
    if request.method == 'POST':
        distance = int(request.POST.get('value', False))

        saved = calculate(distance)

        print(request.POST)
        if 'co2' in request.session:
            request.session['co2'] += saved 
        else:
            request.session['co2'] = saved
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

def calculate(distance):
    saved = int(98 * (distance / 1000))
    return saved
