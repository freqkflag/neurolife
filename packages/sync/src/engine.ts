import { resolveConflict } from './conflict';
import type { SyncDelta, SyncMutation, SyncPushResult } from './types';

export interface SyncStore {
  getEntity(type: string, id: string): Promise<Record<string, unknown> | null>;
  saveEntity(type: string, id: string, data: Record<string, unknown>): Promise<void>;
  deleteEntity(type: string, id: string): Promise<void>;
  getChangesSince(timestamp: string): Promise<SyncDelta>;
}

export class SyncEngine {
  constructor(private store: SyncStore) {}

  async pull(since: string): Promise<SyncDelta> {
    return this.store.getChangesSince(since);
  }

  async push(mutations: SyncMutation[]): Promise<SyncPushResult> {
    const accepted: string[] = [];
    const conflicts: SyncPushResult['conflicts'] = [];

    for (const mutation of mutations) {
      const existing = await this.store.getEntity(mutation.entityType, mutation.entityId);

      if (mutation.operation === 'delete') {
        await this.store.deleteEntity(mutation.entityType, mutation.entityId);
        accepted.push(mutation.id);
        continue;
      }

      if (existing) {
        const conflict = resolveConflict(mutation, existing);
        if (conflict) {
          if (conflict.resolvedVersion) {
            await this.store.saveEntity(
              mutation.entityType,
              mutation.entityId,
              conflict.resolvedVersion,
            );
          }
          conflicts.push(conflict);
          accepted.push(mutation.id);
          continue;
        }
      }

      await this.store.saveEntity(mutation.entityType, mutation.entityId, {
        ...mutation.payload,
        updatedAt: mutation.clientTimestamp,
      });
      accepted.push(mutation.id);
    }

    return {
      accepted,
      conflicts,
      serverTimestamp: new Date().toISOString(),
    };
  }
}

export const SYNC_CRITICAL_ENTITIES = [
  'task',
  'routine',
  'capacity',
  'sensory',
  'brain_dump',
  'support_contact',
  'food_item',
] as const;
