/**
 * Thin wrapper around `react-native-purchases` (RevenueCat).
 *
 * Two reasons this file exists:
 *   1. Centralise configuration + entitlement parsing so the rest of the app
 *      can stay ignorant of the SDK shape.
 *   2. Provide a runtime mock when the bundle is running inside Expo Go —
 *      the native SDK isn't available there and any call would throw. The
 *      mock keeps the paywall UI fully testable in Expo Go (selection,
 *      buttons, simulated purchase). Real entitlement state only flows
 *      through Dev Client / TestFlight / production builds.
 */

import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

import { env } from '@/config/env';
import { PRODUCT_IDS, REVENUECAT_ENTITLEMENT } from '@/config/constants';
import { AppError } from '@/types/global';

// ---------- public shape (decoupled from the SDK types) ----------

export interface RcPackage {
  identifier: string;
  packageType: 'MONTHLY' | 'ANNUAL' | string;
  product: {
    identifier: string;
    priceString: string;
    title: string;
    priceAmount: number;
    currencyCode: string;
  };
}

export interface RcOffering {
  identifier: string;
  availablePackages: RcPackage[];
  monthly: RcPackage | null;
  annual: RcPackage | null;
}

export interface RcEntitlement {
  isActive: boolean;
  productIdentifier: string | null;
  expirationDate: Date | null;
  willRenew: boolean;
  isSandbox: boolean;
  store: string | null;
  originalPurchaseDate: Date | null;
}

export type CustomerInfoListener = (entitlement: RcEntitlement) => void;

// ---------- Expo Go detection ----------

/**
 * Returns true when the bundle is running inside the Expo Go client.
 * Expo Go does not include arbitrary native modules — react-native-purchases
 * is unavailable, so we have to short-circuit every call.
 */
export const isExpoGo = (): boolean =>
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const isIos = Platform.OS === 'ios';

// ---------- mock offering for Expo Go ----------

const MOCK_OFFERING: RcOffering = (() => {
  const monthly: RcPackage = {
    identifier: '$rc_monthly',
    packageType: 'MONTHLY',
    product: {
      identifier: PRODUCT_IDS.monthly,
      priceString: '$9.99',
      title: 'Monthly',
      priceAmount: 9.99,
      currencyCode: 'USD',
    },
  };
  const annual: RcPackage = {
    identifier: '$rc_annual',
    packageType: 'ANNUAL',
    product: {
      identifier: PRODUCT_IDS.annual,
      priceString: '$49.99',
      title: 'Yearly',
      priceAmount: 49.99,
      currencyCode: 'USD',
    },
  };
  return {
    identifier: 'default',
    availablePackages: [monthly, annual],
    monthly,
    annual,
  };
})();

const EMPTY_ENTITLEMENT: RcEntitlement = {
  isActive: false,
  productIdentifier: null,
  expirationDate: null,
  willRenew: false,
  isSandbox: false,
  store: null,
  originalPurchaseDate: null,
};

// In-memory mock state — survives within a single Expo Go session.
let mockEntitlement: RcEntitlement = EMPTY_ENTITLEMENT;
const mockListeners = new Set<CustomerInfoListener>();

const emitMock = () => {
  for (const cb of mockListeners) cb(mockEntitlement);
};

// ---------- real SDK ----------

// We import lazily so that requiring this module in Expo Go never even
// reaches the native binding lookup. `require` is wrapped in try/catch
// because some bundler configurations evaluate the import at module load.
type PurchasesModule = typeof import('react-native-purchases').default;

let purchasesModule: PurchasesModule | null = null;

const loadPurchases = (): PurchasesModule | null => {
  if (purchasesModule) return purchasesModule;
  if (isExpoGo()) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('react-native-purchases');
    purchasesModule = (mod.default ?? mod) as PurchasesModule;
    return purchasesModule;
  } catch (err) {
    console.warn('[revenuecat] native module unavailable, falling back to mock', err);
    return null;
  }
};

// ---------- helpers ----------

const toDate = (raw: string | null | undefined): Date | null => {
  if (!raw) return null;
  const ms = Date.parse(raw);
  return Number.isFinite(ms) ? new Date(ms) : null;
};

const parseEntitlement = (info: unknown): RcEntitlement => {
  const active = (info as { entitlements?: { active?: Record<string, unknown> } })
    ?.entitlements?.active;
  const ent = active?.[REVENUECAT_ENTITLEMENT] as
    | {
        isActive?: boolean;
        productIdentifier?: string;
        expirationDate?: string | null;
        willRenew?: boolean;
        isSandbox?: boolean;
        store?: string;
        originalPurchaseDate?: string | null;
      }
    | undefined;

  if (!ent || ent.isActive === false) return EMPTY_ENTITLEMENT;

  return {
    isActive: true,
    productIdentifier: ent.productIdentifier ?? null,
    expirationDate: toDate(ent.expirationDate ?? null),
    willRenew: ent.willRenew ?? true,
    isSandbox: ent.isSandbox ?? false,
    store: ent.store ?? null,
    originalPurchaseDate: toDate(ent.originalPurchaseDate ?? null),
  };
};

// ---------- public API ----------

