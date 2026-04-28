import { z } from "zod";
import { VturbClient } from "../client.js";

const client = new VturbClient();

export const find_active_playersSchema = z.object({
  timezone: z.string().optional().default("America/Sao_Paulo").describe("Fuso horário para verificar atividade de hoje (padrão: America/Sao_Paulo)"),
});

interface Player {
  id: string;
  name: string;
  pitch_time?: number;
  duration?: number;
  created_at?: string;
}

interface EventTotal {
  event: string;
  total: number;
  total_uniq_sessions?: number;
  total_uniq_device?: number;
}

export async function handleFindActivePlayers(params: z.infer<typeof find_active_playersSchema>): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);

  const players = await client.get("/players/list", {
    timezone: params.timezone ?? "America/Sao_Paulo",
  }) as Player[];

  if (!Array.isArray(players) || players.length === 0) {
    return JSON.stringify({ active_players: [], message: "Nenhum player encontrado na conta." });
  }

  const active: Array<Player & { today_starts: number }> = [];

  for (const player of players) {
    try {
      const events = await client.post("/events/total_by_company", {
        events: ["started"],
        player_id: player.id,
        start_date: today,
        end_date: today,
      }) as EventTotal[];

      const starts = Array.isArray(events) ? (events[0]?.total ?? 0) : 0;
      if (starts > 0) {
        active.push({ ...player, today_starts: starts });
      }
    } catch {
      // player sem dados hoje — ignora
    }
  }

  return JSON.stringify({
    checked_at: today,
    timezone: params.timezone ?? "America/Sao_Paulo",
    total_players: players.length,
    active_count: active.length,
    active_players: active,
    note: "Use o 'id' de cada player como 'player_id' nas demais tools. 'duration' e 'pitch_time' já estão incluídos.",
  }, null, 2);
}
