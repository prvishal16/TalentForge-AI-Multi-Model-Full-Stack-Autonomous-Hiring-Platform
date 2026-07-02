from django.db import models

class Candidate(models.Model):
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=150, blank=True)
    location = models.CharField(max_length=150, blank=True)
    stage = models.CharField(max_length=20, default="Applied")
    match_score = models.IntegerField(default=0)
    resume_score = models.IntegerField(default=0)
    email = models.EmailField(blank=True)
    experience = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
