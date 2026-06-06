import type { PrivacyMode } from '@neurolife/shared';
import { CloudProvider } from '../providers/CloudProvider';
import { RuleBasedProvider } from '../providers/RuleBasedProvider';
import { SelfHostedProvider } from '../providers/SelfHostedProvider';
import type { AIProvider, ProviderConfig } from '../providers/types';

export function selectProvider(
  privacyMode: PrivacyMode,
  config: ProviderConfig,
  requiresCloud = false,
  consentGiven = false,
): AIProvider {
  switch (privacyMode) {
    case 'FULLY_LOCAL':
      return new RuleBasedProvider();
    case 'SELF_HOSTED':
      return config.selfHostedUrl
        ? new SelfHostedProvider(config)
        : new RuleBasedProvider();
    case 'HYBRID':
      if (requiresCloud && consentGiven && config.openaiApiKey) {
        return new CloudProvider(config);
      }
      return config.selfHostedUrl
        ? new SelfHostedProvider(config)
        : new RuleBasedProvider();
    case 'CLOUD_ASSISTED':
      if (consentGiven && config.openaiApiKey) {
        return new CloudProvider(config);
      }
      return new RuleBasedProvider();
    default:
      return new RuleBasedProvider();
  }
}
