from django.contrib import admin
from django.urls import path
from .views import parse_resume, generate_jd, analyze_match

urlpatterns = [
    path('admin/', admin.site.urls),
    path('parse/', parse_resume),
    path('generate-jd/', generate_jd),
    path('analyze-match/', analyze_match),
]
