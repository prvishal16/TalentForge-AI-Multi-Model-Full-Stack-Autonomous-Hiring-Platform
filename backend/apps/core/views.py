from django.http import JsonResponse

def health(request):
    """Lightweight health check used by the frontend's Hybrid Data Layer."""
    return JsonResponse({"status": "ok"})
