import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ==========================================
// ENVIRONMENT CONFIGURATION
// ==========================================
// Use your machine's current local IP address here
// To find your IP: Open terminal and type 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux)
const LOCAL_IP = '192.168.1.77'; 

// For Android Emulator, you can also try '10.0.2.2' if the local IP doesn't work
const EMULATOR_IP = '10.0.2.2';

const BASE_URL = `http://${LOCAL_IP}:5000/api`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased to 30 seconds for slow connections
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to log errors for easier debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default api;
