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

// === Type Definitions ===

export type AnalyticsOverview = {
  views: number;
  likes: number;
  clicks: number;
  comments: number;
  shares: number;
};

export type ContentTypeDistribution = {
  type: string;
  count: number;
}[];

export type MembershipStats = {
  count: number;
};

export type EngagementBreakdown = Record<string, any>;

export type TopContent = {
  contentId: string;
  title: string;
  interactionCount: number;
};

export type TrendBreakdown = Record<string, any>;

export type PostsPublished = {
  date: string;
  count: number;
}[];

export type AverageInteractions = Record<string, Record<string, number>>;

export type ActiveMembers = {
  totalMembers: number;
  activeMembers: number;
  activeMembersPercentage: number;
};

export type ContentAnalytics = {
  id: string;
  title: string;
  description: string;
  type: string;
  createdAt: string;
  interactions: {
    VIEW: number;
    LIKE: number;
    COMMENT: number;
    SHARE: number;
    CLICK: number;
  };
};

// === API Functions ===

export const getAnalyticsOverview = async (): Promise<AnalyticsOverview> => {
  const res = await API.get('/analytics/overview');
  return res.data;
};

export const getContentTypeDistribution = async (): Promise<ContentTypeDistribution> => {
  const res = await API.get('/analytics/content-type-distribution');
  return res.data;
};

export const getMemberships = async (query: any): Promise<MembershipStats> => {
  const res = await API.get('/analytics/memberships', { params: query });
  return res.data;
};

export const getEngagementBreakdown = async (query: any): Promise<EngagementBreakdown> => {
  const res = await API.get('/analytics/engagement', { params: query });
  return res.data;
};

export const getTopContent = async (query: any): Promise<TopContent[]> => {
  const res = await API.get('/analytics/top-content', { params: query });
  return res.data;
};

export const getTrends = async (query: any): Promise<TrendBreakdown> => {
  const res = await API.get('/analytics/trends', { params: query });
  return res.data;
};

export const getPostsPublished = async (query: any): Promise<PostsPublished> => {
  const res = await API.get('/analytics/posts-published', { params: query });
  return res.data;
};

export const getAverageInteractions = async (query: any): Promise<AverageInteractions> => {
  const res = await API.get('/analytics/average-interactions', { params: query });
  return res.data;
};

export const getActiveMembers = async (query: any): Promise<ActiveMembers> => {
  const res = await API.get('/analytics/active-members', { params: query });
  return res.data;
};

export const getContentAnalytics = async (contentId: string): Promise<ContentAnalytics> => {
  const res = await API.get(`/analytics/content/${contentId}/details`);
  return res.data;
};
