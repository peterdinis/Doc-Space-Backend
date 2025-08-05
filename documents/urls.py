from django.urls import path
from .views import (
    DocumentListView,
    DocumentCreateView,
    DocumentRetrieveView,
    DocumentUpdateView,
    DocumentDeleteView,
    DocumentDuplicateView,
    DocumentExportView,
    DocumentSortedListView,
    DocumentRelatedToUserView
)

urlpatterns = [
    path('list/', DocumentListView.as_view(), name='document-list'),
    path('create/', DocumentCreateView.as_view(), name='document-create'),
    path('<int:pk>/duplicate/', DocumentDuplicateView.as_view(), name='document-duplicate'),
    path('<int:pk>/export/', DocumentExportView.as_view(), name='document-export'),
    path('<int:pk>/retrieve/', DocumentRetrieveView.as_view(), name='document-retrieve'),
    path('<int:pk>/update/', DocumentUpdateView.as_view(), name='document-update'),
    path('<int:pk>/delete/', DocumentDeleteView.as_view(), name='document-delete'),
    path('sorted/', DocumentSortedListView.as_view(), name='document-sorted'),
    path("documents/related/", DocumentRelatedToUserView.as_view(), name="documents-related-to-user"),
]