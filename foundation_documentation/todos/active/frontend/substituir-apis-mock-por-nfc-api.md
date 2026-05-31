# Template: Tactical TODO (Active)

Use this file as a starting point for `foundation_documentation/todos/active/<short_slug>.md`.
Do not create TODOs from scratch; always copy this template first.
Fill the contract sections first. Gate-driven sections below are completed only when their gate triggers. For `small` work, keep non-triggered sections concise or mark them `n/a` instead of inflating the TODO just to “use the whole template”.
Deterministic validators currently read a narrow set of canonical headings/labels from this tactical template. If those headings/labels are intentionally changed, update the supporting schema/tooling in the same change so the diagnostics stay aligned with the markdown.

## Quick Start
```bash
cp delphi-ai/templates/todo_template.md foundation_documentation/todos/active/<lane>/<TODO-name>.md
```

## Title
Substituir chamadas mock do TINCE_FRONT-END por APIs reais do NFC_API

## Artifact Identity
- **Artifact type:** `tactical_execution_contract`

## Context
O front TINCE ainda aponta para mocks/stubs em partes do fluxo academico. Precisamos apontar para os endpoints reais do NFC_API para finalizar a integracao de tela, fluxo e validacao ponta a ponta.

## Framing Source & Story Slice
- **Feature brief:** `<foundation_documentation/artifacts/feature-briefs/<slug>.md|direct-to-todo>`
- **Feature brief:** `direct-to-todo`
- **Primary story ID:** `ST-01`
- **Why this is the right current slice:** troca de base de consumo de API no front e um slice coeso de integracao.
- **Direct-to-TODO rationale (required when `Feature brief = direct-to-todo`):** o objetivo ja esta bem delimitado e nao exige decomposicao adicional.

## Contract Boundary
- This TODO defines **WHAT** must be delivered and what counts as done.
- `Assumptions Preview` and `Execution Plan` below define **HOW** Delphi currently intends to deliver this contract.
- This TODO is **bounded but elastic**: Delphi may absorb local discoveries only while they remain inside the same primary objective and the same main approval/review/promotion conversation. Secondary modules may still be touched when they are subordinate to that same slice.
- If any assumption or plan step changes `Scope`, `Out of Scope`, `Definition of Done`, required validation semantics, public contract, or frozen decisions, update the TODO contract first and request renewed approval before execution continues.

## Delivery Status Canon (Required)
- **Current delivery stage:** `<Pending|Local-Implemented|Lane-Promoted|Production-Ready>`
- **Current delivery stage:** `Pending`
- **Qualifiers:** `none`
- **Next exact step:** mapear no TINCE_FRONT-END onde cada endpoint mock esta sendo usado e preparar o plano de substituicao.

## Scope
- [ ] Levantar todas as chamadas de API atuais no `TINCE_FRONT-END`.
- [ ] Mapear cada chamada para o endpoint real correspondente do `NFC_API`.
- [ ] Substituir clients/services/hooks para usar as rotas reais.
- [ ] Ajustar payloads e parsing de response conforme DTOs atuais do backend.
- [ ] Validar fluxos principais do front apos a troca.

## Delivery Status Semantics
- `Pending`: no meaningful delivery milestone has been reached yet.
- `Local-Implemented`: work is implemented in a local branch and validated locally.
- `Lane-Promoted`: work has been merged through the declared lane threshold (usually `dev`).
- `Production-Ready`: final required lane threshold is complete and confidence gates are satisfied.
- `Provisional`: delivery is intentionally partial/incomplete but useful for unblocking dependent work.
- `Blocked`: work cannot currently proceed; `Blocker Notes` become mandatory.

## Provisional Notes (Required if `Qualifiers` includes `Provisional`)
- **Missing for production-ready:** <What is intentionally incomplete>
- **Revisit criteria:** <What must be done to exit provisional>
- **Dependencies unblocked:** <What work can now proceed>

## Blocker Notes (Required if `Qualifiers` includes `Blocked`)
- **Blocker:** <Concrete blocker>
- **Why blocked now:** <Why the TODO cannot currently progress>
- **What unblocks it:** <Decision, dependency, fix, or evidence needed>
- **Owner / source:** <Who or what controls the unblocker>
- **Last confirmed truth:** <What is already confirmed and should not be re-investigated from scratch>

