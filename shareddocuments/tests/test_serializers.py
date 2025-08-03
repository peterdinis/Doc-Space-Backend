import pytest
from shared_documents.serializers import SharedDocumentSerializer
from documents.models import Document
from django.contrib.auth.models import User

@pytest.mark.django_db
def test_shared_document_serializer_valid():
    user1 = User.objects.create_user(username='a', password='x')
    user2 = User.objects.create_user(username='b', password='x')
    doc = Document.objects.create(title='Hello', content='...', owner=user1)

    data = {
        "document": doc.id,
        "shared_with": user2.id,
        "permission": "read"
    }

    serializer = SharedDocumentSerializer(data=data)
    assert serializer.is_valid(), serializer.errors
    instance = serializer.save()
    assert instance.document == doc
    assert instance.shared_with == user2
    assert instance.permission == "read"