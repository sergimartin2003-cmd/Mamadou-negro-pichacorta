# TradeHub — 70 Features Progress

Tracking the extreme-features spec. One feature per slice: production code, unit
tests for domain logic, `typecheck + npm test + next build` all green, then a
commit pushed to `claude/elegant-brown-38fb2l`.

**How to resume:** read this file, find the first ⬜ item, build it next.

## Tracks
This repo now grows TWO specs as new TradeHub modules (branding stays
**TradeHub** — no EmprendeHub/rebrand; trading + games stay):
- **Track A** — 70 extreme gamification features (below).
- **Track B** — Multi-niche expansion (Emprendimiento / Inversiones / Ecom /
  Dropshipping / Marketing / Productividad), 44 modules, added as new sections.

### 💼 Track B — Multi-niche modules
- ✅ B1. Startup Dashboard — MRR/ARR, churn, CAC, LTV, LTV:CAC, burn, runway, growth, goal, alerts
- ⬜ B2. Business Model Canvas · ⬜ B3. Idea Validation · ⬜ B4. Pitch Deck Builder
- ⬜ B5. Entrepreneur Mentoring · ⬜ B6. Tasks/Projects · ⬜ B7. Legal Tech · ⬜ B8. Financial Modeling
- ✅ B9. Portfolio Tracker — multi-asset value/P&L, allocation by type+region, concentration & diversification, holdings table
- ⬜ B10. Robo-Advisor · ⬜ B11. Real Estate · ⬜ B12. Crypto Portfolio
- ⬜ B13. Dividend Tracker · ⬜ B14. Alt Investments · ⬜ B15. Retirement Planner · ⬜ B16. Research Hub
- ✅ B17. Store Builder — KPIs (conv, AOV, refunds, growth), catalog w/ margins+stock, top products, low-stock alerts
- ⬜ B18. Product Research · ⬜ B19. Supplier Directory · ⬜ B20. Inventory
- ⬜ B21. CRM · ⬜ B22. Marketing Automation · ⬜ B23. Shipping · ⬜ B24. Multi-channel
- ⬜ B25–B32. Dropshipping suite · ⬜ B33–B38. Marketing digital · ⬜ B39–B44. Productividad/Mindset

## Conventions / compliance notes
- The seed-backed data layer (`lib/data`) is the source of truth until Supabase
  is wired; new domain logic lives in `lib/domain/*` (pure + tested).
- Items requiring **real money / crypto / NFT / broker execution / AR /
  metaverse / wearables / voice** are implemented as **compliant equivalents**:
  a virtual-only economy (TradeCoins/XP, no real-money purchase), **simulated**
  market execution, and on-device-only stand-ins. Flagged with ⚠️ where adapted.

## Legend
✅ done · 🟡 in progress · ⬜ pending

---

### 🎮 Minijuegos y gamificación
- ⬜ 1. Trading Arena (Battle Royale) — ⚠️ adapt to simulated bot field / single-player ladder
- ✅ 2. Predict the Next Candle — modes Clásico/Turbo/Extremo, XP, streak, leaderboard
- ⬜ 3. Trading Tycoon (sim RPG)
- ⬜ 4. Market Crash Survival
- ⬜ 5. Trading Card Game (TCG) — ⚠️ NFT→virtual collectible cards
- ✅ 6. Speed Trading Challenge — 60s sprint, power-ups (Turbo/Clarity/2nd Chance), leaderboard
- ⬜ 7. Trading Poker
- ⬜ 8. Escape Room: The Trading Floor

### 🏆 Competición y ranking
- ✅ 9. Ligas Estacionales (ELO) — season countdown, ladder, end-of-season rewards, soft reset
- ⬜ 10. Duelos 1v1
- ⬜ 11. King of the Hill
- ⬜ 12. Ligas por equipos (clanes)
- ✅ 13. Desafíos diarios/semanales/mensuales — periods, progress, claim, streak bonus
- ⬜ 14. Rankings especializados

### 🎨 Personalización
- ⬜ 15. Avatares 3D — ⚠️ adapted: layered 2D avatar customizer
- ⬜ 16. Temas dinámicos
- ⬜ 17. Dashboard personalizable
- ⬜ 18. Efectos visuales y sonidos
- ⬜ 19. Tarjetas de perfil coleccionables
- ⬜ 20. Mascotas virtuales

### 🤖 IA
- ⬜ 21. Coach de trading — ⚠️ heuristic/local analysis (no external LLM keys assumed)
- ⬜ 22. Generador de setups
- ⬜ 23. Análisis de sentimiento
- ⬜ 24. Traductor de jerga
- ⬜ 25. Generador de estrategias
- ⬜ 26. Resúmenes automáticos
- ⬜ 27. Detección de sesgos cognitivos
- ⬜ 28. Generador de contenido

