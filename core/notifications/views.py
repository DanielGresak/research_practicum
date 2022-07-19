# from django.shortcuts import render

import os
import smtplib
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from django.http import HttpResponse
from twilio.rest import Client


def add_route_for_notification(request):
    if request.method == "POST":
        email = "daniel.gresak91@gmail.com"  # Will be user email
        scheduler = BackgroundScheduler()
        bus = request.POST.get("bus")
        time = int(request.POST.get("time")) / 1000
        minutes = request.POST.get("minutes")
        scheduler.add_job(send_notification,
                          "date",
                          run_date=datetime.fromtimestamp(int(time)),
                          args=[bus, minutes, email])
        scheduler.start()
        return HttpResponse(status=204)
    else:
        HttpResponse(status=400)


def email(send_to, bus, minutes):
    subject = "Your bus is due!"
    message = create_message(bus, minutes)
    my_email = "busapplicationucd@gmail.com"
    gmail = "smtp.gmail.com"
    password = os.environ.get('EMAIL_PASSWORD')
    try:
        with smtplib.SMTP(gmail) as connection:
            connection.starttls()
            connection.login(user=my_email, password=password)
            connection.sendmail(from_addr=my_email,
                                to_addrs=send_to,
                                msg=f"Subject:{subject}\n\n{message}")
        print("Sent successfully")
    except Exception as e:
        print(e)


def send_sms(send_to, bus, minutes):
    message_body = f"The {bus} bus is {minutes} minutes away!"
    account_sid = os.environ.get('TWILIO_SID')
    auth_token = os.environ.get('TWILIO_AUTH')
    client = Client(account_sid, auth_token)
    message = client.messages.create(
        body=message_body,
        from_="+18305875212",
        to="+353857415917"
    )


def create_message(bus, minutes):
    message = f"The {bus} bus is {minutes} minutes away from your stop!"
    return message


def send_notification(bus, minutes, user_email):
    email(user_email, bus, minutes)
    # Commented out as there is limited credit. but works!
    # send_sms(user_email, bus, minutes)
