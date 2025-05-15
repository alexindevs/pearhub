// lib/api/feed.client.ts
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

export type FeedItem = {
  id: string;
  title: string;
  description: string;
  type: 'TEXT' | 'IMAGE' | 'LONGFORM' | 'LINK';
  body?: string;
  mediaUrl?: string;
  tags?: string[];
  businessId: string;
  createdAt: string;
  likes: number;
  clicks: number;
  comments: number;
  shares: number;
  views: number;
  user_interactions: {
    [key: string]: boolean;
  };
};

export type FeedPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
export const getBusinessFeed = async (
  slug: string,
  page = 1,
  limit = 12
): Promise<{ data: FeedItem[]; pagination: FeedPagination }> => {
  const res = await API.get(`/feed/${slug}`, {
    params: { page, limit },
  });
  console.log('API Response:', res.data);
  return res.data;
};
export const submitInteraction = async (
  type: 'VIEW' | 'CLICK' | 'LIKE' | 'COMMENT' | 'SHARE',
  contentId: string,
  payload?: string
): Promise<void> => {
  await API.post('/interactions', {
    type,
    contentId,
    payload: type === 'COMMENT' || type === 'SHARE' ? payload : undefined,
  });
};

export const removeInteraction = async (
  type: 'LIKE' | 'COMMENT',
  contentId: string
): Promise<void> => {
  await API.delete('/interactions', {
    params: { type, contentId },
  });
};

export const getPostDetails = async (contentId: string) => {
  const res = await API.get(`/feed/post/${contentId}`);
  return res.data;
};
