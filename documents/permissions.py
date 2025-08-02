from rest_framework import permissions

class IsDocumentOwnerOrShared(permissions.BasePermission):
    """
    Custom permission:
    - Owner has full access.
    - Users in can_edit have full access (edit, update, delete).
    - Users in can_view have read-only access.
    - If is_public, any authenticated user can read.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        # Allow all safe methods if document is public
        if obj.is_public and request.method in permissions.SAFE_METHODS:
            return True

        # Owner has full access
        if obj.owner == user:
            return True

        # Users with edit permission can do anything except delete (optional)
        if user in obj.can_edit.all():
            # Optionally, you can restrict DELETE to owner only here:
            if request.method == 'DELETE':
                return False
            return True

        # Users with view permission can only read
        if user in obj.can_view.all() and request.method in permissions.SAFE_METHODS:
            return True

        # Otherwise deny
        return False