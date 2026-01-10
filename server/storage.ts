import { 
  modules, forms, records, documentTemplates,
  type Module, type InsertModule, 
  type Form, type InsertForm, 
  type RecordItem, type InsertRecord,
  type DocumentTemplate, type InsertDocumentTemplate
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Modules
  getModules(): Promise<Module[]>;
  getModule(id: number): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;
  updateModule(id: number, module: Partial<InsertModule>): Promise<Module | undefined>;
  deleteModule(id: number): Promise<void>;

  // Forms
  getFormsByModule(moduleId: number): Promise<Form[]>;
  getForm(id: number): Promise<Form | undefined>;
  createForm(form: InsertForm): Promise<Form>;
  updateForm(id: number, form: Partial<InsertForm>): Promise<Form | undefined>;
  deleteForm(id: number): Promise<void>;

  // Records
  getRecordsByForm(formId: number): Promise<RecordItem[]>;
  createRecord(record: InsertRecord): Promise<RecordItem>;
  deleteRecord(id: number): Promise<void>;

  // Document Templates
  getTemplatesByModule(moduleId: number): Promise<DocumentTemplate[]>;
  getTemplate(id: number): Promise<DocumentTemplate | undefined>;
  createTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate>;
  updateTemplate(id: number, template: Partial<InsertDocumentTemplate>): Promise<DocumentTemplate | undefined>;
  deleteTemplate(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Module operations
  async getModules(): Promise<Module[]> {
    return await db.select().from(modules);
  }

  async getModule(id: number): Promise<Module | undefined> {
    const [module] = await db.select().from(modules).where(eq(modules.id, id));
    return module;
  }

  async createModule(insertModule: InsertModule): Promise<Module> {
    const [module] = await db.insert(modules).values(insertModule).returning();
    return module;
  }

  async updateModule(id: number, update: Partial<InsertModule>): Promise<Module | undefined> {
    const [module] = await db.update(modules).set(update).where(eq(modules.id, id)).returning();
    return module;
  }

  async deleteModule(id: number): Promise<void> {
    await db.delete(modules).where(eq(modules.id, id));
  }

  // Form operations
  async getFormsByModule(moduleId: number): Promise<Form[]> {
    return await db.select().from(forms).where(eq(forms.moduleId, moduleId));
  }

  async getForm(id: number): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, id));
    return form;
  }

  async createForm(insertForm: InsertForm): Promise<Form> {
    const [form] = await db.insert(forms).values(insertForm).returning();
    return form;
  }

  async updateForm(id: number, update: Partial<InsertForm>): Promise<Form | undefined> {
    const [form] = await db.update(forms).set(update).where(eq(forms.id, id)).returning();
    return form;
  }

  async deleteForm(id: number): Promise<void> {
    await db.delete(forms).where(eq(forms.id, id));
  }

  // Record operations
  async getRecordsByForm(formId: number): Promise<RecordItem[]> {
    return await db.select().from(records).where(eq(records.formId, formId));
  }

  async createRecord(insertRecord: InsertRecord): Promise<RecordItem> {
    const [record] = await db.insert(records).values(insertRecord).returning();
    return record;
  }

  async deleteRecord(id: number): Promise<void> {
    await db.delete(records).where(eq(records.id, id));
  }

  // Template operations
  async getTemplatesByModule(moduleId: number): Promise<DocumentTemplate[]> {
    return await db.select().from(documentTemplates).where(eq(documentTemplates.moduleId, moduleId));
  }

  async getTemplate(id: number): Promise<DocumentTemplate | undefined> {
    const [template] = await db.select().from(documentTemplates).where(eq(documentTemplates.id, id));
    return template;
  }

  async createTemplate(insertTemplate: InsertDocumentTemplate): Promise<DocumentTemplate> {
    const [template] = await db.insert(documentTemplates).values(insertTemplate).returning();
    return template;
  }

  async updateTemplate(id: number, update: Partial<InsertDocumentTemplate>): Promise<DocumentTemplate | undefined> {
    const [template] = await db.update(documentTemplates).set(update).where(eq(documentTemplates.id, id)).returning();
    return template;
  }

  async deleteTemplate(id: number): Promise<void> {
    await db.delete(documentTemplates).where(eq(documentTemplates.id, id));
  }
}

export const storage = new DatabaseStorage();
