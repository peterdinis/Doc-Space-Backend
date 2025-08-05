from django.contrib import admin
from .models import SharedDocument, SharedDocumentHistory

admin.site.register(SharedDocument)
admin.site.register(SharedDocumentHistory)