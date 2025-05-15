import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem('pearhub_auth') || '{}')?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// GET /business/me
export const getMyBusiness = async () => {
  const res = await API.get('/business/me');
  return res.data;
};

// PUT /business/me
export const updateMyBusiness = async (data: { name?: string; logo?: string }) => {
  const res = await API.put('/business/me', data);
  return res.data;
};

// GET /business/:slug/meta
export const getBusinessMeta = async (slug: string) => {
  const res = await API.get(`/business/${slug}/meta`);
  return res.data;
};
