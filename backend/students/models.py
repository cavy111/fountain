import uuid
from django.db import models
from django.utils import timezone
from datetime import date


def get_today():
    return date.today()


class Student(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    reg_number = models.CharField(max_length=50, unique=True)
    form = models.CharField(max_length=10)
    stream = models.CharField(max_length=10)
    guardian_name = models.CharField(max_length=100)
    guardian_phone = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    enrolled_on = models.DateField(default=get_today)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Class(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    form_level = models.CharField(max_length=10)
    stream = models.CharField(max_length=10)
    academic_year = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class FeePayment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    amount_usd = models.DecimalField(max_digits=10, decimal_places=2)
    amount_zwl = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50)
    term = models.CharField(max_length=20)
    academic_year = models.IntegerField()
    paid_on = models.DateField()
    receipt_number = models.CharField(max_length=50)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student} - ${self.amount_usd}"
