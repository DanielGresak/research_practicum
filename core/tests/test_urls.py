from django.test import SimpleTestCase
from django.urls import reverse, resolve
from core.views import home

# Test each page in urlpatterns
class TestUrls(SimpleTestCase):

    def test_home_url_is_resolved(self):
        #Reverse gets the url with the name 'homepage' from urls.py
        url = reverse('homepage')
        print(resolve(url))
        print(home)
        self.assertEquals(resolve(url).func, home)