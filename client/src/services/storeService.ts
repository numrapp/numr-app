import { Capacitor } from '@capacitor/core';

const MONTHLY_ID = 'com.numr.invoices.monthly';
const YEARLY_ID = 'com.numr.invoices.yearly';

let initialized = false;

function getStore(): any {
  const w = window as any;
  return w.CdvPurchase?.store || null;
}

export async function initStore(): Promise<void> {
  if (initialized) return;
  if (!Capacitor.isNativePlatform()) { initialized = true; return; }
  
  const w = window as any;
  if (!w.CdvPurchase) {
    console.warn('CdvPurchase not available');
    initialized = true;
    return;
  }

  const { store, ProductType, Platform, LogLevel } = w.CdvPurchase;
  
  store.verbosity = LogLevel.DEBUG;

  store.register([
    { id: MONTHLY_ID, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.APPLE_APPSTORE },
    { id: YEARLY_ID, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.APPLE_APPSTORE },
  ]);

  store.when()
    .productUpdated(() => { console.log('Products updated'); })
    .approved((transaction: any) => { console.log('Approved:', transaction); transaction.verify(); })
    .verified((receipt: any) => { console.log('Verified:', receipt); receipt.finish(); })
    .finished((transaction: any) => { console.log('Finished:', transaction); });

  try {
    await store.initialize([Platform.APPLE_APPSTORE]);
    console.log('Store initialized, products:', store.products);
    initialized = true;
  } catch (err) {
    console.error('Store init error:', err);
    initialized = true;
  }
}

export async function purchaseMonthly(): Promise<boolean> {
  return purchase(MONTHLY_ID);
}

export async function purchaseYearly(): Promise<boolean> {
  return purchase(YEARLY_ID);
}

async function purchase(productId: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;
  
  const store = getStore();
  if (!store) { console.error('Store not available'); return false; }

  const product = store.get(productId);
  if (!product) { 
    console.error('Product not found:', productId, 'Available:', store.products?.map((p: any) => p.id)); 
    return false; 
  }

  const offer = product.getOffer();
  if (!offer) { 
    console.error('No offer for product:', productId); 
    return false; 
  }

  try {
    console.log('Ordering product:', productId);
    const result = await store.order(offer);
    if (result && result.isError) {
      console.error('Order error:', result);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Purchase error:', err);
    return false;
  }
}

export async function restorePurchases(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const store = getStore();
  if (!store) return;
  try {
    await store.restorePurchases();
  } catch (err) {
    console.error('Restore error:', err);
  }
}

export function getSubscriptionStatus() {
  if (!Capacitor.isNativePlatform()) return { active: true };
  const store = getStore();
  if (!store) return { active: true };
  const monthly = store.get(MONTHLY_ID);
  const yearly = store.get(YEARLY_ID);
  if (monthly?.owned || yearly?.owned) return { active: true };
  return { active: false };
}

export function isStoreReady(): boolean {
  return initialized;
}
