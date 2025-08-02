from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import SharedDocument
from .serializers import SharedDocumentSerializer
from documents.models import Document

class SharedDocumentListView(generics.ListAPIView):
    serializer_class = SharedDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = SharedDocument.objects.all()

        doc_id = self.request.query_params.get("document_id")
        perm = self.request.query_params.get("permission")

        if doc_id:
            queryset = queryset.filter(document_id=doc_id)

        if perm:
            queryset = queryset.filter(permission=perm)

        return queryset

class SharedDocumentCreateView(generics.CreateAPIView):
    serializer_class = SharedDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        shared_doc = serializer.save(shared_by=self.request.user)

        # Notify user
        recipient = shared_doc.shared_with.email
        doc_title = shared_doc.document.title

        send_mail(
            subject=f"You've been shared a document: {doc_title}",
            message=f"{self.request.user.username} shared a document with you.",
            from_email="noreply@example.com",
            recipient_list=[recipient],
        )

class SharedWithOthersListView(generics.ListAPIView):
    serializer_class = SharedDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return all users the current user has shared documents with
        return SharedDocument.objects.filter(document__owner=self.request.user)


class RevokeSharedDocumentView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = SharedDocument.objects.all()
    lookup_field = 'pk'

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()

        # Only the owner can revoke
        if instance.document.owner != request.user:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class SharedDocumentUpdateView(generics.UpdateAPIView):
    queryset = SharedDocument.objects.all()
    serializer_class = SharedDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['patch']
