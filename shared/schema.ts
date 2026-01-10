import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull().default("Box"), // Lucide icon name
});

export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  fields: jsonb("fields").notNull().$type<FormField[]>(), // Array of field definitions
});

export const records = pgTable("records", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").references(() => forms.id).notNull(),
  data: jsonb("data").notNull(), // The actual record data
});

export const modulesRelations = relations(modules, ({ many }) => ({
  forms: many(forms),
}));

export const formsRelations = relations(forms, ({ one, many }) => ({
  module: one(modules, {
    fields: [forms.moduleId],
    references: [modules.id],
  }),
  records: many(records),
}));

export const recordsRelations = relations(records, ({ one }) => ({
  form: one(forms, {
    fields: [records.formId],
    references: [forms.id],
  }),
}));

export interface FormField {
  key: string;
  label: string;
  type: "text" | "number" | "checkbox" | "select" | "date" | "textarea";
  required: boolean;
  options?: string[]; // For select
}

export const insertModuleSchema = createInsertSchema(modules).omit({ id: true });
export const insertFormSchema = createInsertSchema(forms).omit({ id: true });
export const insertRecordSchema = createInsertSchema(records).omit({ id: true });

export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Form = typeof forms.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;
export type RecordItem = typeof records.$inferSelect;
export type InsertRecord = z.infer<typeof insertRecordSchema>;

import { integer } from "drizzle-orm/pg-core";
