/**
 * Kysely dialect so Better Auth can store users on the Cloudflare D1 binding `DB`.
 * The binding is loaded at the first query, not at import, so the Node preview
 * never has to resolve `cloudflare:workers`.
 */
import {
  CompiledQuery,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
  type DatabaseConnection,
  type Dialect,
  type Driver,
  type Kysely,
  type QueryResult,
  type TransactionSettings,
} from "kysely";

type Statement = {
  bind(...values: unknown[]): {
    all<T>(): Promise<{ results?: T[] }>;
    run(): Promise<{ meta?: { changes?: number } }>;
  };
};

type D1Database = {
  prepare(query: string): Statement;
};

async function database(): Promise<D1Database> {
  const load = new Function("specifier", "return import(specifier)") as (
    specifier: string,
  ) => Promise<{ env: { DB?: D1Database } }>;
  const { env } = await load("cloudflare:workers");
  if (!env.DB) {
    throw new Error(
      "The desk database is not attached. In Cloudflare, create a D1 database named maitland and set its id in wrangler.jsonc.",
    );
  }
  return env.DB;
}

class D1Connection implements DatabaseConnection {
  constructor(private readonly db: D1Database) {}

  async executeQuery<R>(compiled: CompiledQuery): Promise<QueryResult<R>> {
    const statement = this.db.prepare(compiled.sql).bind(...compiled.parameters);
    const verb = compiled.sql.trim().slice(0, 6).toLowerCase();
    if (verb === "select" || compiled.sql.toLowerCase().includes(" returning ")) {
      const result = await statement.all<R>();
      return { rows: result.results ?? [] };
    }
    const result = await statement.run();
    const changes = result.meta?.changes;
    return {
      rows: [],
      numAffectedRows: changes === undefined ? undefined : BigInt(changes),
    };
  }

  async *streamQuery<R>(compiled: CompiledQuery): AsyncIterableIterator<QueryResult<R>> {
    yield this.executeQuery<R>(compiled);
  }
}

class LazyD1Driver implements Driver {
  async init(): Promise<void> {}

  async acquireConnection(): Promise<DatabaseConnection> {
    return new D1Connection(await database());
  }

  async beginTransaction(
    connection: DatabaseConnection,
    _settings: TransactionSettings,
  ): Promise<void> {
    await (connection as D1Connection).executeQuery(CompiledQuery.raw("begin"));
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    await (connection as D1Connection).executeQuery(CompiledQuery.raw("commit"));
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    await (connection as D1Connection).executeQuery(CompiledQuery.raw("rollback"));
  }

  async releaseConnection(): Promise<void> {}

  async destroy(): Promise<void> {}
}

export function d1Dialect(): Dialect {
  return {
    createAdapter: () => new SqliteAdapter(),
    createDriver: () => new LazyD1Driver(),
    createQueryCompiler: () => new SqliteQueryCompiler(),
    createIntrospector: (db: Kysely<unknown>) => new SqliteIntrospector(db),
  };
}
