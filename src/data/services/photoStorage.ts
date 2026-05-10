import { Directory, File, Paths } from 'expo-file-system';

const SCANS_DIR = 'scans';

const scansDirectory = (): Directory => {
  const dir = new Directory(Paths.document, SCANS_DIR);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
};

const isoFilename = (): string => {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${stamp}.jpg`;
};

// Per overview §12: storage is bounded to the single most recent scan photo.
const purgePreviousScans = (keepUri?: string): void => {
  const dir = scansDirectory();
  for (const entry of dir.list()) {
    if (entry instanceof File && entry.uri !== keepUri) {
      entry.delete();
    }
  }
};

export const saveScanPhoto = async (sourceUri: string): Promise<string> => {
  const dir = scansDirectory();
  const dest = new File(dir, isoFilename());
  new File(sourceUri).copy(dest);
  purgePreviousScans(dest.uri);
  return dest.uri;
};

export const readScanPhotoBase64 = async (uri: string): Promise<string> => {
  const file = new File(uri);
  return file.base64();
};

export const deleteAllScanPhotos = (): void => {
  purgePreviousScans();
};
