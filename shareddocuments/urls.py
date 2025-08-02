from django.urls import path
from .views import (
    SharedDocumentListCreateView,
    SharedWithOthersListView,
    RevokeSharedDocumentView,
)

urlpatterns = [
    path('', SharedDocumentListCreateView.as_view(), name='shared-document-list-create'),
    path('shared-by-me/', SharedWithOthersListView.as_view(), name='shared-by-me'),
    path('<int:pk>/revoke/', RevokeSharedDocumentView.as_view(), name='revoke-share'),
]