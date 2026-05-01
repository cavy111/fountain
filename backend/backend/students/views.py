from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Student, Class, FeePayment, Guardian
from .serializers import StudentSerializer, ClassSerializer, FeePaymentSerializer, GuardianSerializer
from attendance.models import Attendance
from attendance.serializers import AttendanceSerializer
from results.models import Result
from results.serializers import ResultSerializer


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer


class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer


class GuardianViewSet(viewsets.ModelViewSet):
    queryset = Guardian.objects.all()
    serializer_class = GuardianSerializer

    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            guardian = Guardian.objects.get(user=request.user)
            serializer = GuardianSerializer(guardian)
            return Response(serializer.data)
        except Guardian.DoesNotExist:
            return Response({'error': 'Guardian not found'}, status=404)

    @action(detail=False, methods=['get'])
    def my_children(self, request):
        guardian = Guardian.objects.get(user=request.user)
        students = guardian.students.all()
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_children_fees(self, request):
        guardian = Guardian.objects.get(user=request.user)
        students = guardian.students.all()
        fees = FeePayment.objects.filter(student__in=students)
        serializer = FeePaymentSerializer(fees, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_children_attendance(self, request):
        guardian = Guardian.objects.get(user=request.user)
        students = guardian.students.all()
        attendance = Attendance.objects.filter(student__in=students)
        serializer = AttendanceSerializer(attendance, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_children_results(self, request):
        guardian = Guardian.objects.get(user=request.user)
        students = guardian.students.all()
        results = Result.objects.filter(student__in=students)
        serializer = ResultSerializer(results, many=True)
        return Response(serializer.data)


class FeePaymentViewSet(viewsets.ModelViewSet):
    queryset = FeePayment.objects.all()
    serializer_class = FeePaymentSerializer
