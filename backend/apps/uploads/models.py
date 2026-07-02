from django.db import models

class UploadedAsset(models.Model):
    kind = models.CharField(max_length=30)
    url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
