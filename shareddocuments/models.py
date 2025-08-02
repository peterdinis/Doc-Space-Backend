from django.db import models
from django.contrib.auth.models import User
from documents.models import Document

class SharedDocument(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='shared_with')
    shared_with = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_documents')
    permission = models.CharField(max_length=10, choices=[('read', 'Read'), ('write', 'Write')])
    shared_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('document', 'shared_with')

    def __str__(self):
        return f"{self.document.title} → {self.shared_with.username} ({self.permission})"