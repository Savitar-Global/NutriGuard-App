import { Directory, File, Paths } from 'expo-file-system';

const AVATAR_DIR = 'avatars';

const avatarsDirectory = (): Directory => {
  const dir = new Directory(Paths.document, AVATAR_DIR);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
};

const inferExtension = (sourceUri: string): string => {
  const match = sourceUri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  const ext = match?.[1];
  return ext ? `.${ext.toLowerCase()}` : '.jpg';
};

export const saveAvatarLocally = async (
  uid: string,
  sourceUri: string,
): Promise<string> => {
  const dir = avatarsDirectory();
  const dest = new File(dir, `${uid}${inferExtension(sourceUri)}`);
  if (dest.exists) dest.delete();
  new File(sourceUri).copy(dest);
  return dest.uri;
};

export const deleteAvatarLocally = async (uid: string): Promise<void> => {
  const dir = avatarsDirectory();
  for (const entry of dir.list()) {
    if (entry instanceof File && entry.uri.includes(`/${uid}.`)) {
      entry.delete();
    }
  }
};
