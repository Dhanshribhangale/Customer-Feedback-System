from django.db import models
from django.contrib.auth.models import AbstractUser


# Department Model
class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


# Custom User Model with Roles and Department
class User(AbstractUser):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('employee', 'Employee'),
        ('head', 'Department Head'),
        ('admin', 'Admin'),
    )
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )

    def __str__(self):
        return f"{self.username} ({self.role})"

    # Add this field to Feedback model
user = models.ForeignKey(
    User,
    on_delete=models.CASCADE,
    null=True,
    blank=True,
    related_name='feedbacks'
)

# Feedback Model
class Feedback(models.Model):
    FEEDBACK_TYPE_CHOICES = (
        ('Complaint', 'Complaint'),
        ('Suggestion', 'Suggestion'),
        ('Appreciation', 'Appreciation'),
    )

    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Closed', 'Closed'),
    )

    name = models.CharField(max_length=100)
    email = models.EmailField()
    feedback_type = models.CharField(max_length=20, choices=FEEDBACK_TYPE_CHOICES)
    comments = models.TextField()
    sentiment = models.CharField(max_length=10, blank=True, null=True)
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='feedbacks'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    # System Use
    is_escalated = models.BooleanField(default=False)
    response = models.TextField(blank=True, null=True)
    responded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='responses'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')

    def __str__(self):
        return f"Feedback from {self.name} - {self.feedback_type} ({self.status})"
