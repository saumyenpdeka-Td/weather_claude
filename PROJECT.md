# PROJECT.md — Host-Project Configuration

```yaml
# === Project identity ===
project_name: weather-app
project_owner: saumyen.p.deka@triedatum.com
repo_url:                      # TBD — repo not yet created

# === Ticket system (see tdm-aisdlc-shared/.claude/rules/ticketing.md) ===
ticket_system: plane         # jira | github | linear | azure-devops | plane | none
ticket_prefix: WEATHER
ticket_mcp: mcp__plane

# === Plane-specific config (only when ticket_system: plane) ===
# Non-secret connection details only — API key stays in PLANE_API_KEY env
# var (see secrets.md). Connectivity restored 2026-07-27: the root cause was
# a version mismatch between plane-mcp-server >=v0.2.10 (which switched
# list_projects/get_workspace_members/etc. to a lightweight cursor-paginated
# endpoint) and this self-hosted Plane instance (APP_RELEASE v1.3.1), which
# 404s on that endpoint. Workaround: infra/plane/.env pins
# APP_RELEASE_VERSION=v0.2.9 for plane-mcp-server. This trades away
# everything added in v0.2.9->v0.2.11 (customer/release-management tools,
# role tools, work item relations) — revisit if those are needed, either by
# upgrading self-hosted Plane to a version with the new endpoint or by
# tracking upstream plane-mcp-server for a fix.
plane:
  workspace_slug: my-workspace-extra
  project_id: e4ddcfec-1ddb-4799-b8ec-c768d6d3eae6      # "Weather App" / WEATHER
  master_work_item_id: 3fb37b12-8c7b-43a3-9cdb-f9bf53ada95d  # WEATHER-1, Feature parent

# === Workflow state names (canonical → your tool's vocabulary) ===
workflow_states:
  Backlog: Backlog
  Ready for Dev: Ready for Dev
  In Progress: In Progress
  In Review: In Review
  Bug Open: Bug Open
  Needs Info: Needs Info
  Done: Done

# === Source control ===
default_branch: main
protected_branches: [main]
pr_template:

# === Languages in scope ===
languages:
  - react
  - node

# === Per-language overrides ===
react:
  hooks_dir: src/hooks
  test_framework: vitest
node:
  test_framework: vitest
  package_manager: npm

# === Standards & quality ===
component_size_ceiling: 100
component_size_target: 50
coverage_target: 85

# === Tooling commands (the blessed entrypoints; agents must use these) ===
lint_command: npm run lint
format_command: npm run format
test_command: npm run test:coverage
security_scan_command:         # TBD — set when Security Scanner agent onboards this project

# === Environments / connectivity ===
environments: []               # no cloud/data-platform connectivity needed for MVP

# === Secrets layer (see tdm-aisdlc-shared/.claude/rules/secrets.md) ===
secrets_layer: env-file        # Weather Provider API key only secret in scope

# === MCP servers wired into this project's workspace ===
mcp_servers:
  required:
    - mcp__plane                # see connectivity note above — currently degraded
    - mcp__github
  optional: []

# === Solution Architect outputs (used by ea-alignment.md) ===
design_docs_root: docs/design
adr_root: docs/adr

# === Human-in-the-loop overrides ===
human_review:
  every_pr: true
  exempt_for_bug_fix: false
```

## Free-form sections

### Architecture notes

Brand-new project — no code exists yet. Requirement: a simple weather app
that fetches real-time current-conditions weather data for locations
worldwide. Choice of Weather Provider API, frontend/backend split, and
hosting are Solution Architect decisions, not fixed here.

### What this framework should NOT touch

- None yet — no legacy code or frozen areas in a brand-new project.

### Contact points

- Product owner: saumyen.p.deka@triedatum.com (requirement source for this
  Analyst session).
