const BASE_URL = "https://analytics.vturb.net";
const TIMEOUT = 20_000;

// Pro tier: 120 req/min → 1 token every 500ms
const RATE_LIMIT = 120;
const REFILL_INTERVAL_MS = 60_000 / RATE_LIMIT; // 500ms per token

export class VturbClient {
  private apiToken: string;
  private tokens: number;
  private lastRefill: number;

  constructor() {
    this.apiToken = process.env.VTURB_API_TOKEN ?? "";
    if (!this.apiToken) {
      throw new Error(
        "[vturb-mcp] VTURB_API_TOKEN não encontrado. " +
        "Configure VTURB_ENV_FILE apontando para seu .env.nome-do-cliente."
      );
    }
    this.tokens = RATE_LIMIT;
    this.lastRefill = Date.now();
  }

  private async acquireToken(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = Math.floor(elapsed / REFILL_INTERVAL_MS);
    if (tokensToAdd > 0) {
      this.tokens = Math.min(RATE_LIMIT, this.tokens + tokensToAdd);
      this.lastRefill += tokensToAdd * REFILL_INTERVAL_MS;
    }
    if (this.tokens > 0) {
      this.tokens--;
      return;
    }
    const waitMs = REFILL_INTERVAL_MS - (Date.now() - this.lastRefill);
    await new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, waitMs)));
    return this.acquireToken();
  }

  async get(path: string, params?: Record<string, string>): Promise<unknown> {
    await this.acquireToken();
    const url = new URL(`${BASE_URL}${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
      }
    }
    return this.send("GET", url.toString());
  }

  async post(path: string, body: unknown): Promise<unknown> {
    await this.acquireToken();
    return this.send("POST", `${BASE_URL}${path}`, body);
  }

  private async send(method: string, url: string, body?: unknown): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "X-Api-Token": this.apiToken,
          "X-Api-Version": "v1",
          "Content-Type": "application/json",
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`vTurb HTTP ${response.status}: ${text}`);
      }
      return response.json();
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("vTurb: timeout na requisição (20s).");
      }
      throw error;
    }
  }
}
