import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertModuleSchema, insertFormSchema } from "@shared/schema";

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
      // The schema expects moduleId but the API contract omits it from input
      // so we need to add it from params
      const data = insertFormSchema.omit({ moduleId: true }).parse(req.body);
      const fullData = { ...data, moduleId: Number(req.params.moduleId) };
      // validate against full schema just in case, though we constructed it
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

  // Seed Data
  await seedData();

  return httpServer;
}

async function seedData() {
  const modules = await storage.getModules();
  if (modules.length === 0) {
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
    await storage.createForm({
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
    await storage.createForm({
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
  }
}
