from django.urls import path
from .views import (
    SharedDocumentListView,
    SharedDocumentCreateView,
    SharedWithOthersListView,
    RevokeSharedDocumentView,
    SharedDocumentUpdateView,
)

urlpatterns = [
    path('', SharedDocumentListView.as_view(), name='shared-documents-list'),  # documents shared *with* me
    path('create/', SharedDocumentCreateView.as_view(), name='shared-documents-create'),
    path('shared-by-me/', SharedWithOthersListView.as_view(), name='shared-by-me'),
    path('<int:pk>/revoke/', RevokeSharedDocumentView.as_view(), name='revoke-share'),
    path('<int:pk>/update/', SharedDocumentUpdateView.as_view(), name='update-share'),
]