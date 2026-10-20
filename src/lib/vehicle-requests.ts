import { z } from "zod";

const currentYear = new Date().getFullYear();
const requiredText = (label: string, max = 100) =>
  z.preprocess(
    (value) => typeof value === "string" ? value : "",
    z.string().trim().min(1, `${label} é obrigatório.`).max(max, `${label} é demasiado longo.`),
  );
const requiredEmail = z.preprocess(
  (value) => typeof value === "string" ? value : "",
  z.string().trim().min(1, "O email é obrigatório.").email("Introduza um email válido.").max(254),
);
const requiredPhone = z.preprocess(
  (value) => typeof value === "string" ? value : "",
  z
    .string()
    .trim()
    .min(9, "Introduza um contacto telefónico válido.")
    .max(30, "Introduza um contacto telefónico válido.")
    .regex(/^[+\d][\d\s().-]+$/, "Introduza um contacto telefónico válido."),
);
const positiveInteger = (label: string) =>
  z.coerce.number().int(`${label} deve ser um número inteiro.`).nonnegative(`${label} não pode ser negativo.`);
const optionalPositiveInteger = z.preprocess(
  (value) => value === "" || value === null || value === undefined ? undefined : value,
  z.coerce.number().int().nonnegative().optional(),
);

const commonFields = {
  name: requiredText("O nome"),
  email: requiredEmail,
  phone: requiredPhone,
  brand: requiredText("A marca", 80),
  model: requiredText("O modelo", 100),
  year: z.coerce
    .number()
    .int("O ano deve ser um número inteiro.")
    .min(1900, "Introduza um ano válido.")
    .max(currentYear + 1, "Introduza um ano válido."),
  color: requiredText("A cor", 80),
  description: z.string().trim().max(2000, "A descrição não pode exceder 2000 caracteres.").optional(),
};

export const sellVehicleRequestSchema = z.object({
  type: z.literal("sell"),
  ...commonFields,
  kms: positiveInteger("A quilometragem"),
  desiredPrice: optionalPositiveInteger,
});

export const orderVehicleRequestSchema = z.object({
  type: z.literal("order"),
  ...commonFields,
  maxKms: positiveInteger("A quilometragem máxima"),
  maxBudget: positiveInteger("O orçamento máximo").positive("O orçamento máximo deve ser superior a zero."),
});

export const vehicleRequestSchema = z.discriminatedUnion("type", [
  sellVehicleRequestSchema,
  orderVehicleRequestSchema,
]);

export type VehicleRequest = z.infer<typeof vehicleRequestSchema>;

function escapeHtml(value: string | number | undefined) {
  return String(value ?? "Não indicado")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNumber(value: number | undefined) {
  return value === undefined ? "Não indicado" : new Intl.NumberFormat("pt-PT").format(value);
}

function requestRows(request: VehicleRequest) {
  const rows = [
    ["Nome", request.name],
    ["Email", request.email],
    ["Telemóvel", request.phone],
    ["Marca", request.brand],
    ["Modelo", request.model],
    ["Ano", request.year],
    ["Cor", request.color],
  ];

  if (request.type === "sell") {
    rows.push(["Quilometragem", `${formatNumber(request.kms)} km`]);
    rows.push(["Valor pretendido", request.desiredPrice === undefined ? "Não indicado" : `${formatNumber(request.desiredPrice)} €`]);
  } else {
    rows.push(["Quilometragem máxima", `${formatNumber(request.maxKms)} km`]);
    rows.push(["Orçamento máximo", `${formatNumber(request.maxBudget)} €`]);
  }

  rows.push(["Descrição", request.description || "Não indicada"]);
  return rows;
}

export function buildVehicleRequestEmail(request: VehicleRequest) {
  const requestName = request.type === "sell" ? "Compramos o seu carro" : "Viatura sob encomenda";
  const rows = requestRows(request);
  const subject = `${requestName}: ${request.brand} ${request.model} — ${request.name}`;
  const text = [
    requestName,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `Submetido em: ${new Intl.DateTimeFormat("pt-PT", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Lisbon" }).format(new Date())}`,
  ].join("\n");
  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><th style="padding:10px 12px;border:1px solid #dedede;background:#f7f7f7;text-align:left">${escapeHtml(label)}</th><td style="padding:10px 12px;border:1px solid #dedede">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  return {
    subject,
    text,
    html: `<!doctype html><html lang="pt"><body style="font-family:Arial,sans-serif;color:#222"><div style="max-width:680px;margin:0 auto"><h1 style="font-size:24px">${escapeHtml(requestName)}</h1><p>Foi recebido um novo pedido através de samucar.pt.</p><table style="width:100%;border-collapse:collapse">${htmlRows}</table><p style="margin-top:20px;color:#666;font-size:13px">Responda diretamente a este email para contactar ${escapeHtml(request.name)} através de ${escapeHtml(request.email)}.</p></div></body></html>`,
  };
}
