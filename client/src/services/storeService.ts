import { Capacitor } from '@capacitor/core';

const MONTHLY_ID = 'com.numr.invoices.monthly';
const YEARLY_ID = 'com.numr.invoices.yearly';

interface SubStatus {
  active: boolean;
  productId: string | null;
  expiryDate: string | null;
}

let storeReady = false;

export function initStore(): Promise<void> {
  return new Promise((resolve) => {
    if (!Capacitor.isNativePlatform()) {
      storeReady = true;
      resolve();
      return;
    }

    const w = window as any;
    if (!w.CdvPurchase) {
      storeReady = true;
      resolve();
      return;
    }

    const { store, ProductType, Platform } = w.CdvPurchase;

    store.register([
      { id: MONTHLY_ID, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.APPLE_APPSTORE },
      { id: YEARLY_ID, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.APPLE_APPSTORE },
    ]);

    store.when().approved((transaction: any) => {
      transaction.verify();
    });

    store.when().verified((receipt: any) => {
      receipt.finish();
    });

    store.initialize([Platform.APPLE_APPSTORE])
      .then(() => { storeReady = true; resolve(); })
      .catch(() => { storeReady = true; resolve(); });
  });
}

export function getProducts(): any[] {
  if (!Capacitor.isNativePlatform()) return [];
  const w = window as any;
  if (!w.CdvPurchase) return [];
  const { store } = w.CdvPurchase;
  return store.products || [];
}

export function getMonthlyProduct(): any {
  return getProducts().find((p: any) => p.id === MONTHLY_ID) || null;
}

export function getYearlyProduct(): any {
  return getProducts().find((p: any) => p.id === YEARLY_ID) || null;
}

export async function purchaseMonthly(): Promise<boolean> {
  return purchase(MONTHLY_ID);
}

export async function purchaseYearly(): Promise<boolean> {
  return purchase(YEARLY_ID);
}

async function purchase(productId: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;
  const w = window as any;
  if (!w.CdvPurchase) return true;
  const { store } = w.CdvPurchase;
  const product = store.get(productId);
  if (!product) return false;
  const offer = product.getOffer();
  if (!offer) return false;
  try {
    await store.order(offer);
    return true;
  } catch {
    return false;
  }
}

export function getSubscriptionStatus(): SubStatus {
  if (!Capacitor.isNativePlatform()) {
    return { active: true, productId: null, expiryDate: null };
  }
  const w = window as any;
  if (!w.CdvPurchase) {
    return { active: true, productId: null, expiryDate: null };
  }
  const { store } = w.CdvPurchase;
  const monthly = store.get(MONTHLY_ID);
  const yearly = store.get(YEARLY_ID);
  if (monthly?.owned) return { active: true, productId: MONTHLY_ID, expiryDate: null };
  if (yearly?.owned) return { active: true, productId: YEARLY_ID, expiryDate: null };
  return { active: false, productId: null, expiryDate: null };
}

export function restorePurchases(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve();
  const w = window as any;
  if (!w.CdvPurchase) return Promise.resolve();
  return w.CdvPurchase.store.restorePurchases();
}

export function isStoreReady(): boolean {
  return storeReady;
}
