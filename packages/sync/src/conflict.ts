import type { SyncConflict, SyncMutation } from './types';

const NOTE_ENTITY_TYPES = ['brain_dump', 'document'];

export function resolveConflict(
  mutation: SyncMutation,
  serverData: Record<string, unknown>,
): SyncConflict | null {
  const clientUpdated = new Date(mutation.clientTimestamp).getTime();
  const serverUpdated = new Date((serverData.updatedAt as string) ?? 0).getTime();

  if (clientUpdated >= serverUpdated) {
    return null;
  }

  if (NOTE_ENTITY_TYPES.includes(mutation.entityType)) {
    return {
      entityType: mutation.entityType,
      entityId: mutation.entityId,
      clientVersion: mutation.payload,
      serverVersion: serverData,
      resolvedVersion: {
        ...serverData,
        clientNote: mutation.payload,
        hasConflict: true,
        mergedAt: new Date().toISOString(),
      },
    };
  }

  return null;
}

export function mergeSimpleField(
  clientValue: unknown,
  serverValue: unknown,
  clientTimestamp: string,
  serverTimestamp: string,
): unknown {
  const clientTime = new Date(clientTimestamp).getTime();
  const serverTime = new Date(serverTimestamp).getTime();
  return clientTime >= serverTime ? clientValue : serverValue;
}
