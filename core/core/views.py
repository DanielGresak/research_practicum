from django.shortcuts import render
import os
from django.views.decorators.csrf import csrf_exempt
#csrf is checking if cookies have been accepted. We can add a cookie pop up later

@csrf_exempt
def home(request):

    # All in if/else block is for testing
    if request.session.test_cookie_worked():
        request.session.delete_test_cookie()
        
    else:
        request.session.set_test_cookie()
        
        
    return render(request, "core/index.html", context={"GOOGLE_MAPS_KEY": os.environ.get("GOOGLE_MAPS_KEY")})

