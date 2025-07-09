from django.shortcuts import render
from rest_framework import viewsets, permissions, generics
# Create your views here.
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Feedback, User
from .serializers import FeedbackSerializer, UserSerializer
from textblob import TextBlob
from django.core.mail import send_mail

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny] # Anyone can register

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all().order_by('-created_at')
    serializer_class = FeedbackSerializer
    # Only authenticated users can see the dashboard.
    # AllowAny for create lets non-logged-in users submit feedback.
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return super().get_permissions()

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all().order_by('-created_at')
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Sentiment Analysis
        comments = serializer.validated_data['comments']
        analysis = TextBlob(comments)
        sentiment = "Neutral"
        if analysis.sentiment.polarity > 0.1:
            sentiment = "Positive"
        elif analysis.sentiment.polarity < -0.1:
            sentiment = "Negative"

        # Save the feedback with sentiment
        feedback_instance = serializer.save(sentiment=sentiment)

        # Email Notification for Negative Feedback
        if sentiment == "Negative":
            admins = User.objects.filter(role='admin')
            admin_emails = [admin.email for admin in admins if admin.email]
            if admin_emails:
                send_mail(
                    'Negative Feedback Received',
                    f'A new piece of negative feedback has been submitted by {feedback_instance.name}.\n\nComments: {feedback_instance.comments}',
                    'no-reply@feedbacksystem.com',
                    admin_emails,
                    fail_silently=False, # Set to True in production if needed
                )

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)