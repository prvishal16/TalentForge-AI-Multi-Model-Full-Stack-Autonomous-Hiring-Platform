from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from django.conf import settings


@api_view(["POST"])
@parser_classes([MultiPartParser])
def upload(request):
    file = request.FILES.get("file")
    kind = request.data.get("kind", "attachment")
    if not file:
        return Response({"detail": "No file provided."}, status=400)

    if settings.CLOUDINARY_URL:
        # TODO: swap in cloudinary.uploader.upload(file) once the
        # `cloudinary` package + CLOUDINARY_URL are configured.
        pass

    # Fallback: store locally / return a placeholder URL.
    return Response({"url": f"/media/{kind}/{file.name}"})
