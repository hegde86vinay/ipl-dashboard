import { createClient, type Client, type InValue } from "@libsql/client";

let client: Client | null = null;

export function getClient(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (url) {
      // Production: connect to Turso cloud
      client = createClient({ url, authToken });
    } else {
      // Local dev: connect to local SQLite file
      client = createClient({ url: "file:data/ipl.db" });
    }
  }
  return client;
}

// Helper to run a query and return all rows
export async function queryAll<T>(sql: string, args: InValue[] = []): Promise<T[]> {
  const db = getClient();
  const result = await db.execute({ sql, args });
  return result.rows as unknown as T[];
}

// Helper to run a query and return the first row
export async function queryOne<T>(sql: string, args: InValue[] = []): Promise<T | undefined> {
  const db = getClient();
  const result = await db.execute({ sql, args });
  return result.rows[0] as unknown as T | undefined;
}
