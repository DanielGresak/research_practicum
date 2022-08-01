from django.contrib import admin

# Register your models here.
from users.models import Profile
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin

# https://www.youtube.com/watch?v=kRJpQxi2jIo&ab_channel=JimShapedCoding


class AccountInLine(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural: "Profiles" # noqa


class ProfileAdmin(UserAdmin):
    inlines = (AccountInLine, )


admin.site.unregister(User)
admin.site.register(User, ProfileAdmin)
