'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getMyMemberships,
  joinBusiness,
  leaveBusiness,
  getPotentialMemberships,
  checkIfMember,
  Membership,
  PotentialMembership,
} from '@/lib/api/membership.client';

export function useMembership() {
  const [memberships, setMemberships] = useState<Membership[] | null>(null);
  const [potential, setPotential] = useState<PotentialMembership[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMemberships = useCallback(async () => {
    setLoading(true);
    const data = await getMyMemberships();
    setMemberships(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  const fetchPotentialMemberships = useCallback(async () => {
    const data = await getPotentialMemberships();
    setPotential(data);
  }, []);

  const handleJoin = useCallback(async (businessId: string) => {
    const newSub = await joinBusiness(businessId);
    setMemberships((prev) => (prev ? [...prev, newSub] : [newSub]));
  }, []);

  const handleLeave = useCallback(async (membershipId: string) => {
    await leaveBusiness(membershipId);
    setMemberships((prev) => prev?.filter((m) => m.id !== membershipId) || []);
  }, []);

  const isMember = useCallback(async (businessId: string): Promise<boolean> => {
    const { isMember } = await checkIfMember(businessId);
    return isMember;
  }, []);

  useEffect(() => {
    fetchMemberships();
    fetchPotentialMemberships();
  }, [fetchMemberships, fetchPotentialMemberships]);

  return {
    memberships,
    potential,
    loading,
    refetch: fetchMemberships,
    join: handleJoin,
    leave: handleLeave,
    isMember,
  };
}
