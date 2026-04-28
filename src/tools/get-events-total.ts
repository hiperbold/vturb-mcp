import { z } from "zod";
import { VturbClient } from "../client.js";

const client = new VturbClient();

export const get_events_totalSchema = z.object({
  events: z.array(z.enum(["started", "finished", "viewed"])).describe("Tipos de evento a consultar"),
  player_id: z.string().optional().describe("ID do player para filtrar (opcional — retorna todos se omitido)"),
  start_date: z.string().optional().describe("Data inicial (YYYY-MM-DD)"),
  end_date: z.string().optional().describe("Data final (YYYY-MM-DD)"),
});

export async function handleGetEventsTotal(params: z.infer<typeof get_events_totalSchema>): Promise<string> {
  const body: Record<string, unknown> = { events: params.events };
  if (params.player_id) body.player_id = params.player_id;
  if (params.start_date) body.start_date = params.start_date;
  if (params.end_date) body.end_date = params.end_date;
  const result = await client.post("/events/total_by_company", body);
  return JSON.stringify(result, null, 2);
}
