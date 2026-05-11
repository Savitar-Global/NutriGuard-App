import { create } from 'zustand';

import { firestoreUserRepository } from '@/data/repositories/FirestoreUserRepository';
import {
  EMPTY_ENTITLEMENT,
  revenueCat,
  type RcEntitlement,
  type RcOffering,
  type RcPackage,
} from '@/data/services/revenuecat';
import { AppError } from '@/types/global';

import { useUserStore } from './userStore';

interface EntitlementState {
  isPro: boolean;
  entitlement: RcEntitlement;
  offering: RcOffering | null;
  isLoadingOffering: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  error: AppError | null;

  init: (uid: string) => Promise<void>;
  refreshOffering: () => Promise<void>;
  purchase: (pkg: RcPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
  reset: () => Promise<void>;
  clearError: () => void;
}

const wrapError = (raw: unknown): AppError => {
  if (raw instanceof AppError) return raw;
  return new AppError(
    'UNKNOWN',
    (raw as { message?: string } | null)?.message ?? 'Something went wrong',
  );
};

let unsubscribeListener: (() => void) | null = null;
let lastSyncedUid: string | null = null;
let lastSyncedPlan: 'free' | 'pro' | null = null;

/**
 * Mirror the active entitlement onto `users/{uid}.plan` so the rest of the
 * app can rely on a single source of truth (the Firestore doc). We only
 * write when the value would actually change to avoid extra Firestore
 * traffic on every customer-info ping.
 */
async function syncPlanToFirestore(entitlement: RcEntitlement) {
  const profile = useUserStore.getState().profile;
  if (!profile) return;

  const targetPlan: 'free' | 'pro' = entitlement.isActive ? 'pro' : 'free';
  if (
    lastSyncedUid === profile.uid &&
    lastSyncedPlan === targetPlan &&
    profile.plan === targetPlan
  ) {
    return;
  }

  if (profile.plan === targetPlan) {
    lastSyncedUid = profile.uid;
    lastSyncedPlan = targetPlan;
    return;
  }

  try {
    await firestoreUserRepository.update(profile.uid, { plan: targetPlan });
    useUserStore.setState({
      profile: { ...profile, plan: targetPlan, updatedAt: new Date() },
    });
    lastSyncedUid = profile.uid;
    lastSyncedPlan = targetPlan;
  } catch (err) {
    console.error('[entitlementStore] failed to sync plan to Firestore', err);
  }
}

export const useEntitlementStore = create<EntitlementState>((set, get) => ({
  isPro: false,
  entitlement: EMPTY_ENTITLEMENT,
  offering: null,
  isLoadingOffering: false,
  isPurchasing: false,
  isRestoring: false,
  error: null,

  init: async (uid: string) => {
    try {
      await revenueCat.configure(uid);
      const entitlement = await revenueCat.logIn(uid);
      set({ entitlement, isPro: entitlement.isActive });
      void syncPlanToFirestore(entitlement);

      // Subscribe to native customer-info updates (renewals, expirations,
      // cross-device purchases). The listener fires on every state change.
      if (unsubscribeListener) unsubscribeListener();
      unsubscribeListener = revenueCat.addCustomerInfoListener((ent) => {
        set({ entitlement: ent, isPro: ent.isActive });
        void syncPlanToFirestore(ent);
      });

      void get().refreshOffering();
    } catch (err) {
      console.error('[entitlementStore] init failed', err);
      set({ error: wrapError(err) });
    }
  },

  refreshOffering: async () => {
    if (get().isLoadingOffering) return;
    set({ isLoadingOffering: true, error: null });
    try {
      const offering = await revenueCat.getOffering();
      set({ offering });
    } catch (err) {
      console.error('[entitlementStore] refreshOffering failed', err);
      set({ error: wrapError(err) });
    } finally {
      set({ isLoadingOffering: false });
    }
  },

  purchase: async (pkg) => {
    if (get().isPurchasing) return false;
    set({ isPurchasing: true, error: null });
    try {
      const entitlement = await revenueCat.purchase(pkg);
      set({ entitlement, isPro: entitlement.isActive });
      await syncPlanToFirestore(entitlement);
      return entitlement.isActive;
    } catch (err) {
      const mapped = wrapError(err);
      if (mapped.code !== 'PURCHASE_CANCELLED') {
        set({ error: mapped });
      }
      return false;
    } finally {
      set({ isPurchasing: false });
    }
  },

  restore: async () => {
    if (get().isRestoring) return false;
    set({ isRestoring: true, error: null });
    try {
      const entitlement = await revenueCat.restore();
      set({ entitlement, isPro: entitlement.isActive });
      await syncPlanToFirestore(entitlement);
      return entitlement.isActive;
    } catch (err) {
      set({ error: wrapError(err) });
      return false;
    } finally {
      set({ isRestoring: false });
    }
  },

  reset: async () => {
    if (unsubscribeListener) {
      unsubscribeListener();
      unsubscribeListener = null;
    }
    lastSyncedUid = null;
    lastSyncedPlan = null;
    await revenueCat.logOut();
    set({
      isPro: false,
      entitlement: EMPTY_ENTITLEMENT,
      offering: null,
      isLoadingOffering: false,
      isPurchasing: false,
      isRestoring: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
