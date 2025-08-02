from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from documents.models import Document

class DocumentInline(admin.TabularInline):
    model = Document
    extra = 0
    fields = ('title', 'created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')
    show_change_link = True

class CustomUserAdmin(BaseUserAdmin):
    inlines = [DocumentInline]

    list_display = BaseUserAdmin.list_display + ('document_count',)

    def document_count(self, obj):
        return obj.documents.count()
    document_count.short_description = 'Documents'
    
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)