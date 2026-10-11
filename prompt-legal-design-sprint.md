# Prompt — Análise vTurb: Legal Design Sprint

## Contexto

Este prompt descreve como extrair e apresentar dados de performance de vídeo (vTurb) para o produto **Legal Design Sprint** (cliente Legal Design Bits).

**Token de acesso:** `.env.legal-design-sprint` em `F:\local-mcps\vturb-mcp\`  
**Base URL da API:** `https://analytics.vturb.net`  
**Headers obrigatórios:**
```
X-Api-Token: <token do .env>
X-Api-Version: v1
Content-Type: application/json
```

> O MCP da vTurb pode não estar registrado no Claude no momento da conversa. Nesse caso, fazer as chamadas via `curl` diretamente. Ler o token em `F:\local-mcps\vturb-mcp\.env.legal-design-sprint`.

---

## Players a analisar

Consultar sempre com `GET /players/list` para confirmar os IDs atuais. Os players ativos e relevantes do produto são:

| Player | ID | Pitch (s) | Duração (s) |
|---|---|---|---|
| LDS - MARI | `6786b4de9d32a53169d9c29c` | 1620 | 1770 |
| [Teste A/B] LDS - MARI | `69c52afa5341b955f71e7f92` | 1620 | 1770 |
| VSL MARI 3 - Sem óculos | `69b02d3b67e25327328f9d7b` | 1620 | 1823 |
| [Teste A/B] VSL MARI 3 - Sem óculos | `69c52afa96fd2c2d9b22121b` | 1620 | 1823 |

**Ignorar:** LDS - ERIK, VSL MARI 2 - Com óculos, [AB] VSL MARI 2, UPSELL Cofre Bits, LDS - Upsell, ADN - Sabrina.

**Consolidação:** Sempre somar os dados do player original com sua variante A/B, apresentando como um único grupo. Taxas e médias são ponderadas pelo volume (plays ou amostra de engagement conforme o caso).

---

## Períodos padrão

Calcular sempre os 3 períodos abaixo com base na data atual:

| Label | Intervalo |
|---|---|
| **Mês atual** | 1º do mês corrente até hoje |
| **14D** | 14 dias atrás até hoje |
| **7D** | 7 dias atrás até hoje |

Formato de data aceito pela API: `"YYYY-MM-DD HH:MM:SS"` (ex: `"2026-04-01 00:00:00"` e `"2026-04-28 23:59:59"`).

---

## Endpoints e métricas

### 1. Session Stats — `POST /sessions/stats`

Payload:
```json
{
  "player_id": "<id>",
  "start_date": "YYYY-MM-DD HH:MM:SS",
  "end_date": "YYYY-MM-DD HH:MM:SS",
  "timezone": "America/Sao_Paulo"
}
```

Campos relevantes a extrair:
- `total_viewed_device_uniq` → **Views únicas**
- `total_started_device_uniq` → **Plays únicos**
- `total_finished_device_uniq` → **Finalizações únicas**
- `total_conversions` → **Conversões**
- `total_amount_brl` → **Receita BRL** *(dividir por 100 para converter de centavos)*
- `play_rate` → **Play Rate**
- `engagement_rate` → **Engajamento médio** (% médio do vídeo assistido)
- `over_pitch_rate` → **Audiência no Pitch** (% dos plays que chegaram ao pitch)
- `overall_conversion_rate` → **Taxa de Conversão**

**Não incluir:** cliques, total_clicked, total_clicked_session_uniq, total_clicked_device_uniq.

### 2. User Engagement — `POST /times/user_engagement`

Payload:
```json
{
  "player_id": "<id>",
  "video_duration": <duração em segundos>,
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "timezone": "America/Sao_Paulo"
}
```

Retorna `grouped_timed`: array de `{timed, total_users}` em intervalos de 5 segundos.

Para calcular **Retenção em 1 min**:
```
ret_1min = total_users[timed=60] / total_users[timed=0] * 100
```

> O endpoint amosta ~19% dos plays reais. A taxa percentual é representativa; os valores absolutos não devem ser comparados com session stats.  
> Se `total_users[timed=0]` for 0 ou menor que ~50, o dado é insuficiente — anotar como "n/a (amostra insuficiente)".

---

## Consolidação dos grupos

### Grupo 1: LDS - MARI (consolidado)
= LDS - MARI original + [Teste A/B] LDS - MARI

### Grupo 2: VSL MARI 3 — Sem óculos (consolidado)
= VSL MARI 3 original + [Teste A/B] VSL MARI 3

**Regras de consolidação:**

| Tipo de campo | Como consolidar |
|---|---|
| Views, Plays, Finalizações, Conversões | **Soma** |
| Receita BRL | **Soma** |
| Play Rate | Plays_total / Views_total |
| Taxa de Conversão | Conversões_total / Plays_total |
| Engajamento médio | Média ponderada por Plays |
| Audiência no Pitch | (over_pitch_A + over_pitch_B) / (total_started_A + total_started_B) usando os campos `total_over_pitch` e `total_under_pitch` |
| Retenção 1 min | Média ponderada por `t0` de cada player |

---

## Formato de apresentação

Apresentar dois blocos, um por grupo. Dentro de cada bloco, tabela com os 3 períodos em colunas. Ao final, tabela comparativa entre os dois grupos para o período do mês.

### Estrutura das tabelas

```
| Métrica           | Mês atual | 14D | 7D |
|---|---|---|---|
| Views únicas      | ...       | ... | ...|
| Plays únicos      | ...       | ... | ...|
| Finalizações      | ...       | ... | ...|
| Conversões        | ...       | ... | ...|
| Receita BRL       | R$ ...    | ... | ...|
| Play Rate         | ...%      | ... | ...|
| Retenção 1 min    | ...%      | ... | ...|
| Engajamento médio | ...%      | ... | ...|
| Audiência Pitch   | ...%      | ... | ...|
| Taxa de Conversão | ...%      | ... | ...|
```

- Receita: formatar como `R$ 55.429,66` (ponto para milhar, vírgula para decimal)
- Se o período mostra zero significativo (player inativo), indicar com `—`
- Adicionar nota quando A/B estiver inativo num período (ex: "14D e 7D refletem apenas o player original")

---

## Observações técnicas

- Chamar todos os endpoints em paralelo quando possível (curl em background com `&` + `wait`)
- Rate limit da API: 120 req/min (Pro tier) — sem risco com o volume desta análise
- Se algum player retornar tudo zero, verificar se o A/B foi desativado antes do período consultado
- Os campos `total_over_pitch` e `total_under_pitch` podem retornar valores idênticos entre períodos diferentes para o mesmo player (possível limitação da API) — usar a taxa percentual, não os absolutos
