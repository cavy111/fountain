import random
from datetime import date, timedelta

from django.core.management.base import BaseCommand

from attendance.models import Attendance, Subject
from results.models import Result
from students.models import Class, FeePayment, Student, Guardian
from django.contrib.auth.models import User


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
    help = 'Seed demo data for Fountain Primary School guardian pages'

    def handle(self, *args, **options):
        if (
            Student.objects.exists()
            or Class.objects.exists()
            or Subject.objects.exists()
            or FeePayment.objects.exists()
            or Attendance.objects.exists()
            or Result.objects.exists()
        ):
            self.stdout.write(self.style.WARNING('Demo data already exists; skipping seeding.'))
            return

        self.stdout.write(self.style.SUCCESS('Seeding Fountain demo data...'))

        # Create classes for primary school
        class_names = ['Grade 1A', 'Grade 2A', 'Grade 3A', 'Grade 4A', 'Grade 5A', 'Grade 6A', 'Grade 7A']
        class_objs = {}
        for class_name in class_names:
            grade = class_name.split()[0] + ' ' + class_name.split()[1][:-1]
            cls, _ = Class.objects.get_or_create(
                name=class_name,
                grade_level=grade,
                stream='A',
                academic_year=2024,
            )
            class_objs[class_name] = cls
        self.stdout.write(self.style.SUCCESS(f'Created {len(class_objs)} classes.'))

        # Create subjects for primary school
        subjects_template = [
            ('Mathematics', 'MATH'),
            ('English', 'ENG'),
            ('Shona', 'SHN'),
            ('General Paper', 'GP'),
            ('Science & Technology', 'SCI'),
            ('Social Studies', 'SS'),
            ('Religious & Moral Education', 'RME'),
            ('Physical Education', 'PE'),
            ('Visual Arts', 'ART'),
            ('Agriculture', 'AGR'),
        ]

        for class_name, cls in class_objs.items():
            for name, code in subjects_template:
                Subject.objects.get_or_create(
                    class_group=cls,
                    name=name,
                    code=f'{code}-{cls.name.replace(" ", "")}',
                )
        self.stdout.write(self.style.SUCCESS('Created subjects for classes.'))

        # Create students with Zimbabwean names
        primary_students = [
            ('Tawanda', 'Moyo', 'Sarah Moyo', '0771234567'),  # This will be linked to test guardian
            ('Nokutenda', 'Chirwa', 'Sarah Moyo', '0771234567'),  # This will be linked to test guardian
            ('Tatenda', 'Mutswairo', 'Grace Mutswairo', '0713456789'),
            ('Tafadzwa', 'Gumbo', 'John Gumbo', '0714567890'),
            ('Rudo', 'Madzingo', 'Eunice Madzingo', '0715678901'),
            ('Farai', 'Chikwekwe', 'Hope Chikwekwe', '0716789012'),
            ('Chenai', 'Nyathi', 'Mercy Nyathi', '0717890123'),
            ('Kudzai', 'Ndlovu', 'Teddy Ndlovu', '0718901234'),
            ('Simba', 'Mupamhanga', 'Rose Mupamhanga', '0719012345'),
            ('Anesu', 'Mabika', 'Sandra Mabika', '0710123456'),
            ('Tendai', 'Mapfumo', 'Michael Mapfumo', '0711234567'),
            ('Ruvimbo', 'Mare', 'Promise Mare', '0712345609'),
            ('Tadiwanashe', 'Sibanda', 'Margaret Sibanda', '0712345610'),
            ('Munyaradzi', 'Nyathi', 'Samuel Nyathi', '0712345611'),
            ('Chipo', 'Mlambo', 'Patience Mlambo', '0712345612'),
            ('Kudakwashe', 'Chinoda', 'Tinashe Chinoda', '0712345613'),
            ('Netai', 'Ncube', 'Rejoice Ncube', '0712345614'),
            ('Memory', 'Kapfupi', 'Sylvia Kapfupi', '0712345615'),
            ('Tatenda', 'Kapfupi', 'Sandra Kapfupi', '0712345616'),
            ('Blessing', 'Chigumba', 'Eunice Chigumba', '0712345617'),
        ]

        grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7']
        students = []

        for idx, (first, last, guardian, phone) in enumerate(primary_students, start=1):
            grade = grades[(idx - 1) // 3]  # 3 students per grade
            reg = f'FOU{idx:03d}/2024'
            dob = date(2017 - ((idx - 1) % 7), random.randint(1, 12), random.randint(1, 28))
            student, _ = Student.objects.get_or_create(
                reg_number=reg,
                defaults={
                    'first_name': first,
                    'last_name': last,
                    'grade': grade,
                    'stream': 'A',
                    'guardian_name': guardian,
                    'guardian_phone': phone,
                    'date_of_birth': dob,
                },
            )
            students.append(student)

        self.stdout.write(self.style.SUCCESS(f'Created {len(students)} students.'))

        # Create fee payments for all students
        for student in students:
            # Term 1 fees
            FeePayment.objects.get_or_create(
                student=student,
                term='Term 1',
                academic_year=2024,
                defaults={
                    'amount_usd': random.randint(120, 250),
                    'amount_zwl': random.randint(72000, 150000),
                    'payment_method': random.choice(['Cash', 'EcoCash', 'Bank Transfer', 'Swipe']),
                    'paid_on': date(2024, 2, random.randint(1, 28)),
                    'receipt_number': f'RCT{student.reg_number.replace("/", "")}T1',
                    'notes': 'Term 1 fees - 2024',
                }
            )
            
            # Term 2 fees (some paid, some outstanding)
            if random.random() > 0.3:  # 70% paid term 2
                FeePayment.objects.get_or_create(
                    student=student,
                    term='Term 2',
                    academic_year=2024,
                    defaults={
                        'amount_usd': random.randint(120, 250),
                        'amount_zwl': random.randint(72000, 150000),
                        'payment_method': random.choice(['Cash', 'EcoCash', 'Bank Transfer', 'Swipe']),
                        'paid_on': date(2024, 5, random.randint(1, 28)),
                        'receipt_number': f'RCT{student.reg_number.replace("/", "")}T2',
                        'notes': 'Term 2 fees - 2024',
                    }
                )

        self.stdout.write(self.style.SUCCESS(f'Created fee payments for all students.'))

        # Create attendance records for last 30 school days
        attendance_dates = last_school_days(30)
        for attendance_date in attendance_dates:
            for student in students:
                cls_name = f'{student.grade}A'
                class_obj = class_objs.get(cls_name)
                if not class_obj:
                    continue
                subject = Subject.objects.filter(class_group=class_obj).first()
                if not subject:
                    continue
                status = random.choices(['present', 'absent', 'late'], weights=[85, 10, 5], k=1)[0]
                Attendance.objects.get_or_create(
                    student=student,
                    subject=subject,
                    date=attendance_date,
                    defaults={
                        'status': status,
                        'notes': f'Auto-generated - {status}',
                    }
                )
        self.stdout.write(self.style.SUCCESS('Created attendance records for the last 30 school days.'))

        # Create results for Term 1 and Term 2
        for term in ['Term 1', 'Term 2']:
            for class_name, class_obj in class_objs.items():
                class_students = list(Student.objects.filter(grade=class_obj.grade_level, stream=class_obj.stream))
                class_subjects = list(Subject.objects.filter(class_group=class_obj))
                for subject in class_subjects:
                    scores = []
                    for student in class_students:
                        if Result.objects.filter(student=student, subject=subject, term=term, academic_year=2024).exists():
                            continue
                        mark = random.randint(35, 95)
                        scores.append((student, mark))
                    positions = class_position_for_subject(scores)
                    for student, mark in scores:
                        Result.objects.create(
                            student=student,
                            subject=subject,
                            term=term,
                            academic_year=2024,
                            mark=mark,
                            grade=grade_from_mark(mark),
                            class_position=positions.get(student.id, 1),
                            teacher_comment=random.choice([
                                'Excellent work! Keep it up!',
                                'Good effort, shows improvement',
                                'Satisfactory progress',
                                'Needs more practice',
                                'Great potential, work harder'
                            ]),
                        )
        self.stdout.write(self.style.SUCCESS('Created result records for Term 1 and Term 2.'))

        # Link first 2 students to the test guardian (if guardian exists)
        try:
            guardian_user = User.objects.get(username='guardian@fountain.co.zw')
            guardian = Guardian.objects.get(user=guardian_user)
            first_two_students = students[:2]
            guardian.students.add(*first_two_students)
            self.stdout.write(self.style.SUCCESS(f'Linked {len(first_two_students)} students to test guardian.'))
        except (User.DoesNotExist, Guardian.DoesNotExist):
            self.stdout.write(self.style.WARNING('Test guardian not found. Run create_test_guardian first.'))

        self.stdout.write(self.style.SUCCESS('Fountain demo data seeding complete!'))
