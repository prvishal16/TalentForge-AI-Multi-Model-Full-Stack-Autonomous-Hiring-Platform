from django.db import models

class Interview(models.Model):
    candidate_name = models.CharField(max_length=150)
    role = models.CharField(max_length=150, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
