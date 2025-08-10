// client/src/services/authApi.js
import axios from "axios";

// Create an Axios instance with a base URL.
// If proxy is set up in vite.config.js, just use '/api'.
// Otherwise, use 'http://localhost:5000/api'.
const API = axios.create({
  baseURL: "/api", // This will be proxied to http://localhost:5000/api by Vite
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the JWT token to outgoing requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const registerUser = async (userData) => {
  try {
    const response = await API.post("/auth/register", userData);
    return response.data; // Returns { success, message, data: { user, token } }
  } catch (error) {
    // Axios errors have a `response` object for server-sent errors
    // We throw the error.response.data to propagate the backend's structured error
    throw error.response?.data || error.message;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await API.post("/auth/login", credentials);
    return response.data; // Returns { success, message, data: { user, token } }
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// You'll add more API functions here later, e.g., for fetching user profile
export const getUserProfile = async (userId) => {
  try {
    const response = await API.get(`/users/${userId}`); // Assuming a /api/users/:userId endpoint later
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
