import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { userFromDoc } from '@/data/mappers/userMapper';
import { firebaseFirestore } from '@/data/services/firebase';
import type { User } from '@/domain/entities/User';
import type {
  SeedUserInput,
  UserRepository,
} from '@/domain/repositories/UserRepository';

const usersCollection = () => collection(firebaseFirestore, 'users');

const userRef = (uid: string) => doc(usersCollection(), uid);

export const firestoreUserRepository: UserRepository = {
  async get(uid) {
    const snap = await getDoc(userRef(uid));
    if (!snap.exists()) return null;
    return userFromDoc(uid, snap.data());
  },

  async seedIfMissing({ uid, email, displayName, authProvider }) {
    const ref = userRef(uid);
    const existing = await getDoc(ref);
    if (existing.exists()) {
      return userFromDoc(uid, existing.data());
    }

    const now = serverTimestamp();
    const seed = {
      email,
      displayName,
      authProvider,
      conditions: [],
      customConditions: [],
      weightKg: 0,
      heightCm: 0,
      birthday: null,
      streakCount: 0,
      lastScanDate: null,
      plan: 'free' as const,
      lifetimePhotoScansUsed: 0,
      disclaimerAcknowledgedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(ref, seed);
    const created = await getDoc(ref);
    return userFromDoc(uid, created.data() ?? {});
  },

  async update(uid, patch) {
    await updateDoc(userRef(uid), {
      ...patch,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(uid) {
    await deleteDoc(userRef(uid));
  },
};

export type { User };
