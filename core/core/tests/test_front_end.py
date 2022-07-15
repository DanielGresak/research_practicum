# from django.test import LiveServerTestCase
# from selenium import webdriver
# from selenium.webdriver.common.keys import Keys
# from webdriver_manager.chrome import ChromeDriverManager
# import time
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC
# from selenium.webdriver.common.by import By
# flake8: noqa


# class FrontEndTestCase(LiveServerTestCase):

#     def setUp(self):
#         self.selenium = webdriver.Chrome(ChromeDriverManager().install())
#         super(FrontEndTestCase, self).setUp()

#     def tearDown(self):
#         self.selenium.quit()
#         super(FrontEndTestCase, self).tearDown()
    
#     def test_form(self):
#         selenium = self.selenium
#         selenium.get("http://127.0.0.1:8000")

#         starting_point = selenium.find_element("id", "search_start")
#         end_point = selenium.find_element("id", "search_destination")
#         button = selenium.find_element("id", "btn")

#         starting_point.send_keys("Dublin, Ireland")
#         end_point.send_keys("tallaght, Ireland")
        
#         button.send_keys(Keys.RETURN)
#         time.sleep(3)
#         bus_time = selenium.find_element("id", "time")
#         print(bus_time.get_attribute('innerHTML'))
#         self.assertIsNotNone(bus_time.get_attribute('innerHTML'))
#         # https://stackoverflow.com/questions/12323403/how-do-i-find-an-element-that-contains-specific-text-in-selenium-webdriver-pyth
#         # emission_button = selenium.find_element("xpath", "//*[contains(text(), 'Add to emissions')]")
#         # emission_button = selenium.find_element("class_name", "emissions-btn")
#         emission_button = selenium.find_element(By.CLASS_NAME, "emissions-btn")
#         emission_button.send_keys(Keys.RETURN)

#         # https://stackoverflow.com/questions/61859356/how-to-click-the-ok-button-within-an-alert-using-python-selenium
#         WebDriverWait(selenium, 10).until(EC.alert_is_present())
#         selenium.switch_to.alert.accept()

#         emissions_toolbar = selenium.find_element("xpath", "//a[@data-value='co2']")
#         emissions_toolbar.click()
#         time.sleep(1)
#         emissions_text = selenium.find_element(By.CLASS_NAME, "co2-saved")
#         # print("printing ", emissions_text.text)
#         self.assertNotEqual(emissions_text.text, "No savings yet, take a trip and save some emissions!")


#     # def test_login(self):
#     #     selenium = self.selenium
#     #     selenium.get("http://127.0.0.1:8000")
#     #     time.sleep(1)
#         # user_button = selenium.find_element("xpath", "//a[@data-value='user']")
#     #     user_button.click()
#     #     time.sleep(1)
#     #     email_input = selenium.find_element("id", "register-email")
#     #     password_input = selenium.find_element("id", "register-password")
#     #     confirm_password_input = selenium.find_element("id", "confirm-register-password")

#     #     email_input.send_keys("testingaccount@testing.com")
#     #     password_input.send_keys("123456")
#     #     confirm_password_input.send_keys("123456")

#     #     register_button = selenium.find_element(By.NAME, "register-button")
#     #     # selenium.execute_script("$('#register-button').click()")
#     #     register_button.click()
#     #     # register_button.send_keys(Keys.RETURN)
#     #     time.sleep(10)
#     #     # https://stackoverflow.com/questions/61859356/how-to-click-the-ok-button-within-an-alert-using-python-selenium
#     #     # WebDriverWait(selenium, 10).until(EC.alert_is_present())
#     #     # selenium.switch_to.alert.accept()

#     #     logout_button = selenium.find_element("id", "logout-button")
#     #     logout_button.is_displayed
#     #     self.assertTrue(logout_button.is_displayed)

        




