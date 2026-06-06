import { SENSORY_HIGH_THRESHOLD } from '@neurolife/shared';
import type { OrchestratorContext, SpecialistType } from '../types';

export function adjustForPlatform(
  specialist: SpecialistType,
  context: OrchestratorContext,
): SpecialistType {
  if (context.crisisState) {
    return 'crisis_stabilization';
  }

  if (context.platform === 'mobile') {
    if (context.sensory.load >= SENSORY_HIGH_THRESHOLD) {
      return 'crisis_stabilization';
    }
    if (context.capacity.score < 30) {
      if (specialist === 'budget' || specialist === 'admin_paperwork') {
        return 'task_routine';
      }
    }
  }

  return specialist;
}
