from datetime import datetime
from io import BytesIO
from django.db.models import Q
from django.http import HttpResponse
from django.utils.text import slugify
from rest_framework import generics, permissions, filters
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from markdown2 import markdown
from weasyprint import HTML
from .models import Document
from .serializers import DocumentSerializer
from .pagination import DocumentPagination
from .permissions import IsDocumentOwnerOrShared
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_403_FORBIDDEN, HTTP_404_NOT_FOUND
from rest_framework.response import Response

class DocumentListView(generics.ListAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = DocumentPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']

    def get_queryset(self):
        user = self.request.user
        return Document.objects.filter(
            Q(owner=user) |
            Q(can_view=user) |
            Q(can_edit=user) |
            Q(is_public=True)
        ).distinct().order_by('-updated_at')


class DocumentCreateView(generics.CreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class DocumentRetrieveView(generics.RetrieveAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDocumentOwnerOrShared]

    def get_queryset(self):
        user = self.request.user
        return Document.objects.filter(
            Q(owner=user) |
            Q(can_view=user) |
            Q(can_edit=user) |
            Q(is_public=True)
        ).distinct()


class DocumentUpdateView(generics.UpdateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDocumentOwnerOrShared]

    def get_queryset(self):
        user = self.request.user
        return Document.objects.filter(
            Q(owner=user) |
            Q(can_edit=user)
        ).distinct()


class DocumentDeleteView(generics.DestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDocumentOwnerOrShared]

    def get_queryset(self):
        return Document.objects.filter(owner=self.request.user)


class DocumentDuplicateView(generics.CreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDocumentOwnerOrShared]

    def post(self, request, pk):
        try:
            original = Document.objects.get(
                Q(pk=pk) &
                (Q(owner=request.user) | Q(can_view=request.user) | Q(can_edit=request.user) | Q(is_public=True))
            )
        except Document.DoesNotExist:
            return Response({"detail": "Document not found or access denied."}, status=404)

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


class DocumentExportView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsDocumentOwnerOrShared]

    def get_queryset(self):
        user = self.request.user
        return Document.objects.filter(
            Q(owner=user) |
            Q(can_view=user) |
            Q(can_edit=user) |
            Q(is_public=True)
        ).distinct()

    def get(self, request, pk):
        queryset = self.get_queryset()
        try:
            document = queryset.get(pk=pk)
        except Document.DoesNotExist:
            return Response({"detail": "Document not found or access denied."}, status=404)

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
        queryset = Document.objects.filter(
            Q(owner=user) |
            Q(can_view=user) |
            Q(can_edit=user) |
            Q(is_public=True)
        ).distinct()

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

class DocumentRelatedToUserView(generics.ListAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = DocumentPagination

    def get_queryset(self):
        user = self.request.user
        queryset = Document.objects.filter(
            Q(owner=user) |
            Q(can_view=user) |
            Q(can_edit=user) |
            Q(can_delete=user)
        ).distinct()

        # Optional sorting
        queryset = queryset.order_by('-updated_at')

        # ✅ Filtering by sort_position
        sort_eq = self.request.query_params.get('sort_position')
        sort_gte = self.request.query_params.get('sort_position_gte')
        sort_lte = self.request.query_params.get('sort_position_lte')

        if sort_eq is not None:
            queryset = queryset.filter(sort_position=int(sort_eq))
        if sort_gte is not None:
            queryset = queryset.filter(sort_position__gte=int(sort_gte))
        if sort_lte is not None:
            queryset = queryset.filter(sort_position__lte=int(sort_lte))

        return queryset
    
class DocumentSortPositionUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        new_position = request.data.get('sort_position')

        if new_position is None:
            return Response({'detail': 'Missing sort_position'}, status=HTTP_400_BAD_REQUEST)

        try:
            new_position = int(new_position)
        except ValueError:
            return Response({'detail': 'sort_position must be an integer'}, status=HTTP_400_BAD_REQUEST)

        try:
            document = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            return Response({'detail': 'Document not found'}, status=HTTP_404_NOT_FOUND)

        # Check permission (owner or can_edit)
        if not (
            document.owner == user or
            document.can_edit.filter(pk=user.pk).exists()
        ):
            return Response({'detail': 'Permission denied'}, status=HTTP_403_FORBIDDEN)

        document.sort_position = new_position
        document.save()

        return Response({'detail': 'Sort position updated', 'sort_position': document.sort_position})