## Execution Lane Tracking (Required)
- **Local implementation branches:** `<repo>:<branch>`, `<repo>:<branch>`
- **Promotion lane path:** `<dev -> stage -> main>` or `<dev -> stage>`
- **Lane-promoted threshold for this TODO:** `<usually dev>`
- **Production-ready threshold for this TODO:** `<usually stage or main>`

## Promotion Evidence (Required Before `🟣 Lane-Promoted` / `✅ Production-Ready`)
| Scope Item | Local Branch/Commit | PR to lane threshold | PR to `stage` | PR to `main` | Current Status |
| --- | --- | --- | --- | --- | --- |
| `<item>` | `<branch@sha>` | `<url or pending>` | `<url or n/a>` | `<url or n/a>` | `<status>` |

## Out of Scope
- [ ] Criacao de novos endpoints backend.
- [ ] Refatoracoes visuais nao relacionadas a integracao de API.

## Bounded But Elastic Guardrails
- **May stay inside this TODO:** <local refinement, blocker resolution, or small concretization that stays within the same objective and approval conversation, even if secondary modules are touched in service of that slice>
- **Must update or split the TODO:** <new primary objective, new independently testable story slice, or new approval/risk conversation>

## Definition of Done
- [ ] Nenhum mock endpoint permanece nos fluxos cobertos pelo TODO.
- [ ] Fluxos de materia, aula, matricula e presenca usam APIs reais.
- [ ] Erros de integracao conhecidos foram documentados (se houver bloqueios de backend).

## Validation Steps
- [ ] Rodar build/lint do front e garantir que nao houve regressao de tipagem.
- [ ] Executar smoke manual dos fluxos que chamam `materia`, `aula`, `matricula` e `presenca`.
- [ ] Conferir no network/devtools que chamadas estao indo para `NFC_API`.

## External Dependency Readiness (Required When External Systems Matter)
- This section is non-blocking by default. Use it when the TODO depends on external systems whose health can change outside the repo (for example GitHub/`gh`, MCP servers, OAuth providers, third-party APIs/services, device lanes, or hosted infrastructure).
- Record or update the persistent register at `foundation_documentation/artifacts/dependency-readiness.md`.
- If any dependency is `degraded`, `failing`, `rate-limited`, or `stale`, reflect that in `Delivery Status`, `Assumptions Preview`, `Validation Steps`, `Questions To Close`, or blocker handling instead of pretending the dependency is healthy.

| Dependency | Why It Matters | Status (`unknown|healthy|degraded|failing|rate-limited|stale`) | Last Verified | Verification Method | Adjustment / Workaround |
| --- | --- | --- | --- | --- | --- |
| `<dependency>` | <why this TODO depends on it> | `<status>` | `<timestamp or n/a>` | `<command, probe, or manual check>` | <how execution/validation adapts> |

## Profile Scope & Handoffs (Required Before `APROVADO`)
- **Primary execution profile:** `<genesis-product-bootstrap|strategic-cto|operational-coder|operational-devops|assurance-tester-quality|assurance-security-adversarial>`
- **Primary execution profile:** `operational-coder`
- **Active technical scope:** `web`
- **Expected supporting profiles:** `none`
- **Scope-check command:** `python3 ../delphi-ai/tools/profile_scope_check.py --profile operational-coder`

### Handoff Log (Update when execution crosses profile boundaries)
| From Profile | To Profile | Why the Handoff Exists | Touched Surfaces | Status / Evidence |
| --- | --- | --- | --- | --- |
| `<from>` | `<to>` | <reason> | <paths/surfaces> | <planned|active|completed> |

- If `Operational / Coder` discovers that project-level constitutional rules or invariants must change, record a handoff to `Strategic / CTO-Tech-Lead` instead of editing `project_constitution.md` directly.
- `Genesis / Product-Bootstrap` may begin with a profile-scoped capped TODO via `templates/capped_todo_template.md` while discovery and foundation refinement remain explicitly no-code. This tactical template applies only after Genesis hands off to true implementation planning.

