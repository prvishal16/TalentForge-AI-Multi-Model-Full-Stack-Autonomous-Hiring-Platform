from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

@api_view(["POST"])
@parser_classes([MultiPartParser])
def analyze(request):
    # TODO: integrate Django Resume Engine / OpenRouter parsing.
    return Response({"score": 87, "summary": "Strong technical match with minor keyword gaps."})
