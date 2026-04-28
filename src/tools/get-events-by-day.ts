import { z } from "zod";
import { VturbClient } from "../client.js";

const client = new VturbClient();

export const get_events_by_daySchema = z.object({
  player_id: z.string().describe("ID do player"),
  events: z.array(z.enum(["started", "finished", "viewed"])).describe("Tipos de evento a consultar"),
  start_date: z.string().optional().describe("Data inicial (YYYY-MM-DD)"),
  end_date: z.string().optional().describe("Data final (YYYY-MM-DD)"),
  timezone: z.string().optional().default("America/Sao_Paulo").describe("Fuso horário (padrão: America/Sao_Paulo)"),
});

export async function handleGetEventsByDay(params: z.infer<typeof get_events_by_daySchema>): Promise<string> {
  const body: Record<string, unknown> = {
    player_id: params.player_id,
    events: params.events,
    timezone: params.timezone ?? "America/Sao_Paulo",
  };
  if (params.start_date) body.start_date = params.start_date;
  if (params.end_date) body.end_date = params.end_date;
  const result = await client.post("/events/total_by_company_day", body);
  return JSON.stringify(result, null, 2);
}
