from django.db import models

class Notification(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    priority = models.CharField(max_length=10, default="low")
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
