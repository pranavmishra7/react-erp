import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertModuleSchema, insertFormSchema, insertDocumentTemplateSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Modules
  app.get(api.modules.list.path, async (req, res) => {
    const modules = await storage.getModules();
    res.json(modules);
  });

  app.get(api.modules.get.path, async (req, res) => {
    const module = await storage.getModule(Number(req.params.id));
    if (!module) return res.status(404).json({ message: "Module not found" });
    res.json(module);
  });

  app.post(api.modules.create.path, async (req, res) => {
    try {
      const data = insertModuleSchema.parse(req.body);
      const module = await storage.createModule(data);
      res.status(201).json(module);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      throw e;
    }
  });

  app.put(api.modules.update.path, async (req, res) => {
    try {
      const data = insertModuleSchema.partial().parse(req.body);
      const module = await storage.updateModule(Number(req.params.id), data);
      if (!module) return res.status(404).json({ message: "Module not found" });
      res.json(module);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      throw e;
    }
  });

  app.delete(api.modules.delete.path, async (req, res) => {
    await storage.deleteModule(Number(req.params.id));
    res.status(204).end();
  });

  // Forms
  app.get(api.forms.list.path, async (req, res) => {
    const forms = await storage.getFormsByModule(Number(req.params.moduleId));
    res.json(forms);
  });

  app.get(api.forms.get.path, async (req, res) => {
    const form = await storage.getForm(Number(req.params.id));
    if (!form) return res.status(404).json({ message: "Form not found" });
    res.json(form);
  });

  app.post(api.forms.create.path, async (req, res) => {
    try {
      const data = insertFormSchema.omit({ moduleId: true }).parse(req.body);
      const fullData = { ...data, moduleId: Number(req.params.moduleId) };
      const form = await storage.createForm(fullData as any);
      res.status(201).json(form);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      throw e;
    }
  });

  app.put(api.forms.update.path, async (req, res) => {
     try {
      const data = insertFormSchema.partial().parse(req.body);
      const form = await storage.updateForm(Number(req.params.id), data);
      if (!form) return res.status(404).json({ message: "Form not found" });
      res.json(form);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      throw e;
    }
  });

   app.delete(api.forms.delete.path, async (req, res) => {
    await storage.deleteForm(Number(req.params.id));
    res.status(204).end();
  });

  // Records
  app.get(api.records.list.path, async (req, res) => {
    const records = await storage.getRecordsByForm(Number(req.params.formId));
    res.json(records);
  });

  app.post(api.records.create.path, async (req, res) => {
    try {
      const formId = Number(req.params.formId);
      const { data } = req.body;
      const record = await storage.createRecord({ formId, data });
      res.status(201).json(record);
    } catch (e) {
       res.status(400).json({ message: "Invalid data" });
    }
  });

  app.delete(api.records.delete.path, async (req, res) => {
    await storage.deleteRecord(Number(req.params.id));
    res.status(204).end();
  });

  // Templates
  app.get(api.templates.list.path, async (req, res) => {
    const templates = await storage.getTemplatesByModule(Number(req.params.moduleId));
    res.json(templates);
  });

  app.post(api.templates.create.path, async (req, res) => {
    try {
      const data = insertDocumentTemplateSchema.omit({ moduleId: true }).parse(req.body);
      const fullData = { ...data, moduleId: Number(req.params.moduleId) };
      const template = await storage.createTemplate(fullData as any);
      res.status(201).json(template);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      throw e;
    }
  });

  app.put(api.templates.update.path, async (req, res) => {
    try {
      const data = insertDocumentTemplateSchema.partial().parse(req.body);
      const template = await storage.updateTemplate(Number(req.params.id), data);
      if (!template) return res.status(404).json({ message: "Template not found" });
      res.json(template);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      throw e;
    }
  });

  app.delete(api.templates.delete.path, async (req, res) => {
    await storage.deleteTemplate(Number(req.params.id));
    res.status(204).end();
  });

  // Seed Data
  await seedData();

  return httpServer;
}

async function seedData() {
  const mods = await storage.getModules();
  if (mods.length === 0) {
    const hrModule = await storage.createModule({
      name: "Human Resources",
      description: "Manage employees and departments",
      icon: "Users"
    });

    const salesModule = await storage.createModule({
      name: "Sales",
      description: "Leads and opportunities",
      icon: "TrendingUp"
    });

    // Create Employee Form
    const empForm = await storage.createForm({
      moduleId: hrModule.id,
      name: "Employees",
      description: "Employee directory",
      fields: [
        { key: "firstName", label: "First Name", type: "text", required: true },
        { key: "lastName", label: "Last Name", type: "text", required: true },
        { key: "email", label: "Email", type: "text", required: true },
        { key: "department", label: "Department", type: "select", required: true, options: ["Engineering", "Sales", "HR"] },
        { key: "startDate", label: "Start Date", type: "date", required: true }
      ]
    });

    // Create Lead Form
    const leadForm = await storage.createForm({
      moduleId: salesModule.id,
      name: "Leads",
      description: "Sales leads",
      fields: [
        { key: "companyName", label: "Company Name", type: "text", required: true },
        { key: "contactPerson", label: "Contact Person", type: "text", required: false },
        { key: "status", label: "Status", type: "select", required: true, options: ["New", "Contacted", "Qualified", "Lost"] },
        { key: "potentialValue", label: "Potential Value ($)", type: "number", required: false }
      ]
    });

    // Create a Sample Template for HR
    await storage.createTemplate({
      moduleId: hrModule.id,
      formId: empForm.id,
      name: "Employee Contract",
      content: `
        <div style="font-family: Arial, sans-serif; padding: 40px;">
          <h1 style="text-align: center; color: #333;">Employment Agreement</h1>
          <p>This agreement is made between the Company and <strong>{{firstName}} {{lastName}}</strong>.</p>
          <p>The employee will begin their role in the <strong>{{department}}</strong> department on <strong>{{startDate}}</strong>.</p>
          <div style="margin-top: 50px;">
            <p>Signed: __________________________</p>
            <p>Date: {{startDate}}</p>
          </div>
        </div>
      `,
      styles: "h1 { border-bottom: 2px solid #333; }"
    });
  }
}
