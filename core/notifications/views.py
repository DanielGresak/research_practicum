# from django.shortcuts import render

import os
import smtplib
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from django.http import HttpResponse
from twilio.rest import Client
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def add_route_for_notification(request):
    if request.method == "POST":
        if (request.user.is_authenticated and
           request.user.profile.notifications):
            user_profile = request.user.profile
            email = request.user.email
            delay = user_profile.notification_delay * 60

            scheduler = BackgroundScheduler()
            bus = request.POST.get("bus")
            time = int(float(request.POST.get("time"))) / 1000
            sending_time = time - delay
            # For testing purposes
            sending_time += 360
            sending_time = int(sending_time)
            scheduler.add_job(send_notification,
                              "date",
                              run_date=datetime.fromtimestamp(sending_time),
                              args=[bus, delay, email])
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
        print("Email sent successfully!")
    except Exception as e:
        print(e)


def send_sms(send_to, bus, minutes):
    """Sends to my number as we would need
    the paid version to send to other numbers"""
    message_body = create_message(bus, minutes)
    account_sid = os.environ.get('TWILIO_SID')
    auth_token = os.environ.get('TWILIO_AUTH')
    client = Client(account_sid, auth_token)
    client.messages.create(
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


def notification_toggle(request):
    if request.user.is_authenticated:
        current_user = request.user.profile
        print(current_user.__dict__)
        if (current_user.notifications):
            current_user.notifications = False
            current_user.save()
            return HttpResponse(status=204)
        else:
            current_user.notifications = True
            current_user.save()
            return HttpResponse(status=204)

    else:
        return HttpResponse(status=401)


@csrf_exempt
def change_delay(request):
    if request.method == "POST":
        if request.user.is_authenticated:
            current_user = request.user.profile
            current_user.notification_delay = int(request.POST.get("delay"))
            current_user.save()
            return HttpResponse(status=204)

        else:
            return HttpResponse(status=401)
    else:
        return HttpResponse(status=400)
