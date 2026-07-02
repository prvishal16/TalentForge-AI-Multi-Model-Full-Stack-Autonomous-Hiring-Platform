from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.core.urls")),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/jobs/", include("apps.jobs.urls")),
    path("api/candidates/", include("apps.candidates.urls")),
    path("api/resume/", include("apps.resumes.urls")),
    path("api/interviews/", include("apps.interviews.urls")),
    path("api/analytics/", include("apps.analytics.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
    path("api/ai/", include("apps.ai.urls")),
    path("api/uploads/", include("apps.uploads.urls")),
]
