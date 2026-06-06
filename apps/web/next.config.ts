import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@neurolife/design-system', '@neurolife/shared', '@neurolife/ai-core'],
};

export default nextConfig;
