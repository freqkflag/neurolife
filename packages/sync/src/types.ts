export type SyncEntityType =
  | 'task'
  | 'routine'
  | 'capacity'
  | 'sensory'
  | 'brain_dump'
  | 'support_contact'
  | 'food_item'
  | 'document'
  | 'bill';

export interface SyncMutation {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
  clientTimestamp: string;
  clientId: string;
}

export interface SyncConflict {
  entityType: SyncEntityType;
  entityId: string;
  clientVersion: Record<string, unknown>;
  serverVersion: Record<string, unknown>;
  resolvedVersion?: Record<string, unknown>;
}

export interface SyncDelta {
  entities: Array<{
    type: SyncEntityType;
    id: string;
    data: Record<string, unknown>;
    updatedAt: string;
  }>;
  deletedIds: Array<{ type: SyncEntityType; id: string }>;
  serverTimestamp: string;
}

export interface SyncPushResult {
  accepted: string[];
  conflicts: SyncConflict[];
  serverTimestamp: string;
}
