import { z } from "zod";
import { VturbClient } from "../client.js";

const client = new VturbClient();

export const get_live_usersSchema = z.object({
  player_id: z.string().describe("ID do player (UUID)"),
  minutes: z.number().int().min(1).max(720).optional().default(60).describe("Janela de tempo em minutos para contar usuários ativos (1–720, padrão: 60)"),
});

export async function handleGetLiveUsers(params: z.infer<typeof get_live_usersSchema>): Promise<string> {
  const result = await client.get("/sessions/live_users", {
    player_id: params.player_id,
    minutes: String(params.minutes ?? 60),
  });
  return JSON.stringify(result, null, 2);
}
