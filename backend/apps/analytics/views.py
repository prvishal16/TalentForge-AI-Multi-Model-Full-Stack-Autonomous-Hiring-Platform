from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["GET"])
def skill_demand(request):
    return Response([])

@api_view(["GET"])
def resume_scores(request):
    return Response([])
