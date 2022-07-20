from rest_framework.test import APITestCase
from users.models import Profile
from django.contrib.auth.models import User
from django.test import TestCase


class TestModel(TestCase):
    def test_create_profile(self):
        test_user = User.objects.create(email="test_user@gmail.com",
                                        username="test_user@gmail.com",
                                        password="password123")
        profile = Profile.objects.create(user=test_user)
        current_user = test_user.profile
        current_user.emissions = 100
        profile.save()
        test_user.save()
        self.assertIsInstance(test_user, User)
        self.assertIsInstance(profile, Profile)
        self.assertEqual(test_user.email, "test_user@gmail.com")
        self.assertEqual(profile.emissions, 100)
