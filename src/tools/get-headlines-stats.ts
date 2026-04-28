import { z } from "zod";
import { VturbClient } from "../client.js";

const client = new VturbClient();

export const get_headlines_statsSchema = z.object({
  player_id: z.string().describe("ID do player"),
  start_date: z.string().describe("Data inicial (YYYY-MM-DD)"),
  video_duration: z.number().int().describe("Duração do vídeo em segundos"),
  pitch_time: z.number().int().optional().describe("Tempo de pitch em segundos"),
});

export async function handleGetHeadlinesStats(params: z.infer<typeof get_headlines_statsSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    player_id: params.player_id,
    start_date: params.start_date,
    video_duration: params.video_duration,
  };
  if (params.pitch_time !== undefined) body.pitch_time = params.pitch_time;
  const result = await client.post("/headlines/stats_by_player", body);
  return JSON.stringify(result, null, 2);
}