## Complexity
- **Level (`small|medium|big`):** <classification>
- **Level (`small|medium|big`):** `medium`
- **Checkpoint policy:** `one checkpoint`
- **Why this level:** afeta varios fluxos do front e depende de contrato com backend.

## Canonical Module Anchors (Required Before APROVADO)
- **Primary module doc:** `foundation_documentation/modules/<primary_module>.md`
- **Primary module doc:** `foundation_documentation/modules/nestjs-backend-architecture.md`
- **Secondary module docs (if any):**
  - `foundation_documentation/modules/auth-and-access-control.md`
  - `foundation_documentation/modules/presence-and-iot-flow.md`
- **Planned decision promotion targets (module sections):**
  - `Promotion Ledger`
- **Module decision consolidation targets (required):**
  - `Promotion Ledger`

## Decision Pending (Resolve Before Freeze)
- [ ] `D-01` <Pending contract decision, viable options, and module decision ref (or `No Prior Decision`)>

## Decisions (Resolved Before Freeze)
- [ ] `D-01` <Decision: chosen option + short rationale + module decision ref (or `No Prior Decision`)>

## Module Decision Baseline Snapshot (Required Before APROVADO)
- | Module Decision Ref | Current Module Decision | Planned Handling (`Preserve|Supersede (Intentional)|Out of Scope`) | Evidence |
- | --- | --- | --- | --- |
- | `<module#decision-id>` | <summary> | <handling> | <file:line/section> |

## Decision Baseline (Frozen Before Implementation)
- [ ] `D-01` <Expected outcome that implementation must adhere to>

## Questions To Close
- [ ] <Question that changes implementation>

## Assumptions Preview (Required Before Plan Review)
Assumptions here must be evidence-backed inferences from canonical modules, code, docs, tests, or repository state. They are not free guesses.

- Promote an assumption to `Decisions` before planning continues if it changes `Scope`, `Definition of Done`, `Validation Steps`, public contract, or module coherence.
- Promote an assumption to `Decisions` before planning continues if it changes `Scope`, `Definition of Done`, required validation semantics, public contract, or module coherence.
- Mark handling as `Block` when the assumption cannot be supported enough to plan safely.

| Assumption ID | Assumption | Evidence | If False | Confidence (`High|Medium|Low`) | Handling (`Keep as Assumption|Promote to Decision|Block`) |
| --- | --- | --- | --- | --- | --- |
| `A-01` | <assumption> | <module/code/doc/test evidence> | <impact if wrong> | <confidence> | <handling> |

## Execution Plan (Required Before `APROVADO`)
Execution planning describes **HOW** Delphi intends to deliver the TODO contract above. It must stay subordinate to the contract.

- If the plan reveals contract changes, update the TODO contract first and do not continue with stale planning notes.

### Touched Surfaces
- `<module/file/package/runtime surface>`

### Ordered Steps
1. <Concrete implementation step>

### Test Strategy
- **Strategy:** `<test-first|test-after|not-applicable>`
- **Why:** <reasoning>
- **Fail-first target(s) (when required):** <tests to fail first or rationale for non-applicability>

### Runtime / Rollout Notes
- `<migrations, feature flags, infra/runtime concerns, or n/a>`

## Plan Review Gate (Review of the Execution Plan; required for `medium|big`; abbreviated for low-risk `small`)
Review the `Assumptions Preview` and `Execution Plan` against architecture, code quality, tests, performance, security, elegance, and structural soundness before approval.
Treat brittle workarounds and structural shortcuts as explicit negative findings: ad hoc patches, layered patches over unresolved defects, contract bypasses, opportunistic duplication, hidden coupling, or other avoidable structural debt.

### Review Sections
- [ ] Architecture
- [ ] Code Quality
- [ ] Tests
- [ ] Performance
- [ ] Security
- [ ] Elegance
- [ ] Structural Soundness

