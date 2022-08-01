from django.db import models

# # Create your models here.
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    emissions = models.FloatField(default=0.0)
    notifications = models.BooleanField(default=False)
    notification_delay = models.IntegerField(default=5)
    age = models.TextField(default="adult")
