from django.test import TestCase, RequestFactory
from django.urls import reverse
from django.contrib.auth.models import User
from weatherUpdater import weatherForecastApi
import time


class ViewTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.home_url = reverse("homepage")
        self.login_url = reverse("login")
        self.logout_url = reverse("logout")
        self.register_url = reverse("register")
        self.carbon_cal_url = reverse("carbon_calculator")
        self.carbon_get_url = reverse("get_carbon")
        self.weather_url = reverse("ajax_weather")
        self.delete_url = reverse("delete_user")
        self.notification_url = reverse("notify")
        self.notification_setting_url = reverse("toggle_notify")
        self.notification_delay_url = reverse("change_delay")
        self.update_notification_url = reverse("update_notifications")
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
        """ Test Homepage """
        response = self.client.get(self.home_url)
        self.assertEqual(response.status_code, 200)


class UserTests(ViewTests):
    def test_register_and_login(self):
        """ Test If user Can Register and Login"""
        self.client.post(self.register_url, self.user, format="text/html")
        user = User.objects.filter(email=self.user["userEmail"]).first()
        user.is_active = True
        user.save()
        response = self.client.post(self.login_url,
                                    self.user,
                                    format="text/html")
        self.assertEqual(response.status_code, 204)

    def test_no_account(self):
        """ Test if no Account Exists"""
        response = self.client.post(self.login_url,
                                    self.unregistered_user,
                                    format="text/html")
        self.assertEqual(response.status_code, 401)

    def test_wrong_password(self):
        """ Test If Wrong Password Used"""
        self.client.post(self.register_url, self.user, format="text/html")
        user = User.objects.filter(email=self.user["userEmail"]).first()
        user.is_active = True
        user.save()
        response = self.client.post(self.login_url,
                                    self.user_incorrect_password,
                                    format="text/html")
        self.assertEqual(response.status_code, 401)

    def test_delete_account(self):
        """ Test User Can Delete Account """
        self.client.post(self.register_url, self.user, format="text/html")
        user = User.objects.filter(email=self.user["userEmail"]).first()
        user.is_active = True
        user.save()
        self.client.post(self.login_url, self.user, format="text/html")
        response = self.client.get(self.delete_url,
                                   self.user,
                                   format="text/html")
        self.assertEqual(response.status_code, 204)


class WeatherTests(ViewTests):
    def test_weather_view(self):
        """ Test Weather is Updated """
        weatherForecastApi.update_weather_forecast()
        weatherForecastApi.update_current_weather()
        response = self.client.get(self.weather_url)
        self.assertEqual(response.status_code, 200)


class EmissionsTests(ViewTests):
    # def test_emissions_added_to_user(self)
    #     self.client.post(self.register_url, self.user, format="text/html")
    #     user = User.objects.filter(email=self.user["userEmail"]).first()
    #     user.is_active = True
    #     user.save()
    #     self.client.post(self.login_url, self.user, format="text/html")
    #     response = self.client.post()
    def test_get_emissions(self):
        """ Test Emmissions is Sent """
        response = self.client.get(self.carbon_get_url)
        self.assertEqual(response.status_code, 200)


class NotificationTests(ViewTests):
    def test_email(self):
        """ Test Email is Sent"""
        url = self.notification_url
        time_to_use = time.time() * 1000
        arguments = {
            "bus": "15",
            "time": time_to_use,
            "minutes": "5"
        }
        response = self.client.post(url, arguments, format="text/html")
        self.assertEqual(response.status_code, 204)

    def test_change_notification_setting(self):
        """Test User Changing Notification Preferences """
        url = self.notification_setting_url
        request = self.client.post(self.register_url,
                                   self.user,
                                   format="text/html")
        user = User.objects.get(username=self.user["userEmail"])
        self.assertFalse(user.profile.notifications)
        response = self.client.post(url, request, format="text/html")
        user = User.objects.get(username=self.user["userEmail"])
        self.assertEqual(response.status_code, 204)
        self.assertTrue(user.profile.notifications)

    def test_change_notification_delay(self):
        """ Test Notification Delay Change by User """
        url = self.notification_delay_url
        request = self.client.post(self.register_url,
                                   self.user,
                                   format="text/html")
        user = User.objects.get(username=self.user["userEmail"])
        self.assertEqual(user.profile.notification_delay, 5)
        request["delay"] = 10
        response = self.client.post(url, request, format="text/html")
        user = User.objects.get(username=self.user["userEmail"])
        self.assertEqual(response.status_code, 204)
        self.assertTrue(user.profile.notification_delay, 10)

    def test_notification_update(self):
        """Test Notification and User Information sent to front end """
        url = self.update_notification_url
        request = self.client.post(self.register_url,
                                   self.user,
                                   format="text/html")
        response = self.client.post(url, request, format="text/html")
        delay = response.json()["delay"]
        notification = response.json()["notificationOnOff"]
        email = response.json()["email"]
        self.assertEqual(email, self.user["userEmail"])
        self.assertEqual(delay, 5)
        self.assertEqual(notification, False)
        self.assertEqual(response.status_code, 200)
        