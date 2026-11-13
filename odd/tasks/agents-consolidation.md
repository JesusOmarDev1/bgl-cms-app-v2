# Agents configuration consolidation
Feature branch: `docs/agents-consolidation`. Preserve unrelated working-tree edits.
Source of truth for this migration; record each completed task's evidence and commit.

## Specs
S1. "vamos a actualizar la documentacion de la IA para mantener un mejor orden y eliminar carpetas como .cursor, .codex, .claude, etcetera y vamos a dejar algo mas generico como .agents ahi escribiremos reglas y vamos a refactorizar las existentes para mejorarlas y vamos a ayudarnos utilizando esta documentacion https://dotagentsprotocol.com/"
S2. "Eliminar .codex; aceptar pérdida del bloqueo automático"
S3. "Sí, corregí solo ese error y repetí el gate"
S4. "Vamos a dejar solo AGENTS.md que esta en la raiz y eliminar el agents.md duplicado en la carpeta .agents asi ya solo tendremos una instruccion y listo"

## Tasks
T1 [S1] Consolidate and improve existing rules under `.agents/`; route: writer; status: done; commit: pending.
T2 [S1] Preserve and migrate existing project skills to `.agents/skills/`; route: writer; status: done; commit: pending.
T3 [S1-S2] Bridge root instructions, update references, verify then remove `.cursor/` and `.codex/`; route: parent; status: done; commit: pending.
T4 [S1-S3] Run applicable structural, functional and independent checks; route: parent/verify; status: done; commit: pending.
T5 [S3] Fix only the existing timer-cleanup lint error in `AnimatedSearchInput.tsx`; route: parent; status: done; commit: pending.
T6 [S4] Keep root `AGENTS.md` as the single instruction entrypoint and remove `.agents/agents.md`; route: parent; status: verified, commit pending; commit: pending.

## Log
L1. Bueno ahora vamos a actualizar la documentacion de la IA para mantener un mejor orden y eliminar carpetas como .cursor, .codex, .claude, etcetera y vamos a dejar algo mas generico como .agents ahi escribiremos reglas y vamos a refactorizar las existentes para mejorarlas y vamos a ayudarnos utilizando esta documentacion https://dotagentsprotocol.com/
L2. User selected: Eliminar .codex; aceptar pérdida del bloqueo automático.
L3. T1 and T2 launched as disjoint bounded writers; source originals remain untouched until verified.
L4. T1 returned 19/19 rule and metadata coverage. Root AGENTS now dispatches `.agents/agents.md`; copied textual Codex guard is not executable. T2 still migrating; no vendor directory deleted.
L5. T2 returned 21/21 skills with 14 relative links resolving and two stale Arc references updated. Registry refreshed with 145 skills; while originals remain it still selects `.cursor` first. Independent pre-deletion verification launched.
L6. Pre-deletion verifier confirmed 19/19 rules and 21/21 skills but required post-removal discovery proof. Moved three ignored debug logs intact to `.atl/legacy-cursor-logs/`; removed 42 tracked vendor files from `.cursor/` and `.codex/` with `git rm -r`; refreshed skill registry and checked 8 project skills resolve to `.agents/skills`. Final gate and independent verifier running.
L7. Post-removal verifier confirmed 19/19 rules, 21/21 skills, 14 relative links, root dispatcher and 8 discovered project skills. `pnpm exec prettier --check "**/*.{ts,tsx,mjs,json}"` passed; `pnpm exec vitest run --project unit` passed 23 files/98 tests. `pnpm pre-deploy` generated types and passed typecheck, then failed on pre-existing `react-doctor/effect-needs-cleanup` at `components/shared/search/AnimatedSearchInput.tsx:67` (1 error, 35 warnings); format, unit and build stages were not reached in that chained gate. No commit: out-of-scope lint fix and required full-gate proof await user decision. Three ignored logs moved byte-preserving with matching file sizes; original hashes were not captured.
L8. User selected: Sí, corregí solo ese error y repetí el gate.
L9. No dupliques dos agents.md, solo centraliza uno dentro de .agents y el otro eliminalo, y el claude.md solo menciona la ruta donde estara agents.md
L10. Installed Next 16.4.6 docs (`agentRules.md`, `agentFeedback.md`) and `generate-agent-files.js` show `next dev` recreates root `AGENTS.md`: `agentRules` defaults on and `experimental.agentFeedback: true` is set in current `next.config.ts`. Stable one-file layout requires disabling both and accepting loss of root auto-discovery and Next's automatic feedback instructions; awaiting explicit user choice.
L11. Reproduced original `react-doctor/effect-needs-cleanup` error in the prior full gate; a focused ESLint RED command timed out after 30 seconds and was not retried. Changed only `AnimatedSearchInput.tsx`: each pending nested timer now has one cancellation owner and is cancelled before replacement and on effect cleanup. `git diff --check` passed; full gate deferred until canonical-entrypoint choice is resolved.
L12. Vamos a dejar solo AGENTS.md que esta en la raiz y eliminar el agents.md duplicado en la carpeta .agents asi ya solo tendremos una instruccion y listo
L13. Removed `.agents/agents.md`; root `AGENTS.md` now dispatches `.agents/rules/*.md` and `.agents/skills/<name>/SKILL.md` directly. `CLAUDE.md` remains exactly `@AGENTS.md`. `next.config.ts` retained its agentRules/agentFeedback behavior. Staged only the root dispatcher hunk, preserving pre-existing uncommitted ui-sdk guidance.
L14. User said: Intentalo de nuevo. First full-gate rerun was stopped after the verifier flagged a concrete short-interval regression: cancelling each pending nested swap let an interval shorter than the swap duration leave the placeholder stuck in `is-exit`. Replaced with a pending-swap set that lets every scheduled swap fire (matching prior observable behavior) while cleanup cancels all of them. New gate rerun pending.
L15. `pnpm pre-deploy` exited 0 after the pending-swap timer fix: typegen, typecheck, lint, non-mutating Prettier check, Vitest unit project and build all passed in one chained run on the final root-only instruction layout. All work-unit staging remains uncommitted awaiting user instruction.
