import type { CapacityState, PlatformContext, PrivacyMode, SensoryState } from '@neurolife/shared';
import type { TinyActionOutput } from './schemas/output';

export type SpecialistType =
  | 'budget'
  | 'admin_paperwork'
  | 'disability_benefits'
  | 'food_body'
  | 'housing'
  | 'task_routine'
  | 'rsd_communication'
  | 'crisis_stabilization';

export interface OrchestratorContext {
  capacity: CapacityState;
  sensory: SensoryState;
  moneyStressLevel?: number;
  platform: PlatformContext;
  privacyMode: PrivacyMode;
  recentEvents?: string[];
  imminentDeadlines?: string[];
  foodBodyState?: string;
  userPriority?: string;
  crisisState?: boolean;
}

export interface AgentRequest {
  input: string;
  context: OrchestratorContext;
}

export interface Agent {
  type: SpecialistType;
  process(request: AgentRequest): Promise<TinyActionOutput>;
}
