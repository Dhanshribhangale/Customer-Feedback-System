import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api/',
});

// ✅ Add access token to each request
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

export const submitFeedback = (data) =>
    apiClient.post('feedback/', data); // token already added via interceptor

// ✅ Login - store tokens
export const login = async (credentials) => {
    const response = await apiClient.post('/token/', credentials);
    localStorage.setItem('accessToken', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    return response.data;
};

// ✅ Logout - remove tokens
export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

// ✅ Decode JWT to extract user role
export const getUserRole = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        return decoded.role || null; // role should be in your token's payload
    } catch (error) {
        console.error("Invalid or expired token:", error);
        logout();
        return null;
    }
};

// ✅ Main API services
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
};

export default api;
