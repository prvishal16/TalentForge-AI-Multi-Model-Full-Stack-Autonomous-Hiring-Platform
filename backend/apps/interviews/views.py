from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["GET"])
def upcoming(request):
    return Response([])

@api_view(["GET"])
def assistant_seed(request):
    return Response([])
