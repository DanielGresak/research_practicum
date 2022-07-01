from datetime import datetime
from sched import scheduler
import time
import os

from apscheduler.schedulers.background import BackgroundScheduler
from weatherUpdater import weatherForecastApi

def start():
    job_scheduler = BackgroundScheduler()
    # We've got 1,000 API calls for free, so if our interval is two minutes we'll end up with 720 calls per day
    job_scheduler.add_job(weatherForecastApi.update_weather_forecast, 'interval', minutes=2)
    job_scheduler.start()

