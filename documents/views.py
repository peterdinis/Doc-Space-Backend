from rest_framework import generics, permissions, filters, status
from .models import Document
from .serializers import DocumentSerializer
from rest_framework.response import Response
from django.http import HttpResponse
from django.utils.text import slugify
from markdown import markdown
from weasyprint import HTML
from io import BytesIO
from .pagination import DocumentPagination

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

# ----------- DUPLICATE VIEW -----------

class DocumentDuplicateView(generics.CreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            original = Document.objects.get(pk=pk, owner=request.user)
        except Document.DoesNotExist:
            return Response({"detail": "Document not found."}, status=404)

        base_title = f"Copy of {original.title}"
        title = base_title
        counter = 1

        while Document.objects.filter(title=title, owner=request.user).exists():
            counter += 1
            title = f"Copy ({counter}) of {original.title}"

        duplicate = Document.objects.create(
            title=title,
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

        export_type = request.query_params.get('format', 'txt')  # txt, md, pdf
        filename = slugify(document.title) or "document"

        metadata = f"Title: {document.title}\nAuthor: {document.owner.username}\nDate: {document.updated_at.date()}\n\n"

        if export_type == 'md':
            content = metadata + document.content
            response = HttpResponse(content, content_type='text/markdown')
            response['Content-Disposition'] = f'attachment; filename="{filename}.md"'
            return response

        elif export_type == 'pdf':
            html_content = f"""
                <h1>{document.title}</h1>
                <p><strong>Author:</strong> {document.owner.username}<br>
                <strong>Date:</strong> {document.updated_at.strftime('%Y-%m-%d')}</p>
                <hr />
                <div>{markdown(document.content)}</div>
            """
            pdf_file = BytesIO()
            HTML(string=html_content).write_pdf(pdf_file)
            pdf_file.seek(0)
            response = HttpResponse(pdf_file, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{filename}.pdf"'
            return response

        else:  # default: plain text
            content = metadata + document.content
            response = HttpResponse(content, content_type='text/plain')
            response['Content-Disposition'] = f'attachment; filename="{filename}.txt"'
            return response