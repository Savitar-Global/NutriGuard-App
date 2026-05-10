import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';

import { scanFromDoc, scanToDoc } from '@/data/mappers/scanMapper';
import { firebaseFirestore } from '@/data/services/firebase';
import type { ScanRepository } from '@/domain/repositories/ScanRepository';

// Per overview §6 — single doc with the fixed ID `scan`, overwritten each time.
const CURRENT_SCAN_ID = 'scan';

const currentScanRef = (uid: string) =>
  doc(firebaseFirestore, 'users', uid, 'currentScan', CURRENT_SCAN_ID);

export const firestoreScanRepository: ScanRepository = {
  async save(uid, scan) {
    await setDoc(currentScanRef(uid), scanToDoc(scan));
  },

  async load(uid) {
    const snap = await getDoc(currentScanRef(uid));
    if (!snap.exists()) return null;
    return scanFromDoc(snap.data());
  },

  async clear(uid) {
    await deleteDoc(currentScanRef(uid));
  },
};
