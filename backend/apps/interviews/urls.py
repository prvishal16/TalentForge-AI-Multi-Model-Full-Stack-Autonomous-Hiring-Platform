from django.urls import path
from . import views

urlpatterns = [
    path("upcoming/", views.upcoming, name="interviews-upcoming"),
    path("assistant-seed/", views.assistant_seed, name="interviews-assistant-seed"),
]