### Issue Cards
- **Issue ID:** <e.g., ARCH-01>
  - **Severity:** <high|medium|low>
  - **Evidence:** <file:line or equivalent evidence>
  - **Why it matters now:** <impact summary>
  - **Option A (Recommended):** <description>
    - **Effort:** <low|medium|high>
    - **Risk:** <low|medium|high>
    - **Blast radius:** <local|module|cross-module>
    - **Maintenance burden:** <low|medium|high>
    - **Performance impact:** <improves|neutral|regresses|unknown>
    - **Elegance impact:** <improves|neutral|regresses|unknown>
    - **Structural soundness impact:** <improves|neutral|regresses|unknown>
  - **Option B (Alternative):** <description>
    - **Effort:** <low|medium|high>
    - **Risk:** <low|medium|high>
    - **Blast radius:** <local|module|cross-module>
    - **Maintenance burden:** <low|medium|high>
    - **Performance impact:** <improves|neutral|regresses|unknown>
    - **Elegance impact:** <improves|neutral|regresses|unknown>
    - **Structural soundness impact:** <improves|neutral|regresses|unknown>
  - **Option C (Do Nothing):** <description or explicit N/A with reason>
    - **Effort:** <low|medium|high>
    - **Risk:** <low|medium|high>
    - **Blast radius:** <local|module|cross-module>
    - **Maintenance burden:** <low|medium|high>
    - **Performance impact:** <improves|neutral|regresses|unknown>
    - **Elegance impact:** <improves|neutral|regresses|unknown>
    - **Structural soundness impact:** <improves|neutral|regresses|unknown>
  - **Recommendation:** <chosen option + rationale>

### Failure Modes & Edge Cases
- [ ] <Failure mode + mitigation>

### Residual Unknowns / Risks
- [ ] <Unknown, residual risk, or review note that still matters after plan review>

## Additional Architectural Opinions (Required When Path Remains Materially Unclear)
- **Needed:** `<yes|no>`
- **Why ambiguity remains:** <competing architectural paths, unresolved tradeoff, or `n/a`>
- **Opinion count:** `<0|1|2>`
- **Package mode:** `<bounded-file-set|bounded-summary>`
- **Subagent mandate (when available):** `<yes|no> (if yes, name the no-context subagent(s); if no, record constraint and proceed with bounded self-opinion)`
- **Required lenses:** `<correctness|performance|elegance|structural-soundness|operational-fit>`

| Reviewer | Recommendation | Performance view | Elegance view | Structural soundness view | Resolution | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `<reviewer/subagent>` | <recommended path> | <why> | <why> | <why it preserves or regresses structural soundness> | `<Integrated|Challenged|Deferred with rationale>` | <artifact/path/note> |

## Independent No-Context Critique Gate (Required for `big`; conditional for `medium/high-impact`)
- **Critique decision:** `<required|recommended|not_needed>`
- **Why this decision:** <complexity/impact rationale>
- **Impact signals in scope:** `<cross-module blast radius|public contract/schema/api|auth/payment|runtime/queue/realtime/ingress|intentional module supersede|high-severity issue card|none>`
- **Package mode:** `<bounded-file-set|bounded-summary>`
- **Package minimum contents:** `<frozen baseline|approved scope boundary|assumptions preview|execution plan summary|issue cards|residual risks|existing waivers/blockers>`
- **Critique isolation mode:** `<fresh no-context auxiliary reviewer>`
- **Subagent mandate (when available):** `<yes|no> (if yes, name the no-context subagent; if no, record constraint and proceed with bounded self-review)`
- **Canonical multi-lane audit protocol (when required):** `<audit-protocol-triple-review|n/a>`
- **Audit session / round evidence (when protocol used):** `<session.json path + round summary path|n/a>`
- **Critique lenses:** `<correctness|performance|elegance|structural-soundness|risk>`
- **Critique status:** `<not_run|running|no_material_findings|findings_integrated|blocked|waived>`
- **Findings summary:** <material findings summary or `none`>
- **Resolution ledger:** use the machine-checkable table below when findings exist
- | Finding ID | Resolution (`Integrated|Challenged|Deferred`) | Usefulness (`useful|noise|mixed|unknown`) | Formalizable (`yes|partial|no|unknown`) | Candidate Rule Level (`paced|project|none|unknown`) | Candidate Rule ID | Rationale / Evidence |
- | --- | --- | --- | --- | --- | --- | --- |
- | `<finding-id>` | `<Integrated|Challenged|Deferred>` | `<useful|noise|mixed|unknown>` | `<yes|partial|no|unknown>` | `<paced|project|none|unknown>` | `<rule-id|n/a>` | <why this resolution is correct> |
- **Evidence / reference:** <subagent output reference, artifact path, blocker note, or waiver note>
- **Waiver authority / reference (required if waived):** `<human approver id + approval reference>`

