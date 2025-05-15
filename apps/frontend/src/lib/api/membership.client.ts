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

// === Types ===

export type Membership = {
  id: string;
  userId: string;
  businessId: string;
  createdAt: string;
  business?: {
    id: string;
    name: string;
    slug: string;
    logo: string;
    newPost?: boolean; // ✅ New field added
  };
};

export type PotentialMembership = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  _count?: {
    memberships: number;
  };
};

// === API Functions ===

export const joinBusiness = async (businessId: string): Promise<Membership> => {
  const res = await API.post('/memberships', { businessId });
  return res.data;
};

export const leaveBusiness = async (membershipId: string): Promise<void> => {
  await API.delete(`/memberships/${membershipId}`);
};

export const getMyMemberships = async (): Promise<Membership[]> => {
  const res = await API.get('/memberships');
  return res.data;
};

export const checkIfMember = async (businessId: string): Promise<{ isMember: boolean }> => {
  const res = await API.get(`/memberships/${businessId}`);
  return res.data;
};

export const getPotentialMemberships = async (): Promise<PotentialMembership[]> => {
  const res = await API.get('/memberships/potential');
  return res.data;
};
