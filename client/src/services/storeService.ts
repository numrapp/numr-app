import { Capacitor } from '@capacitor/core';

const MONTHLY_ID = 'com.numr.invoices.monthly';
const YEARLY_ID = 'com.numr.invoices.yearly';

let storeReady = false;
let storeRef: any = null;

export function initStore(): Promise<void> {
  return new Promise((resolve) => {
    if (!Capacitor.isNativePlatform()) { storeReady = true; resolve(); return; }
    const w = window as any;
    if (!w.CdvPurchase) { storeReady = true; resolve(); return; }

    const { store, ProductType, Platform } = w.CdvPurchase;
    storeRef = store;

    store.register([
      { id: MONTHLY_ID, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.APPLE_APPSTORE },
      { id: YEARLY_ID, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.APPLE_APPSTORE },
    ]);

    store.when().approved((t: any) => t.verify());
    store.when().verified((r: any) => r.finish());

    store.initialize([Platform.APPLE_APPSTORE])
      .then(() => { storeReady = true; resolve(); })
      .catch(() => { storeReady = true; resolve(); });
  });
}

export async function purchaseMonthly(): Promise<boolean> { return purchase(MONTHLY_ID); }
export async function purchaseYearly(): Promise<boolean> { return purchase(YEARLY_ID); }

async function purchase(productId: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;
  if (!storeRef) return false;
  try {
    const product = storeRef.get(productId);
    if (!product) { console.error('Product not found:', productId); return false; }
    const offer = product.getOffer();
    if (!offer) { console.error('No offer for:', productId); return false; }
    await storeRef.order(offer);
    return true;
  } catch (err) { console.error('Purchase error:', err); return false; }
}

export function getSubscriptionStatus() {
  if (!Capacitor.isNativePlatform()) return { active: true, productId: null, expiryDate: null };
  if (!storeRef) return { active: true, productId: null, expiryDate: null };
  const monthly = storeRef.get(MONTHLY_ID);
  const yearly = storeRef.get(YEARLY_ID);
  if (monthly?.owned) return { active: true, productId: MONTHLY_ID, expiryDate: null };
  if (yearly?.owned) return { active: true, productId: YEARLY_ID, expiryDate: null };
  return { active: false, productId: null, expiryDate: null };
}

export function restorePurchases(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve();
  if (!storeRef) return Promise.resolve();
  return storeRef.restorePurchases();
}

export function isStoreReady(): boolean { return storeReady; }
