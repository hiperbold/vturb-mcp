import { readFileSync } from "fs";

const envFile = process.env.VTURB_ENV_FILE;
if (envFile) {
  try {
    const content = readFileSync(envFile, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (key && !(key in process.env)) {
        process.env[key] = val;
      }
    }
  } catch (e) {
    console.error(`[vturb-mcp] Não foi possível carregar o arquivo env: ${envFile}`, e);
  }
}
