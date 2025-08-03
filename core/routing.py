from django.urls import re_path
from documents.consumers import DocumentConsumer

websocket_urlpatterns = [
    re_path(r"ws/documents/(?P<document_id>\w+)/$", DocumentConsumer.as_asgi()),
]