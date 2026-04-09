import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.numr.invoices',
  appName: 'numr',
  webDir: 'dist',
  server: {
    url: undefined,
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'numr',
    preferredContentMode: 'mobile',
  },
};

export default config;