### 🌐 Social
- ⬜ 29. Mentoring
- ⬜ 30. Copy trading — ⚠️ simulated only, no real funds
- ⬜ 31. Pods (accountability)
- ⬜ 32. Live trading streams
- ⬜ 33. Amigos de trading (buddy)
- ⬜ 34. Networking profesional
- ⬜ 35. Tribus
- ⬜ 36. Reputación

### 💰 Economía virtual
- ⬜ 37. TradeCoins — ⚠️ virtual only, no real-money top-up
- ⬜ 38. Marketplace de estrategias
- ⬜ 39. Bounties
- ⬜ 40. Afiliados
- ⬜ 41. NFTs — ⚠️ virtual collectibles, no blockchain
- ⬜ 42. Staking de XP — ⚠️ virtual rewards

### 🎯 Retención
- ⬜ 43. Daily login rewards
- ⬜ 44. Gacha — ⚠️ virtual only, transparent odds, daily cap
- ⬜ 45. Misiones de historia
- ⬜ 46. Season Pass
- ⬜ 47. Wheel of Fortune — ⚠️ virtual only
- ⬜ 48. Scratch cards — ⚠️ virtual only
- ⬜ 49. Journal gamificado
- ⬜ 50. Puzzles diarios

### 🎪 Eventos
- ⬜ 51. Black Swan
- ⬜ 52. Eventos estacionales
- ⬜ 53. World Cup
- ⬜ 54. IPO de perfiles — ⚠️ virtual
- ⬜ 55. Hackathon

### 🔮 Futurista
- ⬜ 56. AR trading — ⚠️ adapted to non-AR interactive view
- ⬜ 57. Wearables — ⚠️ manual biometric input/simulation
- ⬜ 58. Trading por voz — ⚠️ adapted to quick-command palette
- ⬜ 59. Metaverso — ⚠️ adapted to virtual lounge view
- ⬜ 60. IA generativa de escenarios

### 📱 Móvil
- ⬜ 61. Widgets — ⚠️ web dashboard widgets
- ⬜ 62. Notificaciones inteligentes
- ⬜ 63. Trading on the go
- ⬜ 64. Live Activities — ⚠️ web equivalent
- ⬜ 65. Siri/Assistant — ⚠️ command palette

### 🎁 Sorpresa
- ⬜ 66. Easter eggs
- ⬜ 67. Mensajes sorpresa
- ⬜ 68. Celebraciones automáticas
- ⬜ 69. Regalos aleatorios
- ⬜ 70. Personalización con IA

---

## Changelog
- Feature 2 (Predict the Next Candle): `lib/domain/predict.ts` + 27 tests,
  `components/games/**`, routes `/games` + `/games/predict-candle`, Arcade nav,
  seed leaderboard + `getPredictLeaderboard()`. 140 tests green, build green.
- Feature 6 (Speed Trading Challenge): `lib/domain/speed.ts` + 17 tests,
  `components/games/speed-trading/**`, route `/games/speed-trading`, hub entry,
  seed leaderboard + `getSpeedLeaderboard()`. 157 tests green, build green.
- Feature 13 (Desafíos): `lib/domain/challenges.ts` + 16 tests (period keys,
  ISO week, completion, streak bonus), `components/challenges/**`, route
  `/challenges`, Quests nav, seed challenges + `getChallenges()`. 173 green.
- Feature 9 (Ligas Estacionales): `lib/domain/season.ts` + 8 tests (countdown,
  progress, tier rewards) built on existing `tiers.ts`/`elo.ts`,
  `components/leagues/**`, route `/leagues`, Leagues nav, seed season +
  `getCurrentSeason()`. 181 green, build green.
- Feature B1 (Startup Dashboard): `lib/domain/startup.ts` + 26 tests (ARR,
  churn, CAC, LTV, LTV:CAC, burn, runway, growth, required growth, alerts),
  `components/startup/**`, route `/startup`, Startup nav, briefcase icon,
  seed snapshot + `getStartupSnapshot()`. 207 green, build green.
- Feature B17 (Store Builder): `lib/domain/store.ts` + 20 tests (conversion,
  AOV, refund rate, revenue growth, gross margin, stock status, inventory/
  retail value, low-stock, top products), `components/store/**`, route
  `/store`, Store nav, bag icon, seed store + `getStoreSnapshot()`. 227 green.
- Feature B9 (Portfolio Tracker): `lib/domain/portfolio.ts` + 17 tests (market
  value, P&L, return %, allocation by type/region, concentration, Herfindahl
  diversification, top movers), `components/portfolio/**`, route `/portfolio`,
  Invest nav, pie icon, seed portfolio + `getPortfolioSnapshot()`. 244 green.
