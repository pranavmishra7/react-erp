import { pgTable, text, serial, jsonb, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull().default("Box"),
});

export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  fields: jsonb("fields").notNull().$type<FormField[]>(),
});

export const documentTemplates = pgTable("document_templates", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  formId: integer("form_id").references(() => forms.id), // Optional: template can be generic or form-specific
  name: text("name").notNull(),
  content: text("content").notNull(), // HTML/Handlebars content
  styles: text("styles"), // CSS styles
  createdAt: timestamp("created_at").defaultNow(),
});

export const records = pgTable("records", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").references(() => forms.id).notNull(),
  data: jsonb("data").notNull(),
});

export const modulesRelations = relations(modules, ({ many }) => ({
  forms: many(forms),
  documentTemplates: many(documentTemplates),
}));

export const formsRelations = relations(forms, ({ one, many }) => ({
  module: one(modules, {
    fields: [forms.moduleId],
    references: [modules.id],
  }),
  records: many(records),
  documentTemplates: many(documentTemplates),
}));

export const documentTemplatesRelations = relations(documentTemplates, ({ one }) => ({
  module: one(modules, {
    fields: [documentTemplates.moduleId],
    references: [modules.id],
  }),
  form: one(forms, {
    fields: [documentTemplates.formId],
    references: [forms.id],
  }),
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
  options?: string[];
}

export const insertModuleSchema = createInsertSchema(modules).omit({ id: true });
export const insertFormSchema = createInsertSchema(forms).omit({ id: true });
export const insertRecordSchema = createInsertSchema(records).omit({ id: true });
export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates).omit({ id: true, createdAt: true });

export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Form = typeof forms.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;
export type RecordItem = typeof records.$inferSelect;
export type InsertRecord = z.infer<typeof insertRecordSchema>;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;