## Rules Acknowledgement / Ingestion (Required After `APROVADO` and Before Execution)
Complete this after the execution plan is approved and the touched surfaces are known.

- Load the rules/workflows that actually govern the touched surfaces.
- Run the profile scope check for the active execution profile and review any `review required` paths against the TODO handoff log.
- If ingestion reveals a material conflict with the approved plan, stop execution, update the plan/TODO, and request renewed approval before continuing.

| Source | Why It Applies Now | Must Preserve | Must Avoid | Execution Impact |
| --- | --- | --- | --- | --- |
| `<rule/workflow path>` | <why it applies> | <non-negotiable constraints> | <forbidden shortcuts/regressions> | <what changes in execution/validation> |

## Decision Adherence Validation (Mandatory Before Delivery)
- | Decision ID | Status (`Adherent`/`Exception`) | Evidence | Notes |
- | --- | --- | --- | --- |
- | `D-01` | <status> | <file:line/test/doc> | <notes> |

## Module Decision Consistency Validation (1-1 Mandatory Before Delivery)
- | Module Decision Ref | Planned Handling | Delivery Status (`Preserved|Superseded (Approved)|Regression`) | Evidence | Notes |
- | --- | --- | --- | --- | --- |
- | `<module#decision-id>` | <handling> | <status> | <file:line/test/doc> | <notes> |

### Exception Handling
- If any decision is `Exception`, delivery is blocked until:
  - the decision is explicitly challenged with rationale, or
  - a better alternative is proposed,
  and the updated decision/baseline receives renewed **APROVADO**.
- If any module decision is `Regression`, delivery is blocked until:
  - an intentional supersede decision is approved, and
  - canonical module consolidation targets are updated accordingly.

## Security Risk Assessment (Mandatory Before Delivery)
- **Risk level:** `<none|low|medium|high>`
- **Why this risk level:** <short rationale tied to touched surfaces and behavior>
- **Attack surface in scope:** <auth/public endpoints/trust boundaries/secrets/multi-tenant/payment/agents/prompt-ingestion/etc.>
- **Attack simulation decision:** `<required|recommended|not_needed>`
- **Review evidence:** `<security-adversarial-review artifact, stack-specific security evidence, or rationale for not running a deeper review>`
- **Residual security risk:** <known accepted risk, or `none`>

## Performance & Concurrency Risk Assessment (Mandatory Before Delivery)
- **Policy schema version:** `pcv-1`
- **Global sensitivity level:** `<none|low|medium|high>`
- **Why this level:** <short rationale tied to query path, runtime sensitivity, async UI, or concurrency pressure>
- **Current delivery stage at review time:** `<Pending|Local-Implemented|Lane-Promoted|Production-Ready>`

