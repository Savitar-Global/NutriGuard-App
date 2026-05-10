import type { Scan } from '@/domain/entities/Scan';

export interface ScanRepository {
  save(uid: string, scan: Scan): Promise<void>;
  load(uid: string): Promise<Scan | null>;
  clear(uid: string): Promise<void>;
}
