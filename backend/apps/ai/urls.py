from django.urls import path
from . import views

urlpatterns = [
    path("generate-interview/", views.generate_interview, name="ai-generate-interview"),
    path("ats/", views.ats, name="ai-ats"),
    path("cover-letter/", views.cover_letter, name="ai-cover-letter"),
    path("career-plan/", views.career_plan, name="ai-career-plan"),
]
