import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Contenido editable del portafolio. Se guarda como un único documento JSON
// (fila con id "main") para que el panel pueda modificar cualquier texto.
export const siteContent = pgTable("site_content", {
  id: text().primaryKey(),
  data: jsonb().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
