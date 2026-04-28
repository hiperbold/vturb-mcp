import { z } from "zod";
import { VturbClient } from "../client.js";

const client = new VturbClient();

export const get_traffic_origin_statsSchema = z.object({
  player_id: z.string().describe("ID do player"),
  start_date: z.string().describe("Data inicial (YYYY-MM-DD)"),
  end_date: z.string().describe("Data final (YYYY-MM-DD)"),
  query_key: z.enum(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "src", "sck"]).describe("Campo de agrupamento da origem de tráfego"),
  video_duration: z.number().int().describe("Duração do vídeo em segundos"),
  pitch_time: z.number().int().optional().describe("Tempo de pitch em segundos"),
  timezone: z.string().optional().default("America/Sao_Paulo").describe("Fuso horário (padrão: America/Sao_Paulo)"),
});

export async function handleGetTrafficOriginStats(params: z.infer<typeof get_traffic_origin_statsSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    player_id: params.player_id,
    start_date: params.start_date,
    end_date: params.end_date,
    query_key: params.query_key,
    video_duration: params.video_duration,
    timezone: params.timezone ?? "America/Sao_Paulo",
  };
  if (params.pitch_time !== undefined) body.pitch_time = params.pitch_time;
  const result = await client.post("/traffic_origin/stats", body);
  return JSON.stringify(result, null, 2);
}
