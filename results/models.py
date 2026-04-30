import uuid
from django.db import models
from students.models import Student
from attendance.models import Subject


class Result(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    term = models.CharField(max_length=20)
    academic_year = models.IntegerField()
    mark = models.DecimalField(max_digits=5, decimal_places=2)
    grade = models.CharField(max_length=5)
    class_position = models.IntegerField()
    teacher_comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student} - {self.subject} - {self.grade}"
