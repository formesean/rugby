import { bigint, integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

export const rateLimit = pgTable(
  "rateLimit",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull(),
    count: integer("count").notNull(),
    lastRequest: bigint("last_request", { mode: "number" }).notNull(),
  },
  (table) => [uniqueIndex("rate_limit_key_idx").on(table.key)],
);
