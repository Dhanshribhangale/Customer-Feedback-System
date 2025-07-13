# In backend/backend/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from feedback.views import CustomTokenView
from feedback.serializers import MyTokenObtainPairSerializer
from feedback.serializers import MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from feedback.views import department_feedback_report


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('feedback.urls')),
    path('feedback/report/', department_feedback_report),

    # Add JWT token endpoints
    
    path('api/token/', TokenObtainPairView.as_view(serializer_class=MyTokenObtainPairSerializer), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]