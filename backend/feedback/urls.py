from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeedbackViewSet, UserViewSet, DepartmentListView, UserRegistrationView

router = DefaultRouter()
router.register(r'feedback', FeedbackViewSet, basename='feedback')
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('departments/', DepartmentListView.as_view(), name='department-list'),
    path('register/', UserRegistrationView.as_view(), name='user-register'),
]
