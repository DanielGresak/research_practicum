from sqlalchemy import create_engine
import requests
import json
import mysql.connector
from pprint import pprint

# Get the json data of the weather
APIKEY = "5eee6c67058ecc7bbdd42cf711cae8eb"
APICall = 'https://api.openweathermap.org/data/2.5/weather?q=Dublin,IE&appid=5eee6c67058ecc7bbdd42cf711cae8eb'
r = requests.get(APICall)
json_weather = json.loads(r.text)
# pprint(json_weather)
s
