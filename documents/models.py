from django.db import models
from django.contrib.auth.models import User

class Document(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True) 
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    
    can_view = models.ManyToManyField(User, related_name='documents_can_view', blank=True)
    can_edit = models.ManyToManyField(User, related_name='documents_can_edit', blank=True)
    can_delete = models.ManyToManyField(User, related_name="documents_can_delete", blank=True)
    
    is_public = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title