# 📝 Doc-Space API (Google Docs Clone)

A backend application built using **Django REST Framework** to support a real-time collaborative document editing experience, similar to Google Docs.

---

## 🚀 Features

- ✅ User authentication and profile management
- ✅ Create, read, update, and delete documents
- ✅ Real-time collaboration via WebSockets (Django Channels)
- ✅ Document sharing with permissions (read / write)
- ✅ Email notifications when documents are shared
- ✅ Shared document audit log with history tracking
- ✅ Filtering shared documents by permission or document
- ✅ API documentation using Swagger/OpenAPI (via `drf-yasg`)
- ✅ PostgreSQL and Redis integration for storage and caching

---

## 🧱 Tech Stack

| Layer          | Tech                      |
|----------------|---------------------------|
| Backend        | Django, Django REST Framework |
| Realtime       | Django Channels, Redis    |
| Database       | PostgreSQL                |
| Caching        | Redis                     |
| Auth           | Django's `User` model     |
| API Docs       | drf-yasg (Swagger/OpenAPI)|
| Testing        | Pytest, pytest-django     |

---