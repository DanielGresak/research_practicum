from django.apps import AppConfig


class WeatherConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'weather'

    # We need to let Django know that it needs to initiate our backgroundUpdater during the startup
    # Therefore, we override the ready method to kick off our updater function
    def ready(self):
        # Note: This import must be placed within the method due to the inheritance
        from weatherUpdater import backgroundUdpater
        backgroundUdpater.start()