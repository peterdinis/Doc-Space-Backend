from rest_framework import generics, permissions, filters, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import PageNumberPagination
from .models import Document
from .serializers import DocumentSerializer
from django.http import HttpResponse
from django.utils.text import slugify
from rest_framework.response import Response

# Pagination config
class DocumentPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


# ----------- DOCUMENT VIEWS -----------

class DocumentListView(generics.ListAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = DocumentPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']

    def get_queryset(self):
        return Document.objects.filter(owner=self.request.user).order_by('-updated_at')


class DocumentCreateView(generics.CreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class DocumentRetrieveView(generics.RetrieveAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(owner=self.request.user)


class DocumentUpdateView(generics.UpdateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(owner=self.request.user)


class DocumentDeleteView(generics.DestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(owner=self.request.user)

class DocumentDuplicateView(generics.CreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            original = Document.objects.get(pk=pk, owner=request.user)
        except Document.DoesNotExist:
            return Response({"detail": "Document not found."}, status=404)

        duplicate = Document.objects.create(
            title=f"Copy of {original.title}",
            content=original.content,
            owner=request.user,
        )
        serializer = self.get_serializer(duplicate)
        return Response(serializer.data, status=201)


# ----------- EXPORT VIEW -----------

class DocumentExportView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            document = Document.objects.get(pk=pk, owner=request.user)
        except Document.DoesNotExist:
            return Response({"detail": "Document not found."}, status=404)

        filename = slugify(document.title) or "document"
        response = HttpResponse(document.content, content_type='text/plain')
        response['Content-Disposition'] = f'attachment; filename="{filename}.txt"'
        return response