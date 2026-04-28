import { z } from "zod";
import { VturbClient } from "../client.js";

const client = new VturbClient();

export const get_conversions_by_daySchema = z.object({
  player_id: z.string().describe("ID do player"),
  start_date: z.string().describe("Data inicial (YYYY-MM-DD)"),
  end_date: z.string().describe("Data final (YYYY-MM-DD)"),
  timezone: z.string().optional().default("America/Sao_Paulo").describe("Fuso horário (padrão: America/Sao_Paulo)"),
});

export async function handleGetConversionsByDay(params: z.infer<typeof get_conversions_by_daySchema>): Promise<string> {
  const result = await client.post("/conversions/stats_by_day", {
    player_id: params.player_id,
    start_date: params.start_date,
    end_date: params.end_date,
    timezone: params.timezone ?? "America/Sao_Paulo",
  });
  return JSON.stringify(result, null, 2);
}
