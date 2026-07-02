from django.db import models

class ResumeAnalysis(models.Model):
    file_name = models.CharField(max_length=255, blank=True)
    score = models.IntegerField(default=0)
    summary = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
