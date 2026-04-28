import { z } from "zod";
import { VturbClient } from "../client.js";

const client = new VturbClient();

export const get_quota_usageSchema = z.object({});

export async function handleGetQuotaUsage(_params: z.infer<typeof get_quota_usageSchema>): Promise<string> {
  const result = await client.get("/quota/usage");
  return JSON.stringify(result, null, 2);
}
