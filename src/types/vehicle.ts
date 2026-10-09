import { z } from "zod";

export const vehicleStatusSchema = z.enum(["available", "reserved", "sold"]);

export const vehicleSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  brand: z.string().trim().min(1, "Indique a marca"),
  model: z.string().trim().min(1, "Indique o modelo"),
  version: z.string().trim().min(1, "Indique a versão"),
  price: z.coerce.number().int().nonnegative(),
  year: z.coerce.number().int().min(1900).max(2100),
  month: z.coerce.number().int().min(1).max(12).default(1),
  kms: z.coerce.number().int().nonnegative(),
  fuel: z.string().trim().min(1, "Indique o combustível"),
  horsepower: z.coerce.number().int().nonnegative(),
  displacement: z.coerce.number().int().nonnegative(),
  transmission: z.string().trim().min(1, "Indique a transmissão"),
  equipment: z.array(z.string().trim().min(1)).default([]),
  photos: z
    .array(z.string().refine((value) => value.startsWith("/") || URL.canParse(value), "Fotografia inválida"))
    .min(1, "Adicione pelo menos uma fotografia"),
  active: z.coerce.boolean().default(true),
  status: vehicleStatusSchema.default("available"),
  featured: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Vehicle = z.infer<typeof vehicleSchema>;
export type VehicleStatus = z.infer<typeof vehicleStatusSchema>;

export const vehicleInputSchema = vehicleSchema.omit({
  slug: true,
  createdAt: true,
  updatedAt: true,
});

export type VehicleInput = z.infer<typeof vehicleInputSchema>;
