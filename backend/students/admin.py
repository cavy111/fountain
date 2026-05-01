from django.contrib import admin
from .models import Student, Class, FeePayment

# Register your models here.
admin.site.register(Student)
admin.site.register(Class)
admin.site.register(FeePayment)
