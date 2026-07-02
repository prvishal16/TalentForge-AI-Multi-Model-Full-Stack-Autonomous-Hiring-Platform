from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Candidate
from .serializers import CandidateSerializer

class CandidateViewSet(viewsets.ModelViewSet):
    queryset = Candidate.objects.all().order_by("-created_at")
    serializer_class = CandidateSerializer

    @action(detail=False, methods=["get"])
    def applications(self, request):
        return Response([])

    @action(detail=False, methods=["get"], url_path="skill-gaps")
    def skill_gaps(self, request):
        return Response([])