| Lane ID | Lane | Trigger Result | Trigger Severity | Trigger Reason Code | Gate Deadline | Minimum Evidence Rule | State | Residual Risk | Uncertainty Reason Code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `EPS` | `endpoint-performance-scrutiny` | `<required|recommended|not_needed>` | `<low|medium|high>` | `<EPS-EXACT-LOOKUP-SURFACE-CHANGED|EPS-QUERY-SHAPE-CHANGED|EPS-LIST-SEARCH-SEMANTICS-CHANGED|EPS-DATA-PATH-CHANGED>` | `<before_local_implemented>` | `<EPS-E1|EPS-E2>` | `<not_applicable|pending|running|blocked|passed|waived|expired|missed_gate>` | `<none|accepted risk>` | `<none|U-QUERY-PATH-UNKNOWN|U-EVIDENCE-EQUIVALENCE-CLAIM>` |
| `FRC` | `frontend-race-condition-validation` | `<required|recommended|not_needed>` | `<low|medium|high>` | `<FRC-DUPLICATE-MUTATION|FRC-STALE-RESPONSE|FRC-LIFECYCLE-ASYNC-EFFECT|FRC-RETRIGGERABLE-LIST|FRC-OPTIMISTIC-RECONCILE>` | `<before_local_implemented>` | `<FRC-POLICY|FRC-E1|FRC-E2|FRC-E3>` | `<not_applicable|pending|running|blocked|passed|waived|expired|missed_gate>` | `<none|accepted risk>` | `<none|U-ASYNC-SURFACE-UNKNOWN|U-EVIDENCE-EQUIVALENCE-CLAIM>` |
| `BCI` | `backend-concurrency-idempotency-validation` | `<required|recommended|not_needed>` | `<low|medium|high>` | `<BCI-NON-IDEMPOTENT-WRITE|BCI-IRREVERSIBLE-SIDE-EFFECT|BCI-LOST-UPDATE-RISK|BCI-DUPLICATE-SUBMIT-OR-REPLAY|BCI-JOB-WEBHOOK-API-OVERLAP|BCI-EXACT-ONCE-SEMANTICS>` | `<before_local_implemented>` | `<BCI-INV|BCI-POLICY|BCI-E1|BCI-E2|BCI-E3>` | `<not_applicable|pending|running|blocked|passed|waived|expired|missed_gate>` | `<none|accepted risk>` | `<none|U-WRITE-OVERLAP-UNKNOWN|U-EVIDENCE-EQUIVALENCE-CLAIM>` |
| `RLS` | `runtime-load-stress-validation` | `<required|recommended|not_needed>` | `<low|medium|high>` | `<RLS-SLO-CLAIM|RLS-QUEUE-WORKER-REALTIME-CHANGED|RLS-BATCH-OR-BULK-PATH-CHANGED|RLS-CACHE-INDEX-SENSITIVE-PATH-CHANGED>` | `<before_local_implemented|before_production_ready>` | `<RLS-E1|RLS-E2|RLS-E3>` | `<not_applicable|pending|running|blocked|passed|waived|expired|missed_gate>` | `<none|accepted risk>` | `<none|U-RUNTIME-PRESSURE-UNKNOWN|U-EVIDENCE-EQUIVALENCE-CLAIM>` |

### Lane Detail Packet Template
Repeat the block below once for each lane in matrix order (`EPS`, `FRC`, `BCI`, `RLS`).

#### `<Lane ID>`
- **Trigger rationale:** <why this lane received its trigger result and reason code>
- **Recorded at (UTC):** `<YYYY-MM-DDTHH:MM:SSZ>`
- **Executor ID:** `<executor-id>`
- **Evidence object:** `<required when state = running|passed>`
  - `evidence_type`: `<type>`
  - `environment_id`: `<environment>`
  - `run_id`: `<run-id>`
  - `artifact_uri`: `<foundation_documentation/artifacts/tmp/.../artifact.json>`
  - `artifact_schema_version`: `pcv-1`
  - `artifact_sha256`: `<sha256>`
  - `sample_profile_id`: `<profile-id>`
  - `acceptance_rule_id`: `<rule-id>`
  - `result_summary`: `<summary>`
  - `reviewer_id`: `<reviewer-id>`
- **Blocker object:** `<required when state = blocked>`
  - `blocker_reason_code`: `<code>`
  - `blocker_reason`: <why it is blocked>
  - `unblock_condition`: <what must happen>
  - `follow_up_task_id`: `<task-id>`
  - `follow_up_owner`: `<owner>`
- **Waiver object:** `<required when state = waived|expired>`
  - `waiver_reason_code`: `<code>`
  - `waiver_reason`: <why the waiver exists>
  - `waiver_expiry_utc`: `<YYYY-MM-DDTHH:MM:SSZ>`
  - `approver_id`: `<approver-id>`
  - `approval_reference`: `<approval reference>`
  - `follow_up_task_id`: `<task-id>`
  - `follow_up_owner`: `<owner>`
  - `mitigation_summary`: <mitigation>
  - `reviewer_id`: `<required for required-lane waivers; must differ from executor_id and approver_id>`
