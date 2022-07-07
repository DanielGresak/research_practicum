from django.test import LiveServerTestCase
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
import time


class FrontEndTestCase(LiveServerTestCase):

    def setUp(self):
        
        self.selenium = webdriver.Chrome(ChromeDriverManager().install())
        super(FrontEndTestCase, self).setUp()

    def tearDown(self):
        self.selenium.quit()
        super(FrontEndTestCase, self).tearDown()
    
    def test_form(self):
        selenium = self.selenium
        selenium.get("http://127.0.0.1:8000")

        starting_point = selenium.find_element("id", "search_start")
        end_point = selenium.find_element("id", "search_destination")
        button = selenium.find_element("id", "btn")

        starting_point.send_keys("Dublin, Ireland")
        end_point.send_keys("tallaght, Ireland")
        
        button.send_keys(Keys.RETURN)
        time.sleep(3)
        bus_time = selenium.find_element("id", "time")
        print(bus_time.get_attribute('innerHTML'))
        self.assertIsNotNone(bus_time.get_attribute('innerHTML'))
