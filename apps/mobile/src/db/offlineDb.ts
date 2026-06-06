import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('neurolife_offline.db');
    await initSchema(db);
  }
  return db;
}

async function initSchema(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS tiny_action (
      id INTEGER PRIMARY KEY,
      action TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS capacity_cache (
      id INTEGER PRIMARY KEY,
      score INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sensory_cache (
      id INTEGER PRIMARY KEY,
      load INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS brain_dump (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS support_contact (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      is_emergency INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      client_timestamp TEXT NOT NULL
    );
  `);
}

export async function saveTinyAction(action: string) {
  const database = await getDb();
  await database.runAsync(
    'INSERT OR REPLACE INTO tiny_action (id, action, updated_at) VALUES (1, ?, ?)',
    action,
    new Date().toISOString(),
  );
}

export async function getTinyAction(): Promise<string | null> {
  const database = await getDb();
  const row = await database.getFirstAsync<{ action: string }>(
    'SELECT action FROM tiny_action WHERE id = 1',
  );
  return row?.action ?? null;
}

export async function saveBrainDump(content: string) {
  const database = await getDb();
  await database.runAsync(
    'INSERT INTO brain_dump (content, created_at) VALUES (?, ?)',
    content,
    new Date().toISOString(),
  );
}

export async function getRecentBrainDumps(limit = 10): Promise<string[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<{ content: string }>(
    'SELECT content FROM brain_dump ORDER BY created_at DESC LIMIT ?',
    limit,
  );
  return rows.map((r) => r.content);
}

export async function queueSyncMutation(
  id: string,
  entityType: string,
  entityId: string,
  operation: string,
  payload: Record<string, unknown>,
) {
  const database = await getDb();
  await database.runAsync(
    'INSERT OR REPLACE INTO sync_queue (id, entity_type, entity_id, operation, payload, client_timestamp) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    entityType,
    entityId,
    operation,
    JSON.stringify(payload),
    new Date().toISOString(),
  );
}
