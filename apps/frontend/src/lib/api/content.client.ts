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

// GET /content – Get all business content
export const getAllContent = async () => {
  const res = await API.get('/content');
  return res.data;
};

// POST /content – Create new content
export const createContent = async (data: {
  title: string;
  description: string;
  type: 'TEXT' | 'IMAGE' | 'LONGFORM' | 'LINK' | string;
  body: string;
  mediaUrl?: string;
  tags?: string[];
}) => {
  const res = await API.post('/content', data);
  return res.data;
};

// GET /content/:id – Get single content
export const getContentById = async (id: string) => {
  const res = await API.get(`/content/${id}`);
  return res.data;
};

// PUT /content/:id – Update content
export const updateContent = async (
  id: string,
  data: Partial<{
    title: string;
    description: string;
    type: 'TEXT' | 'IMAGE' | 'LONGFORM' | 'LINK';
    body: string;
    mediaUrl?: string;
    tags?: string[];
  }>
) => {
  const res = await API.put(`/content/${id}`, data);
  return res.data;
};

// DELETE /content/:id – Delete content
export const deleteContent = async (id: string) => {
  await API.delete(`/content/${id}`);
};
