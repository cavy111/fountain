from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from students.models import Guardian, Student


class Command(BaseCommand):
    help = 'Create a test guardian with specified credentials and link to first 2 students'

    def handle(self, *args, **kwargs):
        # Guardian details
        username = 'guardian@morningangels.co.zw'
        password = 'guardian123'
        email = 'guardian@morningangels.co.zw'
        first_name = 'Sarah'
        last_name = 'Moyo'
        phone = '0771234567'
        relationship = 'Mother'

        try:
            # Check if user already exists
            user, user_created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': first_name,
                    'last_name': last_name,
                }
            )

            if user_created:
                user.set_password(password)
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Created user: {username}'))
            else:
                self.stdout.write(self.style.WARNING(f'User {username} already exists'))

            # Check if guardian already exists
            guardian, guardian_created = Guardian.objects.get_or_create(
                user=user,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'email': email,
                    'phone_number': phone,
                    'relationship': relationship,
                }
            )

            if guardian_created:
                self.stdout.write(self.style.SUCCESS(f'Created guardian: {first_name} {last_name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Guardian {first_name} {last_name} already exists'))

            # Get first 2 students and link them to the guardian
            students = Student.objects.all()[:2]
            
            if students.exists():
                guardian.students.add(*students)
                student_names = [f"{student.first_name} {student.last_name}" for student in students]
                self.stdout.write(self.style.SUCCESS(f'Linked guardian to students: {", ".join(student_names)}'))
            else:
                self.stdout.write(self.style.WARNING('No students found to link to guardian'))

            # Print guardian details
            self.stdout.write(self.style.SUCCESS('\n=== Guardian Details ==='))
            self.stdout.write(f'Username: {username}')
            self.stdout.write(f'Password: {password}')
            self.stdout.write(f'Name: {guardian.first_name} {guardian.last_name}')
            self.stdout.write(f'Email: {guardian.email}')
            self.stdout.write(f'Phone: {guardian.phone_number}')
            self.stdout.write(f'Relationship: {guardian.relationship}')
            self.stdout.write(f'Number of linked students: {guardian.students.count()}')
            
            for student in guardian.students.all():
                self.stdout.write(f'  - {student.first_name} {student.last_name} ({student.reg_number})')

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating test guardian: {str(e)}'))
