from rest_framework import serializers
from .models import Feedback, User, Department


# Department Serializer
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


# Custom User Serializer
class UserSerializer(serializers.ModelSerializer):
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all(), required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'department', 'password')
        extra_kwargs = {
            'password': {'write_only': True},
            'department': {'required': False},
        }
from rest_framework import serializers
from .models import Feedback, User, Department


# Department Serializer
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


# Custom User Serializer (Reversed Role Logic)
class UserSerializer(serializers.ModelSerializer):
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all(), required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'department', 'password')
        extra_kwargs = {
            'password': {'write_only': True},
            'department': {'required': False},
        }

    def validate(self, attrs):
        role = attrs.get('role')
        department = attrs.get('department')

        # Now only employee requires a department
        if role == 'employee' and not department:
            raise serializers.ValidationError({"department": "Department is required for employees."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            role=validated_data.get('role'),
            department=validated_data.get('department'),
            password=validated_data['password'],
        )
        return user


# Feedback Serializer
class FeedbackSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    responded_by_name = serializers.CharField(source='responded_by.username', read_only=True)

    class Meta:
        model = Feedback
        fields = '__all__'
        read_only_fields = (
            'sentiment',
            'created_at',
            'responded_by',
            'response',
            'status',
            'is_escalated',
        )

    def get_fields(self):
        fields = super().get_fields()
        # Optionally hide department for head users
        if self.initial_data.get('role') == 'head':
            fields.pop('department', None)
        return fields

    def validate(self, attrs):
        role = attrs.get('role')
        department = attrs.get('department')

        if role in ['employee', 'head'] and not department:
            raise serializers.ValidationError({"department": "Department is required for this role."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            role=validated_data.get('role'),
            department=validated_data.get('department'),
            password=validated_data['password'],
        )
        return user


# Feedback Serializer
class FeedbackSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    responded_by_name = serializers.CharField(source='responded_by.username', read_only=True)

    class Meta:
        model = Feedback
        fields = '__all__'
        read_only_fields = (
            'sentiment',
            'created_at',
            'responded_by',
            'response',
            'status',
            'is_escalated',
        )
