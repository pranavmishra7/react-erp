import { z } from 'zod';
import { 
  insertModuleSchema, 
  insertFormSchema, 
  insertRecordSchema, 
  insertDocumentTemplateSchema,
  modules, 
  forms, 
  records,
  documentTemplates
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  modules: {
    list: {
      method: 'GET' as const,
      path: '/api/modules',
      responses: {
        200: z.array(z.custom<typeof modules.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/modules/:id',
      responses: {
        200: z.custom<typeof modules.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/modules',
      input: insertModuleSchema,
      responses: {
        201: z.custom<typeof modules.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/modules/:id',
      input: insertModuleSchema.partial(),
      responses: {
        200: z.custom<typeof modules.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/modules/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  forms: {
    list: {
      method: 'GET' as const,
      path: '/api/modules/:moduleId/forms',
      responses: {
        200: z.array(z.custom<typeof forms.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/forms/:id',
      responses: {
        200: z.custom<typeof forms.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/modules/:moduleId/forms',
      input: insertFormSchema.omit({ moduleId: true }),
      responses: {
        201: z.custom<typeof forms.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/forms/:id',
      input: insertFormSchema.partial(),
      responses: {
        200: z.custom<typeof forms.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/forms/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  records: {
    list: {
      method: 'GET' as const,
      path: '/api/forms/:formId/records',
      responses: {
        200: z.array(z.custom<typeof records.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/forms/:formId/records',
      input: z.object({ data: z.any() }),
      responses: {
        201: z.custom<typeof records.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/records/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  templates: {
    list: {
      method: 'GET' as const,
      path: '/api/modules/:moduleId/templates',
      responses: {
        200: z.array(z.custom<typeof documentTemplates.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/modules/:moduleId/templates',
      input: insertDocumentTemplateSchema.omit({ moduleId: true }),
      responses: {
        201: z.custom<typeof documentTemplates.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/templates/:id',
      input: insertDocumentTemplateSchema.partial(),
      responses: {
        200: z.custom<typeof documentTemplates.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/templates/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
