from django.shortcuts import render
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import Feedback, User, Department
from .serializers import (
    FeedbackSerializer, UserSerializer, DepartmentSerializer,
    CustomTokenObtainPairSerializer
)
from textblob import TextBlob
from django.core.mail import send_mail
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView


# ✅ Department List API
class DepartmentListView(generics.ListAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]


# ✅ User ViewSet (admin only)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


# ✅ JWT Token View
class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# ✅ User Registration View
class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("Registration error:", serializer.errors)
            return Response(serializer.errors, status=400)
        self.perform_create(serializer)
        return Response(serializer.data, status=201)


# ✅ Feedback ViewSet
class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all().order_by('-created_at')
    serializer_class = FeedbackSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Feedback.objects.none()

        if user.role == 'admin':
            return Feedback.objects.all().order_by('-created_at')
        elif user.role in ['head', 'employee']:
            return Feedback.objects.filter(department=user.department).order_by('-created_at')
        elif user.role == 'customer':
            return Feedback.objects.filter(name=user.username).order_by('-created_at')

        return Feedback.objects.none()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        comments = serializer.validated_data['comments']
        analysis = TextBlob(comments)
        sentiment = "Neutral"
        if analysis.sentiment.polarity > 0.1:
            sentiment = "Positive"
        elif analysis.sentiment.polarity < -0.1:
            sentiment = "Negative"

        feedback_instance = serializer.save(sentiment=sentiment)

        if request.user.is_authenticated:
            feedback_instance.user = request.user
            feedback_instance.save()

        # ✅ Auto-reply for Positive Sentiment
        if sentiment == "Positive":
            feedback_instance.response = "Thank you for your positive feedback!"
            feedback_instance.status = "Closed"
            feedback_instance.save()

            if feedback_instance.email:
                try:
                    send_mail(
                        'Thank You for Your Feedback',
                        'We appreciate your positive feedback. 😊\n\nResponse:\nThank you for your positive feedback!',
                        'no-reply@feedbacksystem.com',
                        [feedback_instance.email],
                        fail_silently=False
                    )
                except Exception as e:
                    print(f"Failed to send email to customer (positive): {e}")

        # 🚨 Escalate if Negative
        elif sentiment == "Negative":
            feedback_instance.is_escalated = True
            feedback_instance.save()

            employee = User.objects.filter(role='employee', department=feedback_instance.department).first()
            if employee and employee.email:
                try:
                    send_mail(
                        'Escalated Feedback Alert',
                        f'New negative feedback from {feedback_instance.name} in your department.\n\nComments:\n{feedback_instance.comments}',
                        'no-reply@feedbacksystem.com',
                        [employee.email],
                        fail_silently=False
                    )
                except Exception as e:
                    print(f"Failed to send email to employee: {e}")

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    # ✅ Respond to Feedback (Employee only)
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def respond(self, request, pk=None):
        feedback = self.get_object()

        if request.user.role != 'employee' or request.user.department != feedback.department:
            return Response({"error": "Not authorized to respond"}, status=403)

        response_text = request.data.get('response', '').strip()
        if not response_text:
            return Response({"error": "Response cannot be empty"}, status=400)

        feedback.response = response_text
        feedback.status = 'Closed'
        feedback.responded_by = request.user
        feedback.save()

        if feedback.email:
            try:
                send_mail(
                    'Response to Your Feedback',
                    f'Your feedback has been reviewed.\n\nResponse:\n{response_text}',
                    'no-reply@feedbacksystem.com',
                    [feedback.email],
                    fail_silently=False
                )
            except Exception as e:
                print(f"Failed to send email to customer: {e}")

        return Response({'status': 'Reply sent successfully'})

    # ✅ Report for Head
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def report(self, request):
        if request.user.role != 'head':
            return Response({'error': 'Unauthorized'}, status=403)

        department = request.user.department
        total = Feedback.objects.filter(department=department).count()
        closed = Feedback.objects.filter(department=department, status='Closed').count()
        pending = Feedback.objects.filter(department=department, status='Pending').count()

        return Response({
            'total_feedbacks': total,
            'closed_feedbacks': closed,
            'pending_feedbacks': pending,
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def remind_employee(self, request, pk=None):
        feedback = self.get_object()

        if request.user.role != 'head':
            return Response({'error': 'Only department heads can send reminders.'}, status=403)

        if feedback.sentiment != 'Negative' or feedback.status != 'Pending' or feedback.response:
            return Response({'error': 'This feedback is not eligible for a reminder.'}, status=400)

        employees = User.objects.filter(role='employee', department=feedback.department)

        if not employees.exists():
            return Response({'error': 'No employees found in the department.'}, status=404)

        for employee in employees:
            if employee.email:
                try:
                    send_mail(
                        'Reminder: Feedback Needs Attention',
                        f'Dear {employee.username},\n\nYou have pending negative feedback to respond to.\n\n'
                        f'Feedback from: {feedback.name}\nComment: {feedback.comments}\n\n'
                        f'Please respond at your earliest convenience.',
                        'no-reply@feedbacksystem.com',
                        [employee.email],
                        fail_silently=False
                    )
                except Exception as e:
                    print(f"Failed to send reminder to {employee.email}: {e}")

        return Response({'status': 'Reminder sent to department employees.'})


# ✅ Optional Department Report Summary (Separate View)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_feedback_report(request):
    user = request.user
    if user.role != 'head':
        return Response({'error': 'Unauthorized'}, status=403)

    department = user.department
    feedbacks = Feedback.objects.filter(department=department)

    received_count = feedbacks.count()
    closed_count = feedbacks.filter(status='Closed').count()
    pending_count = feedbacks.filter(status='Pending').count()

    return Response({
        'received': received_count,
        'closed': closed_count,
        'pending': pending_count
    })
