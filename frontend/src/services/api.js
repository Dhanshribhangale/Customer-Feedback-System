import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api/',
});

// Interceptor to add the token to every request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Function to handle login
export const login = async (credentials) => {
    const response = await apiClient.post('/token/', credentials);
    localStorage.setItem('accessToken', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    return response.data;
};

// Function to handle logout
export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

// Function to get the current user's role from the token
export const getUserRole = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        return decoded.role; // Assuming your token includes the user's role
    } catch (error) {
        console.error("Invalid token:", error);
        logout();
        return null;
    }
};


export default {
    getFeedback() {
        return apiClient.get('feedback/');
    },
    submitFeedback(data) {
        return apiClient.post('feedback/', data);
    },
    registerUser(data) {
        return apiClient.post('register/', data);
    }
};