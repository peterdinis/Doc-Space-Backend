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
from datetime import datetime
from rest_framework.exceptions import ValidationError

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
        
class DocumentSortedListView(generics.ListAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = DocumentPagination

    def get_queryset(self):
        user = self.request.user
        queryset = Document.objects.filter(owner=user)

        # Handle sorting
        sort_by = self.request.query_params.get('sort_by', 'updated')  # 'created' or 'updated'
        order = self.request.query_params.get('order', 'desc')         # 'asc' or 'desc'

        if sort_by not in ['created', 'updated']:
            sort_by = 'updated'

        if order not in ['asc', 'desc']:
            order = 'desc'

        sort_field = 'created_at' if sort_by == 'created' else 'updated_at'
        if order == 'desc':
            sort_field = f'-{sort_field}'

        queryset = queryset.order_by(sort_field)

        # Handle date filters
        date_fields = {
            'created_after': 'created_at__gte',
            'created_before': 'created_at__lte',
            'updated_after': 'updated_at__gte',
            'updated_before': 'updated_at__lte',
        }

        for param, lookup in date_fields.items():
            date_str = self.request.query_params.get(param)
            if date_str:
                try:
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                    queryset = queryset.filter(**{lookup: date_obj})
                except ValueError:
                    raise ValidationError({param: 'Invalid date format. Use YYYY-MM-DD.'})

        return queryset