export const revenueCat = {
  isMock: () => isExpoGo() || !loadPurchases(),

  async configure(appUserId: string | null): Promise<void> {
    if (!isIos) return;

    if (isExpoGo()) {
      console.log('[revenuecat] running in Expo Go — using mock SDK');
      return;
    }

    const Purchases = loadPurchases();
    if (!Purchases) return;

    const apiKey = env.revenueCatIosKey;
    if (!apiKey) {
      console.warn('[revenuecat] missing EXPO_PUBLIC_REVENUECAT_IOS_KEY');
      return;
    }

    try {
      Purchases.setLogLevel?.(
        (await import('react-native-purchases')).LOG_LEVEL?.WARN ?? 0,
      );
    } catch {
      /* log-level setter is best-effort */
    }

    Purchases.configure({ apiKey, appUserID: appUserId ?? undefined });
  },

  async logIn(uid: string): Promise<RcEntitlement> {
    if (revenueCat.isMock()) return mockEntitlement;
    const Purchases = loadPurchases();
    if (!Purchases) return EMPTY_ENTITLEMENT;
    const result = await Purchases.logIn(uid);
    return parseEntitlement(result.customerInfo);
  },

  async logOut(): Promise<void> {
    if (revenueCat.isMock()) {
      mockEntitlement = EMPTY_ENTITLEMENT;
      emitMock();
      return;
    }
    const Purchases = loadPurchases();
    if (!Purchases) return;
    try {
      await Purchases.logOut();
    } catch (err) {
      // logOut throws if the current user is anonymous — safe to ignore.
      console.warn('[revenuecat] logOut ignored', err);
    }
  },

  async getOffering(): Promise<RcOffering | null> {
    if (revenueCat.isMock()) return MOCK_OFFERING;

    const Purchases = loadPurchases();
    if (!Purchases) return null;

    try {
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      if (!current) return null;

      const availablePackages: RcPackage[] = current.availablePackages.map((p) => ({
        identifier: p.identifier,
        packageType: p.packageType,
        product: {
          identifier: p.product.identifier,
          priceString: p.product.priceString,
          title: p.product.title,
          priceAmount: p.product.price,
          currencyCode: p.product.currencyCode,
        },
      }));

      const findByType = (type: 'MONTHLY' | 'ANNUAL') =>
        availablePackages.find((p) => p.packageType === type) ?? null;

      return {
        identifier: current.identifier,
        availablePackages,
        monthly: findByType('MONTHLY'),
        annual: findByType('ANNUAL'),
      };
    } catch (err) {
      console.error('[revenuecat] getOffering failed', err);
      throw new AppError('NETWORK', 'Could not load subscription plans.');
    }
  },

  async getEntitlement(): Promise<RcEntitlement> {
    if (revenueCat.isMock()) return mockEntitlement;
    const Purchases = loadPurchases();
    if (!Purchases) return EMPTY_ENTITLEMENT;
    const info = await Purchases.getCustomerInfo();
    return parseEntitlement(info);
  },

  async purchase(pkg: RcPackage): Promise<RcEntitlement> {
    if (revenueCat.isMock()) {
      // Simulate the native purchase sheet round-trip in Expo Go.
      await new Promise((r) => setTimeout(r, 900));
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
      const period = pkg.packageType === 'ANNUAL' ? oneYearMs : oneMonthMs;
      mockEntitlement = {
        isActive: true,
        productIdentifier: pkg.product.identifier,
        expirationDate: new Date(Date.now() + period),
        willRenew: true,
        isSandbox: true,
        store: 'mock',
        originalPurchaseDate: new Date(),
      };
      emitMock();
      return mockEntitlement;
    }

    const Purchases = loadPurchases();
    if (!Purchases) throw new AppError('PURCHASE_FAILED', 'Purchases unavailable.');

    try {
      const offerings = await Purchases.getOfferings();
      const native = offerings.current?.availablePackages.find(
        (p) => p.identifier === pkg.identifier,
      );
      if (!native) throw new AppError('PURCHASE_FAILED', 'Plan no longer available.');

      const result = await Purchases.purchasePackage(native);
      return parseEntitlement(result.customerInfo);
    } catch (err) {
      const cancelled =
        (err as { userCancelled?: boolean })?.userCancelled === true ||
        (err as { code?: string })?.code === 'PURCHASE_CANCELLED';
      if (cancelled) throw new AppError('PURCHASE_CANCELLED');
      console.error('[revenuecat] purchase failed', err);
      throw new AppError(
        'PURCHASE_FAILED',
        (err as { message?: string })?.message ?? 'Purchase failed.',
      );
    }
  },

  async restore(): Promise<RcEntitlement> {
    if (revenueCat.isMock()) return mockEntitlement;
    const Purchases = loadPurchases();
    if (!Purchases) return EMPTY_ENTITLEMENT;
    const info = await Purchases.restorePurchases();
    return parseEntitlement(info);
  },

  addCustomerInfoListener(cb: CustomerInfoListener): () => void {
    if (revenueCat.isMock()) {
      mockListeners.add(cb);
      return () => mockListeners.delete(cb);
    }
    const Purchases = loadPurchases();
    if (!Purchases) return () => undefined;
    const handler = (info: unknown) => cb(parseEntitlement(info));
    Purchases.addCustomerInfoUpdateListener(handler);
    return () => {
      try {
        Purchases.removeCustomerInfoUpdateListener(handler);
      } catch {
        /* listener API is fire-and-forget — safe to ignore */
      }
    };
  },
};

export { EMPTY_ENTITLEMENT };
