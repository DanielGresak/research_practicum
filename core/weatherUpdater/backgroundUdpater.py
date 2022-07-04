from datetime import datetime
from sched import scheduler
import time
import os

from apscheduler.schedulers.background import BackgroundScheduler
from weatherUpdater import weatherForecastApi

def start():
    job_scheduler = BackgroundScheduler()
    # We've got 1,000 API calls for free, meaning that we'll have 720 calls per day to our disposal
    job_scheduler.add_job(weatherForecastApi.update_weather_forecast, 'interval', minutes=10)
    job_scheduler.start()