- **Classification change object:** `<required when trigger_result changed after APROVADO>`
  - `previous_trigger_result`: `<required|recommended>`
  - `new_trigger_result`: `<required|recommended>`
  - `classification_changed_by`: `<actor-id>`
  - `classification_changed_at_utc`: `<YYYY-MM-DDTHH:MM:SSZ>`
  - `classification_change_reason`: <why the lane changed>
  - `approval_reference`: `<renewed approval reference when obligation was reduced>`

Use `templates/performance_concurrency_lane_artifact_template.json` for machine-checkable lane artifacts. `recommended` lanes must still resolve by their gate deadline; only `trigger_result = not_needed` may use `state = not_applicable`.

## Verification Debt Assessment (Required Before `Completed`; mandatory audit for `medium|big` or when debt signals exist)
- **Audit outcome:** `<none|low|medium|high>`
- **Why this outcome:** <brief rationale>
- **Inline code TODO debt:** `<none|accepted|cleanup-required>`
- **Evidence / audit artifact:** `<verification-debt-audit artifact, grep output, or rationale for not running a full audit>`
- **Accepted residual debt:** <what remains and why it is accepted, or `none`>

## Independent Test Quality Audit Gate (Required When Tests Changed Or Test Confidence Is Material)
- **Audit decision:** `<required|recommended|not_needed>`
- **Why this decision:** <complexity/impact rationale>
- **Trigger signals in scope:** `<changed test logic|bugfix/regression|behavior-defining change|architectural change|shared contract/api/schema|compatibility|critical-user-journey|non-trivial validation risk|none>`
- **Required evidence matrix (when architectural):** `<unit|widget|integration|web real-backend|mobile real-backend|n/a>`
- **Package mode:** `<bounded-file-set|bounded-summary>`
- **Package minimum contents:** `<frozen baseline|approved scope boundary|bounded implementation diff|bounded test diff|validation evidence|expected behaviors/DoD|residual risks>`
- **Canonical method:** `wf-docker-independent-test-quality-audit-method`
- **Audit isolation mode:** `<fresh no-context auxiliary reviewer>`
- **Subagent mandate (when available):** `<yes|no> (if yes, name the no-context subagent; if no, record constraint and proceed with bounded self-review)`
- **Gate-satisfying evidence expectation:** `<full applicable test-quality-audit outputs|required external no-context audit for required gate|self-review is supporting-only when no subagent is available>`
- **Audit focus:** `<product/test delta alignment|fail-first alignment|bypass detection|assertion efficacy|assertion efficiency|coverage sufficiency|brittle test-only shortcuts>`
- **Required applicable evidence:** `<audit framing|fail-first/TDD alignment when relevant|bypass scan|real-backend/fallback/DI/CI/platform checks when applicable|issue cards for material findings|failure modes/uncertainty|decision-adherence evidence when applicable|explicit answers to core audit questions>`
- **Audit status:** `<not_run|running|no_material_findings|findings_integrated|blocked|waived>`
- **Findings summary:** <material findings summary or `none`>
- **Resolution ledger:** use the machine-checkable table below when findings exist
- | Finding ID | Resolution (`Integrated|Challenged|Deferred`) | Usefulness (`useful|noise|mixed|unknown`) | Formalizable (`yes|partial|no|unknown`) | Candidate Rule Level (`paced|project|none|unknown`) | Candidate Rule ID | Rationale / Evidence |
- | --- | --- | --- | --- | --- | --- | --- |
- | `<finding-id>` | `<Integrated|Challenged|Deferred>` | `<useful|noise|mixed|unknown>` | `<yes|partial|no|unknown>` | `<paced|project|none|unknown>` | `<rule-id|n/a>` | <why this resolution is correct> |
- **Evidence / reference:** <subagent output reference, artifact path, blocker note, or waiver note>
- **Waiver authority / reference (required if waived):** `<human approver id + approval reference>`

