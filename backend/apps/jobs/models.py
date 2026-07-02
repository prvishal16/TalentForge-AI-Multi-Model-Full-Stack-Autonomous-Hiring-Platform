from django.db import models

class Job(models.Model):
    title = models.CharField(max_length=200)
    department = models.CharField(max_length=120, blank=True)
    location = models.CharField(max_length=120, blank=True)
    type = models.CharField(max_length=20, default="Full-time")
    status = models.CharField(max_length=20, default="Open")
    applicants = models.IntegerField(default=0)
    priority = models.CharField(max_length=5, default="P2")
    match_rate = models.IntegerField(default=0)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
