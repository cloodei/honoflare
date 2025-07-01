import { type Hyperdrive } from "@cloudflare/workers-types";
import { type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export type Ctx = {
  Variables: {
    db: PostgresJsDatabase<Record<string, never>> & {
      $client: postgres.Sql<{}>;
    };
  };
  Bindings: {
    HYPERDRIVE: Hyperdrive;
  };
}
