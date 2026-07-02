from django.urls import path
from . import views

urlpatterns = [
    path("skill-demand/", views.skill_demand, name="analytics-skill-demand"),
    path("resume-scores/", views.resume_scores, name="analytics-resume-scores"),
]
