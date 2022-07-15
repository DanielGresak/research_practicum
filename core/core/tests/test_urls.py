from django.test import SimpleTestCase
from django.urls import reverse, resolve

from core.views import home
from carbonCalculator.views import CarbonCalculator, ReturningCarbonData
from users.views import loginUser, logoutUser, registerUser, delete_user
from weather.views import weather_data_json
from django.contrib.auth import login
from django.contrib.auth.models import User
# Test each page in urlpatterns


class TestUrls(SimpleTestCase):

    def test_home_url_is_resolved(self):
        # Reverse gets the url with the name 'homepage' from urls.py
        url = reverse('homepage')
        self.assertEquals(resolve(url).func, home)
    
    def test_cal_carbon_url_is_resolved(self):
        url = reverse('carbon_calculator')
        self.assertEquals(resolve(url).func, CarbonCalculator)
    
    def test_get_carbon_url_is_resolved(self):
        url = reverse('get_carbon')
        self.assertEquals(resolve(url).func, ReturningCarbonData)
    
    def test_login_url_is_resolved(self):
        url = reverse('login')
        self.assertEquals(resolve(url).func, loginUser)
    
    def test_logout_url_is_resolved(self):
        url = reverse('logout')
        self.assertEquals(resolve(url).func, logoutUser)

    def test_register_url_is_resolved(self):
        url = reverse('register')
        self.assertEquals(resolve(url).func, registerUser)
    
    def test_weather_url_is_resolved(self):
        url = reverse('ajax_weather')
        self.assertEquals(resolve(url).func, weather_data_json)
    
    # def test_delete_user_url_is_resolved(self):
    #     user = {
    #         "userEmail": "temp@temp",
    #         "userPassword": "123",
    #     }
    #     register_url = reverse('register')
    #     self.client.post(register_url, user, format="text/html")
    #     temp_user = User.objects.filter(email=user["userEmail"]).first()
    #     temp_user.is_active = True
    #     temp_user.save()
    #     # self.client.post(self.login_url,user, format="text/html")
    #     login(temp_user)
    #     url = reverse('delete_user')
    #     self.assertEquals(resolve(url).func, delete_user)
    