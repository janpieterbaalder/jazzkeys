import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const analyses = pgTable("analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  titel: text("titel").notNull(),
  type: text("type").notNull(), // "pdf" | "akkoorden"
  invoer: text("invoer"), // akkoord-string of bestandsnaam
  resultaat: jsonb("resultaat").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
