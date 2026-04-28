import { z } from "zod";
import { VturbClient } from "../client.js";

const client = new VturbClient();

export const get_user_engagementSchema = z.object({
  player_id: z.string().describe("ID do player"),
  video_duration: z.number().int().describe("Duração total do vídeo em segundos"),
  start_date: z.string().optional().describe("Data inicial (YYYY-MM-DD)"),
  end_date: z.string().optional().describe("Data final (YYYY-MM-DD)"),
  timezone: z.string().optional().default("America/Sao_Paulo").describe("Fuso horário (padrão: America/Sao_Paulo)"),
});

export async function handleGetUserEngagement(params: z.infer<typeof get_user_engagementSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    player_id: params.player_id,
    video_duration: params.video_duration,
    timezone: params.timezone ?? "America/Sao_Paulo",
  };
  if (params.start_date) body.start_date = params.start_date;
  if (params.end_date) body.end_date = params.end_date;
  const result = await client.post("/times/user_engagement", body);
  return JSON.stringify(result, null, 2);
}
