from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('staff', 'Staff'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='staff')

class Feedback(models.Model):
    FEEDBACK_TYPE_CHOICES = (
        ('Complaint', 'Complaint'),
        ('Suggestion', 'Suggestion'),
        ('Compliment', 'Compliment'),
    )
    name = models.CharField(max_length=100)
    email = models.EmailField()
    feedback_type = models.CharField(max_length=20, choices=FEEDBACK_TYPE_CHOICES)
    comments = models.TextField()
    sentiment = models.CharField(max_length=10, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback from {self.name}"