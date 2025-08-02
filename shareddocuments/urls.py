from django.urls import path
from .views import SharedDocumentListCreateView

urlpatterns = [
    path('', SharedDocumentListCreateView.as_view(), name='shared-document-list-create'),
]