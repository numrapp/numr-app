import { Capacitor } from '@capacitor/core';
import api from './api';

/**
 * Subscription IAP wrapper around @capgo/native-purchases.
 * API used:
 *   - NativePurchases.getProducts({ productIdentifiers, productType })
 *   - NativePurchases.purchaseProduct({ productIdentifier, productType, planIdentifier })
 *   - NativePurchases.restorePurchases()
 *
 * Receipt / transactionId returned by purchaseProduct is forwarded to the
 * backend (/auth/iap-receipt) which activates the subscription and, if
 * APPLE_IAP_SHARED_SECRET is configured, validates with Apple server-side.
 */

export const MONTHLY_ID = 'com.numr.invoices.monthly';
export const YEARLY_ID = 'com.numr.invoices.yearly';
const PRODUCT_IDS = [MONTHLY_ID, YEARLY_ID];

type Product = {
  productIdentifier?: string;
  identifier?: string;
  price?: number | string;
  priceString?: string;
  currencyCode?: string;
  title?: string;
  description?: string;
};

type Transaction = {
  transactionId?: string;
  receipt?: string;
  jwsRepresentation?: string;
  productIdentifier?: string;
  originalTransactionId?: string;
};

let initialized = false;
let products: Product[] = [];
let pluginRef: any = null;

async function loadPlugin(): Promise<any> {
  if (pluginRef) return pluginRef;
  try {
    const mod: any = await import('@capgo/native-purchases');
    pluginRef = mod.NativePurchases || mod.default || mod;
    return pluginRef;
  } catch (err) {
    console.warn('[store] plugin unavailable', err);
    return null;
  }
}

export async function initStore(): Promise<void> {
  if (initialized) return;
  initialized = true;
  if (!Capacitor.isNativePlatform()) return;

  const plugin = await loadPlugin();
  if (!plugin?.getProducts) return;

  try {
    const res = await plugin.getProducts({
      productIdentifiers: PRODUCT_IDS,
      productType: 'subs',
    });
    products = (res?.products || []) as Product[];
  } catch (err) {
    console.error('[store] init error', err);
  }
}

export function getProducts(): Product[] {
  return products;
}

export function getProduct(id: string): Product | undefined {
  return products.find(p => (p.productIdentifier || p.identifier) === id);
}

async function validateReceipt(
  productId: string,
  tx: Transaction,
) {
  try {
    await api.post('/auth/iap-receipt', {
      product_id: productId,
      receipt: tx.receipt,
      jws: tx.jwsRepresentation,
      transaction_id: tx.transactionId || tx.originalTransactionId,
      platform: Capacitor.getPlatform(),
    });
  } catch (err) {
    console.warn('[store] server receipt validation failed', err);
  }
}

async function purchase(productId: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;
  await initStore();
  const plugin = await loadPlugin();
  if (!plugin?.purchaseProduct) return false;

  try {
    const tx: Transaction = await plugin.purchaseProduct({
      productIdentifier: productId,
      productType: 'subs',
      planIdentifier: productId, // Android needs a base-plan id; iOS ignores it.
    });
    await validateReceipt(productId, tx);
    return true;
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (/cancel/i.test(msg)) return false;
    console.error('[store] purchase failed', err);
    return false;
  }
}

export async function purchaseMonthly(): Promise<boolean> {
  return purchase(MONTHLY_ID);
}

export async function purchaseYearly(): Promise<boolean> {
  return purchase(YEARLY_ID);
}

export async function restorePurchases(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await initStore();
  const plugin = await loadPlugin();
  if (!plugin?.restorePurchases) return;
  try {
    await plugin.restorePurchases();
  } catch (err) {
    console.error('[store] restore failed', err);
  }
}

export function isStoreReady(): boolean {
  return initialized;
}
