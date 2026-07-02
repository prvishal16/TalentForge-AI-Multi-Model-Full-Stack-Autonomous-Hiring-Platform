from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["POST"])
def logout(request):
    return Response({"detail": "Logged out."})

@api_view(["GET"])
def session(request):
    if not request.user.is_authenticated:
        return Response({"detail": "Not authenticated."}, status=401)
    return Response({"id": request.user.id, "email": request.user.email})
