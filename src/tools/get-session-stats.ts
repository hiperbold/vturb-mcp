import { z } from "zod";
import { VturbClient } from "../client.js";

const client = new VturbClient();

export const get_session_statsSchema = z.object({
  player_id: z.string().describe("ID do player (use find_active_players para obter)"),
  start_date: z.string().describe("Data inicial (YYYY-MM-DD)"),
  end_date: z.string().describe("Data final (YYYY-MM-DD)"),
  video_duration: z.number().int().optional().describe("Duração do vídeo em segundos (usa valor do banco se omitido)"),
  pitch_time: z.number().int().optional().describe("Tempo de pitch em segundos (usa valor do banco se omitido)"),
  timezone: z.string().optional().default("America/Sao_Paulo").describe("Fuso horário (padrão: America/Sao_Paulo)"),
});

export async function handleGetSessionStats(params: z.infer<typeof get_session_statsSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    player_id: params.player_id,
    start_date: params.start_date,
    end_date: params.end_date,
    timezone: params.timezone ?? "America/Sao_Paulo",
  };
  if (params.video_duration !== undefined) body.video_duration = params.video_duration;
  if (params.pitch_time !== undefined) body.pitch_time = params.pitch_time;
  const result = await client.post("/sessions/stats", body);
  return JSON.stringify(result, null, 2);
}
