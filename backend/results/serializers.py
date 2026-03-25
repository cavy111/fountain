from rest_framework import serializers
from attendance.models import Subject
from .models import Result


class ResultSerializer(serializers.ModelSerializer):
    subject = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Result
        fields = '__all__'