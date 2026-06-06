import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'NeuroLife Pocket',
  slug: 'neurolife-pocket',
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'neurolife',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.neurolife.pocket',
  },
  android: {
    package: 'com.neurolife.pocket',
    adaptiveIcon: {
      backgroundColor: '#1E2022',
    },
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    [
      'expo-build-properties',
      {
        ios: { deploymentTarget: '15.1' },
        android: { minSdkVersion: 24 },
      },
    ],
    [
      'llama.rn',
      {
        enableEntitlements: true,
        forceCxx20: true,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
