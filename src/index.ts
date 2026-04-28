#!/usr/bin/env node

import "./env.js";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { list_playersSchema, handleListPlayers } from "./tools/list-players.js";
import { find_active_playersSchema, handleFindActivePlayers } from "./tools/find-active-players.js";
import { get_quota_usageSchema, handleGetQuotaUsage } from "./tools/get-quota-usage.js";
import { get_session_statsSchema, handleGetSessionStats } from "./tools/get-session-stats.js";
import { get_session_stats_by_daySchema, handleGetSessionStatsByDay } from "./tools/get-session-stats-by-day.js";
import { get_events_totalSchema, handleGetEventsTotal } from "./tools/get-events-total.js";
import { get_events_by_daySchema, handleGetEventsByDay } from "./tools/get-events-by-day.js";
import { get_user_engagementSchema, handleGetUserEngagement } from "./tools/get-user-engagement.js";
import { get_user_engagement_by_daySchema, handleGetUserEngagementByDay } from "./tools/get-user-engagement-by-day.js";
import { get_clicks_timedSchema, handleGetClicksTimed } from "./tools/get-clicks-timed.js";
import { get_clicks_by_daySchema, handleGetClicksByDay } from "./tools/get-clicks-by-day.js";
import { get_conversions_by_daySchema, handleGetConversionsByDay } from "./tools/get-conversions-by-day.js";
import { get_live_usersSchema, handleGetLiveUsers } from "./tools/get-live-users.js";
import { get_headlines_statsSchema, handleGetHeadlinesStats } from "./tools/get-headlines-stats.js";
import { get_traffic_origin_statsSchema, handleGetTrafficOriginStats } from "./tools/get-traffic-origin-stats.js";

const server = new McpServer({ name: "vturb-mcp", version: "1.0.0" });

server.tool("list_players", "Lista todos os players da conta vTurb com nome, duração e pitch_time", list_playersSchema.shape,
  async (p) => ({ content: [{ type: "text", text: await handleListPlayers(p) }] }));

server.tool("find_active_players", "Detecta quais players receberam visualizações hoje — retorna id, name, duration e pitch_time dos ativos", find_active_playersSchema.shape,
  async (p) => ({ content: [{ type: "text", text: await handleFindActivePlayers(p) }] }));

server.tool("get_quota_usage", "Retorna uso atual da cota de API (queries usadas, restantes, limite por minuto e diário)", get_quota_usageSchema.shape,
  async (p) => ({ content: [{ type: "text", text: await handleGetQuotaUsage(p) }] }));

server.tool("get_session_stats", "Retorna o dashboard principal de sessões: views, plays, engajamento, cliques, conversões e receita em BRL/USD/EUR", get_session_statsSchema.shape,
  async (p) => ({ content: [{ type: "text", text: await handleGetSessionStats(p) }] }));

server.tool("get_session_stats_by_day", "Retorna estatísticas de sessões agrupadas por dia (histórico diário completo)", get_session_stats_by_daySchema.shape,
  async (p) => ({ content: [{ type: "text", text: await handleGetSessionStatsByDay(p) }] }));

server.tool("get_events_total", "Retorna totais de eventos (started/finished/viewed) com contagens únicas por sessão e dispositivo", get_events_totalSchema.shape,
  async (p) => ({ content: [{ type: "text", text: await handleGetEventsTotal(p) }] }));

server.tool("get_events_by_day", "Retorna totais de eventos agrupados por dia para análise de tendência", get_events_by_daySchema.shape,
  async (p) => ({ content: [{ type: "text", text: await handleGetEventsByDay(p) }] }));

server.tool("get_user_engagement", "Retorna a curva de retenção do vídeo: total de usuários em cada segundo assistido + taxa de engajamento geral", get_user_engagementSchema.shape,
  async (p) => ({ content: [{ type: "text", text: await handleGetUserEngagement(p) }] }));

server.tool("get_user_engagement_by_day", "Retorna a taxa de engajamento por dia no período selecionado", get_user_engagement_by_daySchema.shape,
  async (p) => ({ content: [{ type: "text", text: await handleGetUserEngagementByDay(p) }] }));

server.tool("get_clicks_timed", "Retorna cliques no CTA agrupados por segundo do vídeo (identifica o momento de maior intenção)", get_clicks_timedSchema.shape,
  async (p) => ({ content: [{ type: "text", text: await handleGetClicksTimed(p) }] }));

server.tool("get_clicks_by_day", "Retorna totais de cliques no CTA agrupados por dia", get_clicks_by_daySchema.shape,
  async (p) => ({ content: [{ type: "text", text: await handleGetClicksByDay(p) }] }));

server.tool("get_conversions_by_day", "Retorna conversões agrupadas por dia com totais únicos por sessão e dispositivo", get_conversions_by_daySchema.shape,
  async (p) => ({ content: [{ type: "text", text: await handleGetConversionsByDay(p) }] }));

server.tool("get_live_users", "Retorna usuários ativos agora por domínio (últimos N minutos, padrão 60)", get_live_usersSchema.shape,
  async (p) => ({ content: [{ type: "text", text: await handleGetLiveUsers(p) }] }));

server.tool("get_headlines_stats", "Retorna painel resumo (headlines): views, plays, engajamento, cliques e conversão em uma única chamada", get_headlines_statsSchema.shape,
  async (p) => ({ content: [{ type: "text", text: await handleGetHeadlinesStats(p) }] }));

server.tool("get_traffic_origin_stats", "Retorna estatísticas segmentadas por origem de tráfego (utm_source, utm_medium, etc.)", get_traffic_origin_statsSchema.shape,
  async (p) => ({ content: [{ type: "text", text: await handleGetTrafficOriginStats(p) }] }));

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[vturb-mcp] Servidor iniciado. 15 tools disponíveis. Rate limit: 120 req/min (Pro).");
}

main().catch((error) => { console.error("[vturb-mcp] Erro:", error); process.exit(1); });
