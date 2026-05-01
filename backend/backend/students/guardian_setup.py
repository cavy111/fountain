from django.contrib.auth.models import User
from .models import Guardian, Student


def create_guardian_user(guardian_data):
    """
    Creates a Django User with the guardian's email as username and a provided password.
    Creates a Guardian linked to that user.
    Links the guardian to their children by student reg numbers.
    Returns the created guardian.
    """
    # Create the User
    user = User.objects.create_user(
        username=guardian_data['email'],
        email=guardian_data['email'],
        password=guardian_data['password'],
        first_name=guardian_data['first_name'],
        last_name=guardian_data['last_name']
    )

    # Create the Guardian
    guardian = Guardian.objects.create(
        first_name=guardian_data['first_name'],
        last_name=guardian_data['last_name'],
        email=guardian_data['email'],
        phone_number=guardian_data['phone_number'],
        relationship=guardian_data['relationship'],
        user=user
    )

    # Link to students by reg numbers
    student_reg_numbers = guardian_data.get('student_reg_numbers', [])
    students = Student.objects.filter(reg_number__in=student_reg_numbers)
    guardian.students.set(students)

    return guardian</content>
<parameter name="filePath">c:\Users\USER\Documents\projects\morning-angels-sms\backend\students\guardian_setup.py