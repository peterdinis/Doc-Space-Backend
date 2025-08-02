from django.urls import path
from .views import (
    DocumentListView,
    DocumentCreateView,
    DocumentRetrieveView,
    DocumentUpdateView,
    DocumentDeleteView,
)

urlpatterns = [
    path('list/', DocumentListView.as_view(), name='document-list'),
    path('create/', DocumentCreateView.as_view(), name='document-create'),
    path('<int:pk>/retrieve/', DocumentRetrieveView.as_view(), name='document-retrieve'),
    path('<int:pk>/update/', DocumentUpdateView.as_view(), name='document-update'),
    path('<int:pk>/delete/', DocumentDeleteView.as_view(), name='document-delete'),
    path('upload-image/', DocumentImageUploadView.as_view(), name='upload-image'),
]