import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';

let cached: Promise<string> | null = null;

export const getDemoMealPhotoBase64 = (): Promise<string> => {
  if (!cached) {
    cached = (async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('../../../assets/food_photo.webp');
      const asset = Asset.fromModule(mod);
      await asset.downloadAsync();
      if (!asset.localUri) {
        throw new Error('Demo meal photo localUri unavailable');
      }
      return new File(asset.localUri).base64();
    })().catch((err) => {
      cached = null;
      throw err;
    });
  }
  return cached;
};
