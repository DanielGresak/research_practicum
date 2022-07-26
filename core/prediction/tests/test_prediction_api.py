"""
Tests for travel time predictions.
"""

from datetime import datetime, timedelta
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse
from weatherUpdater import weatherForecastApi


def prediction_url(*args):
    """Create and return a prediction URL"""

    args_list = []
    for a in args:
        args_list.append(a)
    return reverse('api_prediction', args=args_list)


class PredictionAPITests(APITestCase):
    """Test travel time predictions"""

    def setUp(self):
        # By default, running Django tests creates a blank test database.
        # However, to run our tests we actually need to query existing data
        # from an real mySQL database. So that's why we need to create and
        # update our databes first before running the tests.
        weatherForecastApi.update_weather_forecast()
        weatherForecastApi.update_current_weather()

        self.dt_now = datetime.now()
        # Note: to simulate the timestamp provided by the JavaScript
        # GET request, we multiply it by 1000 to get milliseconds
        self.ts_now = round(datetime.timestamp(self.dt_now)*1000)

    def test_valid_current_datetime(self):
        """Test GET request using a valid current datetime"""

        url = prediction_url("46A", "inbound", self.ts_now)
        response = self.client.get(url, format='json')
        self.assertTrue(
                response.data,
                {'request_info': {'UTC_timestamp': self.ts_now}})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_valid_future_datetime(self):
        """Test GET request using a valid datetime in the future"""

        # Note: Timestamp is multiplied by 1000 to get milliseconds,
        # because that's the way it's received from JavaScript via the API
        td_delta = self.dt_now + timedelta(days=3)
        ts = round(datetime.timestamp(td_delta)*1000)
        url = prediction_url("46A", "inbound", ts)
        response = self.client.get(url, format='json')
        self.assertTrue(
                response.data,
                {'request_info': {'UTC_timestamp': ts}})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_invalid_datetime_format(self):
        """Test invalid GET request, using a invalid datetime format"""

        # Note: In this case we pass the timestamp in seconds to provoke
        # a failure as we expect the timstamp in milliseconds
        ts = round(datetime.timestamp(self.dt_now))
        url = prediction_url("46A", "inbound", ts)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_future_datetime(self):
        """Test invalid GET request, using a invalid datetime in the future"""

        # Let's test the response if we request a prediction where
        # the datetime lies too far in the future
        # Note: The database holds the forecast only up to 5 days
        td_delta = self.dt_now + timedelta(days=6)
        ts = round(datetime.timestamp(td_delta)*1000)
        url = prediction_url("46A", "inbound", ts)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_past_datetime(self):
        """Test invalid GET request, using a invalid datetime in the past"""

        # Note: In this case pass a timestamp that lies too far in the past,
        # provoking a bad request status
        ts = round(datetime.timestamp(self.dt_now))
        url = prediction_url("46A", "inbound", ts - 300000)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_line_id(self):
        """Test invalid GET request, using a invalid line id"""

        # Note: In this case we pass a line id that doesn't exist
        url = prediction_url("999A", "inbound", self.ts_now)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_direction(self):
        """Test invalid GET request, using a invalid line id"""

        # Note: In this case we pass a direction that isn't defined
        url = prediction_url("46A", "noidea", self.ts_now)
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
