import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertModule, type InsertForm, type FormField } from "@shared/schema";
import { z } from "zod";

// === MODULES ===

export function useModules() {
  return useQuery({
    queryKey: [api.modules.list.path],
    queryFn: async () => {
      const res = await fetch(api.modules.list.path);
      if (!res.ok) throw new Error("Failed to fetch modules");
      return api.modules.list.responses[200].parse(await res.json());
    },
  });
}

export function useModule(id: number) {
  return useQuery({
    queryKey: [api.modules.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.modules.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch module");
      return api.modules.get.responses[200].parse(await res.json());
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertModule) => {
      const res = await fetch(api.modules.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create module");
      return api.modules.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.modules.list.path] });
    },
  });
}

export function useDeleteModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.modules.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete module");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.modules.list.path] });
    },
  });
}

// === FORMS ===

export function useForms(moduleId: number) {
  return useQuery({
    queryKey: [api.forms.list.path, moduleId],
    queryFn: async () => {
      const url = buildUrl(api.forms.list.path, { moduleId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch forms");
      return api.forms.list.responses[200].parse(await res.json());
    },
    enabled: !!moduleId && !isNaN(moduleId),
  });
}

export function useForm(id: number) {
  return useQuery({
    queryKey: [api.forms.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.forms.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch form");
      return api.forms.get.responses[200].parse(await res.json());
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ moduleId, ...data }: InsertForm) => {
      const url = buildUrl(api.forms.create.path, { moduleId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create form");
      return api.forms.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.forms.list.path, variables.moduleId] });
    },
  });
}

export function useUpdateForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsertForm> & { id: number }) => {
      const url = buildUrl(api.forms.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update form");
      return api.forms.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.forms.list.path, data.moduleId] });
      queryClient.invalidateQueries({ queryKey: [api.forms.get.path, data.id] });
    },
  });
}

// === RECORDS ===

export function useRecords(formId: number) {
  return useQuery({
    queryKey: [api.records.list.path, formId],
    queryFn: async () => {
      const url = buildUrl(api.records.list.path, { formId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch records");
      return api.records.list.responses[200].parse(await res.json());
    },
    enabled: !!formId && !isNaN(formId),
  });
}

export function useCreateRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ formId, data }: { formId: number; data: any }) => {
      const url = buildUrl(api.records.create.path, { formId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) throw new Error("Failed to create record");
      return api.records.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.records.list.path, variables.formId] });
    },
  });
}

export function useDeleteRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formId }: { id: number; formId: number }) => {
      const url = buildUrl(api.records.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete record");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.records.list.path, variables.formId] });
    },
  });
}
