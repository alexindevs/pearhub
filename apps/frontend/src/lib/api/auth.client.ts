import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: false,
});

// Attach token from localStorage
API.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem('pearhub_auth') || '{}')?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email: string, password: string) => {
  const res = await API.post('/auth/login', { email, password });
  return res.data;
};

export const signup = async (payload: {
  email: string;
  name: string;
  password: string;
  role: 'MEMBER' | 'BUSINESS';
  businessName?: string;
}) => {
  const res = await API.post('/auth/signup', payload);
  return res.data;
};
