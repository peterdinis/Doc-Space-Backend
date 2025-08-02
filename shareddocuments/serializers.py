from rest_framework import serializers
from .models import SharedDocument
from django.contrib.auth.models import User

class SharedDocumentSerializer(serializers.ModelSerializer):
    shared_with_email = serializers.EmailField(write_only=True)

    class Meta:
        model = SharedDocument
        fields = ['id', 'document', 'shared_with', 'shared_with_email', 'permission', 'shared_at']
        read_only_fields = ['shared_with', 'shared_at']

    def validate_shared_with_email(self, value):
        try:
            return User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")

    def create(self, validated_data):
        shared_with_user = validated_data.pop('shared_with_email')
        validated_data['shared_with'] = shared_with_user
        return super().create(validated_data)