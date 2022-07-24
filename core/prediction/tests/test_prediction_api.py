"""
Tests for travel time predictions.
"""

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from django.urls import reverse


def prediction_url(line_id, direction, traveltime):
    """Create and return a prediction URL"""
    return reverse('prediction/', args=[line_id, direction, traveltime])


class PredictionAPITests(TestCase):
    """Test travel time predictions"""

    def setUp(self):
        self.client = APIClient()

    def test_prediction_current_date(self):
        pass

