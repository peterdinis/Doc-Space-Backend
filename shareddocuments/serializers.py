from rest_framework import serializers
from .models import SharedDocument

class SharedDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SharedDocument
        fields = '__all__'
