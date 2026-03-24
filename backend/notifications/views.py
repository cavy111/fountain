from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import date
from .models import Notification
from .serializers import NotificationSerializer
from .whatsapp import send_whatsapp
from students.models import Student, FeePayment
from attendance.models import Attendance


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    @action(detail=False, methods=['post'])
    def send_fee_reminders(self, request):
        """Send fee reminder messages to guardians of students with outstanding fees"""
        today = date.today()
        current_term = "Term 1"  # You might want to make this dynamic

        # Find students with no fee payments in current term
        students_with_payments = FeePayment.objects.filter(
            academic_year=today.year,
            term=current_term
        ).values_list('student_id', flat=True)

        students_without_payments = Student.objects.exclude(
            id__in=students_with_payments
        ).filter(is_active=True)

        sent_count = 0
        failed_count = 0

        for student in students_without_payments:
            message = f"Dear {student.guardian_name}, {student.first_name} {student.last_name} has an outstanding fees balance at Pen Academy. Please contact the school office. Thank you."

            success = send_whatsapp(student.guardian_phone, message)

            # Create notification record
            Notification.objects.create(
                student=student,
                type='fee_reminder',
                message=message,
                phone_number=student.guardian_phone,
                status='sent' if success else 'failed',
                sent_at=timezone.now() if success else None
            )

            if success:
                sent_count += 1
            else:
                failed_count += 1

        return Response({
            'message': f'Fee reminders sent: {sent_count} successful, {failed_count} failed',
            'sent': sent_count,
            'failed': failed_count
        })

    @action(detail=False, methods=['post'])
    def send_absence_alerts(self, request):
        """Send absence alert messages to guardians of students marked absent today"""
        today = date.today()
        print(f"Checking for absent students on {today}")

        # Find students marked absent today
        absent_students = Attendance.objects.filter(
            date=today,
            status='absent'
        ).select_related('student')

        print(f"Found {absent_students.count()} absent students")

        if absent_students.count() == 0:
            return Response({
                'message': 'No students marked absent today',
                'sent': 0,
                'failed': 0
            })

        sent_count = 0
        failed_count = 0

        for attendance in absent_students:
            student = attendance.student
            message = f"Dear {student.guardian_name}, this is to inform you that {student.first_name} {student.last_name} was marked absent today at Pen Academy. Please contact the school if you have any concerns."

            print(f"Sending message to {student.first_name} {student.last_name} at {student.guardian_phone}")
            success = send_whatsapp(student.guardian_phone, message)

            # Create notification record
            Notification.objects.create(
                student=student,
                type='absence_alert',
                message=message,
                phone_number=student.guardian_phone,
                status='sent' if success else 'failed',
                sent_at=timezone.now() if success else None
            )

            if success:
                sent_count += 1
            else:
                failed_count += 1
                print(f"Failed to send to {student.first_name} {student.last_name}")

        if failed_count > 0:
            return Response({
                'message': f'Absence alerts sent: {sent_count} successful, {failed_count} failed. Check Django logs for WhatsApp API errors.',
                'sent': sent_count,
                'failed': failed_count
            })

        return Response({
            'message': f'Absence alerts sent: {sent_count} successful, {failed_count} failed',
            'sent': sent_count,
            'failed': failed_count
        })

    @action(detail=False, methods=['post'])
    def send_bulk(self, request):
        """Send bulk message to all guardians"""
        message = request.data.get('message', '').strip()

        if not message:
            return Response(
                {'error': 'Message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        students = Student.objects.filter(is_active=True)
        sent_count = 0
        failed_count = 0

        for student in students:
            success = send_whatsapp(student.guardian_phone, message)

            # Create notification record
            Notification.objects.create(
                student=student,
                type='announcement',
                message=message,
                phone_number=student.guardian_phone,
                status='sent' if success else 'failed',
                sent_at=timezone.now() if success else None
            )

            if success:
                sent_count += 1
            else:
                failed_count += 1

        return Response({
            'message': f'Bulk messages sent: {sent_count} successful, {failed_count} failed',
            'sent': sent_count,
            'failed': failed_count
        })
