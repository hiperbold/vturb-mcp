import { z } from "zod";
import { VturbClient } from "../client.js";

const client = new VturbClient();

export const get_clicks_by_daySchema = z.object({
  player_id: z.string().describe("ID do player"),
  start_date: z.string().describe("Data inicial (YYYY-MM-DD)"),
  end_date: z.string().describe("Data final (YYYY-MM-DD)"),
  timezone: z.string().optional().default("America/Sao_Paulo").describe("Fuso horário (padrão: America/Sao_Paulo)"),
});

export async function handleGetClicksByDay(params: z.infer<typeof get_clicks_by_daySchema>): Promise<string> {
  const result = await client.post("/clicks/total_by_company_day", {
    player_id: params.player_id,
    start_date: params.start_date,
    end_date: params.end_date,
    timezone: params.timezone ?? "America/Sao_Paulo",
  });
  return JSON.stringify(result, null, 2);
}
