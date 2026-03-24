import random
from datetime import date, timedelta

from django.core.management.base import BaseCommand

from attendance.models import Attendance, Subject
from notifications.models import Notification
from results.models import Result
from students.models import Class, FeePayment, Student


def last_school_days(count, start_date=None):
    days = []
    current = start_date or date.today()
    while len(days) < count:
        if current.weekday() < 5:  # Mon-Fri
            days.append(current)
        current -= timedelta(days=1)
    return list(reversed(days))


def grade_from_mark(mark):
    if mark >= 80:
        return 'A'
    if mark >= 70:
        return 'B'
    if mark >= 60:
        return 'C'
    if mark >= 50:
        return 'D'
    if mark >= 40:
        return 'E'
    return 'F'


def class_position_for_subject(entries):
    # entries: list of (student, mark)
    ordered = sorted(entries, key=lambda x: x[1], reverse=True)
    positions = {}
    pos = 1
    last_mark = None
    for idx, (student, mark) in enumerate(ordered, start=1):
        if mark != last_mark:
            pos = idx
        positions[student.id] = pos
        last_mark = mark
    return positions


class Command(BaseCommand):
    help = 'Seed demo data for Zimbabwean secondary school.'

    def handle(self, *args, **options):
        if (
            Student.objects.exists()
            or Class.objects.exists()
            or Subject.objects.exists()
            or FeePayment.objects.exists()
            or Attendance.objects.exists()
            or Result.objects.exists()
            or Notification.objects.exists()
        ):
            self.stdout.write(self.style.WARNING('Demo data already exists; skipping seeding.'))
            return

        self.stdout.write(self.style.SUCCESS('Seeding demo data...'))

        class_names = ['Form 1A', 'Form 2A', 'Form 3A', 'Form 4A', 'Form 5A', 'Form 6A']
        class_objs = {}
        for class_name in class_names:
            form_level = class_name.split()[0] + ' ' + class_name.split()[1][:-1]
            cls, _ = Class.objects.get_or_create(
                name=class_name,
                form_level=form_level,
                stream='A',
                academic_year=2024,
            )
            class_objs[class_name] = cls
        self.stdout.write(self.style.SUCCESS(f'Created {len(class_objs)} classes.'))

        subjects_template = [
            ('Mathematics', 'MATH'),
            ('English Language', 'ENG'),
            ('Shona', 'SHN'),
            ('Combined Science', 'SCI'),
            ('History', 'HIS'),
            ('Geography', 'GEO'),
            ('Business Studies', 'BST'),
            ('Physical Education', 'PHE'),
        ]

        for class_name, cls in class_objs.items():
            for name, code in subjects_template:
                Subject.objects.get_or_create(
                    class_group=cls,
                    name=name,
                    code=f'{code}-{cls.name.replace(" ", "")}',
                )
        self.stdout.write(self.style.SUCCESS('Created subjects for classes.'))

        zimbabwean_students = [
            ('Tawanda', 'Moyo', 'Chiedza Moyo', '0712345678'),
            ('Nokutenda', 'Chirwa', 'Faith Chirwa', '0713456789'),
            ('Tatenda', 'Mutswairo', 'Grace Mutswairo', '0714567890'),
            ('Tafadzwa', 'Gumbo', 'John Gumbo', '0715678901'),
            ('Rudo', 'Madzingo', 'Eunice Madzingo', '0716789012'),
            ('Farai', 'Chikwekwe', 'Hope Chikwekwe', '0717890123'),
            ('Chenai', 'Nyathi', 'Mercy Nyathi', '0718901234'),
            ('Kudzai', 'Ndlovu', 'Teddy Ndlovu', '0719012345'),
            ('Simba', 'Mupamhanga', 'Rose Mupamhanga', '0710123456'),
            ('Anesu', 'Mabika', 'Sandra Mabika', '0711234567'),
            ('Tendai', 'Mapfumo', 'Michael Mapfumo', '0712345609'),
            ('Ruvimbo', 'Mare', 'Promise Mare', '0712345610'),
            ('Tadiwanashe', 'Sibanda', 'Margaret Sibanda', '0712345611'),
            ('Munyaradzi', 'Nyathi', 'Samuel Nyathi', '0712345612'),
            ('Chipo', 'Mlambo', 'Patience Mlambo', '0712345613'),
            ('Kudakwashe', 'Chinoda', 'Tinashe Chinoda', '0712345614'),
            ('Netai', 'Ncube', 'Rejoice Ncube', '0712345615'),
            ('Memory', 'Kapfupi', 'Sylvia Kapfupi', '0712345616'),
            ('Tatenda', 'Kapfupi', 'Sandra Kapfupi', '0712345617'),
            ('Blessing', 'Chigumba', 'Eunice Chigumba', '0712345618'),
        ]

        forms = ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Form 6']
        students = []

        for idx, (first, last, guardian, phone) in enumerate(zimbabwean_students, start=1):
            form = forms[(idx - 1) // 4]
            reg = f'PEN{idx:03d}/2024'
            dob = date(2008 + ((idx - 1) % 4), random.randint(1, 12), random.randint(1, 28))
            student, _ = Student.objects.get_or_create(
                reg_number=reg,
                defaults={
                    'first_name': first,
                    'last_name': last,
                    'form': form,
                    'stream': 'A',
                    'guardian_name': guardian,
                    'guardian_phone': phone,
                    'date_of_birth': dob,
                },
            )
            students.append(student)

        self.stdout.write(self.style.SUCCESS(f'Created {len(students)} students.'))

        # Fee payments for 15 students
        fee_students = random.sample(students, 15)
        for student in fee_students:
            if not FeePayment.objects.filter(student=student, term='Term 1', academic_year=2024).exists():
                amount_usd = random.randint(150, 300)
                FeePayment.objects.create(
                    student=student,
                    amount_usd=amount_usd,
                    amount_zwl=amount_usd * 600,
                    payment_method=random.choice(['Cash', 'EcoCash', 'Bank Transfer']),
                    term='Term 1',
                    academic_year=2024,
                    paid_on=date(2024, 2, random.randint(1, 28)),
                    receipt_number=f'RCT{student.reg_number.replace("/", "")}04',
                    notes='Term 1 fee for 2024',
                )
        self.stdout.write(self.style.SUCCESS(f'Created fee payments for {len(fee_students)} students.'))

        # Attendance records for last 5 school days
        attendance_dates = last_school_days(5)
        for attendance_date in attendance_dates:
            for student in students:
                cls_name = f'{student.form}A'
                class_obj = class_objs.get(cls_name)
                if not class_obj:
                    continue
                subject = Subject.objects.filter(class_group=class_obj).first()
                if not subject:
                    continue
                status = random.choices(['present', 'absent', 'late'], weights=[85, 10, 5], k=1)[0]
                Attendance.objects.create(
                    student=student,
                    subject=subject,
                    date=attendance_date,
                    status=status,
                    notes='Auto-generated attendance',
                )
        self.stdout.write(self.style.SUCCESS('Created attendance records for the last 5 school days.'))

        # Results generation
        for class_name, class_obj in class_objs.items():
            class_students = list(Student.objects.filter(form=class_obj.form_level, stream=class_obj.stream))
            class_subjects = list(Subject.objects.filter(class_group=class_obj))
            for subject in class_subjects:
                scores = []
                for student in class_students:
                    if Result.objects.filter(student=student, subject=subject, term='Term 1', academic_year=2024).exists():
                        continue
                    mark = random.randint(35, 95)
                    scores.append((student, mark))
                positions = class_position_for_subject(scores)
                for student, mark in scores:
                    Result.objects.create(
                        student=student,
                        subject=subject,
                        term='Term 1',
                        academic_year=2024,
                        mark=mark,
                        grade=grade_from_mark(mark),
                        class_position=positions.get(student.id, 1),
                        teacher_comment='Good effort' if mark >= 50 else 'Needs improvement',
                    )
        self.stdout.write(self.style.SUCCESS('Created result records for all students and subjects.'))

        # Notifications
        notification_banner = [
            ('fee_reminder', 'Please settle your Term 1 fees as soon as possible.'),
            ('absence_alert', 'Your child has missed several classes this week.'),
            ('fee_reminder', 'Reminder: Fee balances must be cleared by end of month.'),
            ('absence_alert', 'Attendance alert: student has 3 unexcused absences.'),
            ('results', 'Term 1 results are now available on the student portal.'),
        ]

        for idx, (ntype, message) in enumerate(notification_banner):
            student = students[idx % len(students)]
            Notification.objects.create(
                student=student,
                type=ntype,
                message=message,
                phone_number=student.guardian_phone,
                status='sent',
                sent_at=date.today(),
            )

        self.stdout.write(self.style.SUCCESS('Created sample notifications.'))

        self.stdout.write(self.style.SUCCESS('Seeding complete.'))
