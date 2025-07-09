# In backend/feedback/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeedbackViewSet, UserRegistrationView # Import new view

router = DefaultRouter()
router.register(r'feedback', FeedbackViewSet, basename='feedback')

urlpatterns = [
    path('', include(router.urls)),
    # Add the registration URL
    path('register/', UserRegistrationView.as_view(), name='user_register'),
]