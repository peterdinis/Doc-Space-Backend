from rest_framework import generics, permissions
from .models import SharedDocument
from .serializers import SharedDocumentSerializer

class SharedDocumentListCreateView(generics.ListCreateAPIView):
    queryset = SharedDocument.objects.all()
    serializer_class = SharedDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SharedDocument.objects.filter(shared_with=self.request.user)

    def perform_create(self, serializer):
        serializer.save()