from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User

class ViewTests(TestCase):
    def setUp(self):
        self.home_url = reverse("homepage")
        self.login_url = reverse("login")
        self.logout_url = reverse("logout")
        self.register_url = reverse("register")
        self.carbon_cal_url = reverse("carbon_calculator")
        self.carbon_get_url = reverse("get_carbon")

        self.user = {
            "userEmail": "testemail@email.com",
            "userPassword": "password123",
        }

        self.user_incorrect_password = {
            "userEmail": "testemail@email.com",
            "userPassword": "password12"

        }

        self.unregistered_user = {
            "userEmail": "testemsfsfsdgsadasdasdail@email.com",
            "userPassword": "passworasdasdasdasdasdasdasdd123"
        }
    

    def test_homepage(self):
        response = self.client.get(self.home_url)
        self.assertEqual(response.status_code, 200)

class UserTests(ViewTests):
    def test_register_and_login(self):
        self.client.post(self.register_url, self.user, format="text/html")
        user = User.objects.filter(email=self.user["userEmail"]).first()
        user.is_active = True
        user.save()
        response = self.client.post(self.login_url, self.user, format="text/html")
        self.assertEqual(response.status_code, 204)

    def test_no_account(self):
        response = self.client.post(self.login_url, self.unregistered_user, format="text/html")
        self.assertEqual(response.status_code, 401)

    def test_wrong_password(self):
        self.client.post(self.register_url, self.user, format="text/html")
        user = User.objects.filter(email=self.user["userEmail"]).first()
        user.is_active = True
        user.save()
        response = self.client.post(self.login_url, self.user_incorrect_password, format="text/html")
        self.assertEqual(response.status_code, 401)
    

 