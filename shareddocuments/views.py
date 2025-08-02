from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import SharedDocument
from .serializers import SharedDocumentSerializer
from documents.models import Document

class SharedDocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = SharedDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return documents shared *with* current user
        return SharedDocument.objects.filter(shared_with=self.request.user)

    def perform_create(self, serializer):
        doc_id = self.request.data.get("document")
        if not doc_id:
            raise serializers.ValidationError("Missing document id.")

        try:
            document = Document.objects.get(id=doc_id, owner=self.request.user)
        except Document.DoesNotExist:
            raise serializers.ValidationError("You do not own this document.")

        serializer.save()


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