## Independent No-Context Final Review Gate (Required for `big`; conditional for `medium/high-impact`)
- **Final review decision:** `<required|recommended|not_needed>`
- **Why this decision:** <complexity/impact rationale>
- **Impact signals in scope:** `<cross-module blast radius|public contract/schema/api|auth/payment|runtime/queue/realtime/ingress|intentional module supersede|high-severity issue card|none>`
- **Package mode:** `<bounded-file-set|bounded-summary>`
- **Package minimum contents:** `<frozen baseline|approved scope boundary|bounded touched-surface/diff summary|adherence status|validation evidence index|test-quality-audit evidence from wf-docker-independent-test-quality-audit-method|residual risks|existing waivers|verification debt>`
- **Review isolation mode:** `<fresh no-context auxiliary reviewer>`
- **Subagent mandate (when available):** `<yes|no> (if yes, name the no-context subagent; if no, record constraint and proceed with bounded self-review)`
- **Canonical multi-lane audit protocol (when required):** `<audit-protocol-triple-review|n/a>`
- **Audit session / round evidence (when protocol used):** `<session.json path + round summary path|n/a>`
- **Review focus:** `<adherence|regressions|validation evidence|test-audit evidence|security/performance residuals|elegance residuals|structural regressions|verification debt>`
- **Final review status:** `<not_run|running|no_material_findings|findings_integrated|blocked|waived>`
- **Findings summary:** <material findings summary or `none`>
- **Resolution ledger:** use the machine-checkable table below when findings exist
- | Finding ID | Resolution (`Integrated|Challenged|Deferred`) | Usefulness (`useful|noise|mixed|unknown`) | Formalizable (`yes|partial|no|unknown`) | Candidate Rule Level (`paced|project|none|unknown`) | Candidate Rule ID | Rationale / Evidence |
- | --- | --- | --- | --- | --- | --- | --- |
- | `<finding-id>` | `<Integrated|Challenged|Deferred>` | `<useful|noise|mixed|unknown>` | `<yes|partial|no|unknown>` | `<paced|project|none|unknown>` | `<rule-id|n/a>` | <why this resolution is correct> |
- **Evidence / reference:** <subagent output reference, artifact path, blocker note, or waiver note>
- **Waiver authority / reference (required if waived):** `<human approver id + approval reference>`

## Delivery Confidence Gate (Required for `✅ Production-Ready`)
- [ ] **Lane promotion evidence complete:** local commits and required PR merges recorded in `Promotion Evidence`.
- [ ] **Runtime impact classified:** <none | low | medium | high>
- [ ] **Every `pcv-1` lane with `Gate Deadline = before_production_ready` is gate-satisfying:** `<yes|no>`
- [ ] **Any waived `pcv-1` lane still carried into production-ready has owner, expiry, mitigation, and follow-up recorded:** `<yes|no>`
- [ ] **Operational checks run (if runtime-impacting):**
  - [ ] migration/index status checked
  - [ ] queue/scheduler/worker health checked
  - [ ] smoke flow executed in the best available environment (or justified as N/A)
- [ ] **Lane artifacts recorded and hashed:** `foundation_documentation/artifacts/tmp/<run-id>/...`
- [ ] **Confidence stated:** <high|medium|low> + <known residual risks>
- [ ] **Release readiness outcome:** <ready|ready_with_waiver|not_ready>

## Module Consolidation Gate (Required Before `Completed`)
- [ ] Canonical module docs were updated with stable conceptual outcomes and final decisions from this TODO.
- [ ] Decision promotion ledger (or equivalent trace table) in module docs links back to this TODO.
- [ ] Every relevant prior module decision is either preserved or intentionally superseded with explicit traceability.
- [ ] Superseded/conflicting tactical notes were removed or replaced by canonical module references.
- [ ] TODO/module cross-links were updated (including active/completed path changes).

## Commands (Run Locally)
- `fvm flutter analyze`
- <Any manual steps>

## Files Expected (Optional)
- `<path>`

## COMENTÁRIO:
- <Contextual question about the section below>

<Section the comment refers to>
