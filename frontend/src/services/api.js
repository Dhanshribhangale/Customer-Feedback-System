import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api/',
});

// ✅ Automatically attach access token to all requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Decode JWT to get user role
export const getUserRole = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        return decoded.role || null;
    } catch (error) {
        console.error("Invalid or expired token:", error);
        logout();
        return null;
    }
};

// ✅ Auth: Login
export const login = async (credentials) => {
    const response = await apiClient.post('/token/', credentials);
    localStorage.setItem('accessToken', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    return response.data;
};

// ✅ Auth: Logout
export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

// ✅ Custom Action: Remind Employee (HEAD only)
export const remindEmployee = (feedbackId) => {
    return apiClient.post(`feedback/${feedbackId}/remind_employee/`);
};

// ✅ Main API methods
const api = {
    getFeedback() {
        return apiClient.get('feedback/');
    },
    submitFeedback(data) {
        return apiClient.post('feedback/', data);
    },
    registerUser(data) {
        return apiClient.post('register/', data);
    },
    getDepartments() {
        return apiClient.get('departments/');
    },
    respondToFeedback(feedbackId, response) {
        return apiClient.post(`feedback/${feedbackId}/respond/`, response);
    },
    getReport() {
        return apiClient.get('feedback/report/');
    },
    get(url) {
        return apiClient.get(url);
    }
};

export default api;
