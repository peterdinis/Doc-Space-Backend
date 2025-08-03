import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.core import mail
from documents.models import Document
from shared_documents.models import SharedDocument, SharedDocumentHistory
from django.contrib.auth.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def users(db):
    owner = User.objects.create_user(username='owner', password='pass123')
    recipient = User.objects.create_user(username='recipient', password='pass123')
    return owner, recipient


@pytest.fixture
def document(users):
    owner, _ = users
    return Document.objects.create(title='Test Doc', content='Hello', owner=owner)


@pytest.fixture
def shared_document(document, users):
    _, recipient = users
    return SharedDocument.objects.create(
        document=document,
        shared_with=recipient,
        permission='read',
    )


@pytest.mark.django_db
def test_create_shared_document(api_client, users, document):
    owner, recipient = users
    api_client.force_authenticate(user=owner)

    response = api_client.post(reverse('shared-documents-create'), {
        "document": document.id,
        "shared_with": recipient.id,
        "permission": "read"
    })

    assert response.status_code == status.HTTP_201_CREATED
    assert SharedDocument.objects.filter(document=document, shared_with=recipient).exists()

    # Email should be sent
    assert len(mail.outbox) == 1
    assert recipient.email in mail.outbox[0].to

    # Audit log created
    history = SharedDocumentHistory.objects.filter(
        shared_document__document=document,
        action="created"
    )
    assert history.exists()


@pytest.mark.django_db
def test_list_shared_with_me(api_client, users, shared_document):
    _, recipient = users
    api_client.force_authenticate(user=recipient)

    response = api_client.get(reverse('shared-documents-list'))
    assert response.status_code == 200
    assert response.data[0]["permission"] == "read"


@pytest.mark.django_db
def test_revoke_shared_document(api_client, users, shared_document):
    owner, _ = users
    api_client.force_authenticate(user=owner)

    url = reverse("revoke-share", args=[shared_document.pk])
    response = api_client.delete(url)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not SharedDocument.objects.filter(pk=shared_document.pk).exists()

    # Audit log created
    assert SharedDocumentHistory.objects.filter(
        action="revoked",
        shared_document__pk=shared_document.pk
    ).exists()


@pytest.mark.django_db
def test_update_permission(api_client, users, shared_document):
    owner, _ = users
    api_client.force_authenticate(user=owner)

    url = reverse("update-share", args=[shared_document.pk])
    response = api_client.patch(url, {"permission": "write"}, format='json')

    assert response.status_code == 200
    shared_document.refresh_from_db()
    assert shared_document.permission == "write"

    # Audit log created
    assert SharedDocumentHistory.objects.filter(
        shared_document=shared_document,
        action="permission_updated"
    ).exists()