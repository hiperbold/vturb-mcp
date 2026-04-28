import { z } from "zod";
import { VturbClient } from "../client.js";

const client = new VturbClient();

export const list_playersSchema = z.object({
  start_date: z.string().optional().describe("Data inicial (YYYY-MM-DD) para filtrar players criados no período"),
  end_date: z.string().optional().describe("Data final (YYYY-MM-DD)"),
  timezone: z.string().optional().default("America/Sao_Paulo").describe("Fuso horário (padrão: America/Sao_Paulo)"),
  name: z.string().optional().describe("Filtrar por nome do player (3–128 caracteres)"),
  name_match: z.enum(["contains", "starts_with", "ends_with", "exact"]).optional().describe("Modo de busca por nome (padrão: contains)"),
});

export async function handleListPlayers(params: z.infer<typeof list_playersSchema>): Promise<string> {
  const query: Record<string, string> = {};
  if (params.start_date) query.start_date = params.start_date;
  if (params.end_date) query.end_date = params.end_date;
  if (params.timezone) query.timezone = params.timezone;
  if (params.name) query.name = params.name;
  if (params.name_match) query.name_match = params.name_match;
  const result = await client.get("/players/list", query);
  return JSON.stringify(result, null, 2);
}
