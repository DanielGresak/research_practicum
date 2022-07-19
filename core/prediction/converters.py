from datetime import datetime

# see https://stackoverflow.com/questions/70768547/how-to-pass-date-and-id-through-url-in-django
class DateTimeConverter:
    regex = '\d{4}-\d{1,2}-\d{1,2} \d{2}:\d{2}:\d{2}'
    format = '%Y-%m-%d %H:%M:%S'

    def to_python(self, value):
        dt_UTC = datetime.fromtimestamp(value)
        return dt_UTC
#        return datetime.strptime(value, self.format).date()

    def to_url(self, value):
        return value.strftime(self.format)