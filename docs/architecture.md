# Architecture

This document explains how Agent Factory works under the hood.

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DEVELOPMENT                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│  │   YAML      │    │   Agent     │    │    Git      │                     │
│  │   Specs     │◀──▶│  Factory    │◀──▶│   Repo      │                     │
│  │             │    │   CLI       │    │             │                     │
│  └─────────────┘    └──────┬──────┘    └─────────────┘                     │
│                            │                                                 │
└────────────────────────────┼─────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CI/CD PIPELINE                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│  │  Validate   │───▶│  Generate   │───▶│   Deploy    │                     │
│  │  (Schema)   │    │ (Template)  │    │  (PAC CLI)  │                     │
│  └─────────────┘    └─────────────┘    └──────┬──────┘                     │
│                                               │                             │
└───────────────────────────────────────────────┼─────────────────────────────┘
                                                │
                    ┌───────────────────────────┴───────────────────────────┐
                    │                           │                           │
                    ▼                           ▼                           ▼
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│      DEVELOPMENT        │  │        STAGING          │  │      PRODUCTION         │
│  ┌───────────────────┐  │  │  ┌───────────────────┐  │  │  ┌───────────────────┐  │
│  │  Power Platform   │  │  │  │  Power Platform   │  │  │  │  Power Platform   │  │
│  │  Environment      │  │  │  │  Environment      │  │  │  │  Environment      │  │
│  │                   │  │  │  │                   │  │  │  │                   │  │
│  │  ┌─────────────┐  │  │  │  │  ┌─────────────┐  │  │  │  │  ┌─────────────┐  │  │
│  │  │  Copilot    │  │  │  │  │  │  Copilot    │  │  │  │  │  │  Copilot    │  │  │
│  │  │  Studio     │  │  │  │  │  │  Studio     │  │  │  │  │  │  Studio     │  │  │
│  │  │  Agent      │  │  │  │  │  │  Agent      │  │  │  │  │  │  Agent      │  │  │
│  │  └─────────────┘  │  │  │  │  └─────────────┘  │  │  │  │  └─────────────┘  │  │
│  └───────────────────┘  │  │  └───────────────────┘  │  │  └───────────────────┘  │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
        Commercial                   GCC                        GCC-High
```

## Core Components

### 1. Agent Spec (YAML)

The source of truth for your agent. Written in a human-readable format that's easy to understand and version control.

```yaml
# specs/contract-review-agent.yaml
apiVersion: agent-factory/v1
kind: AgentSpec

name: Contract Review Agent
description: Reviews federal contracts and FAR clauses

instructions: |
  You are a contract review specialist...

topics:
  - name: Contract Summary
    triggers:
      phrases: ["summarize", "overview"]
    actions:
      - type: generative_answer
```

### 2. Generator

Transforms the Agent Spec into Copilot Studio's native YAML format. This is the bridge between our simplified spec and Microsoft's internal format.

```
┌─────────────────┐                    ┌─────────────────┐
│   Agent Spec    │                    │ Copilot Studio  │
│                 │                    │    Template     │
│  - name         │                    │                 │
│  - instructions │       ┌────┐       │  - kind: Bot... │
│  - topics[]     │──────▶│ GEN│──────▶│  - entity:      │
│  - actions[]    │       └────┘       │  - components[] │
│                 │                    │                 │
└─────────────────┘                    └─────────────────┘
     Simple                                 Complex
   (~50 lines)                           (~500 lines)
```

**Key transformations:**

| Agent Spec | Copilot Studio Template |
|------------|------------------------|
| `name` | `entity.displayName` + `entity.schemaName` |
| `instructions` | `LegacyOrUnknownComponent` (componentTypeInt: 15) |
| `topics[]` | `DialogComponent` with `OnRecognizedIntent` |
| `greeting` | `topic.ConversationStart` SendActivity |
| `actions[]` | Action nodes (Question, SendActivity, etc.) |

### 3. PAC CLI (Power Platform CLI)

Microsoft's official CLI for Power Platform operations. Agent Factory uses it for deployment.

```bash
# Authenticate to tenant
pac auth create --deviceCode

# Deploy agent
pac copilot create \
  --schemaName "af_ContractReviewAgent" \
  --displayName "Contract Review Agent" \
  --templateFileName template.yaml \
  --solution "AgentFactory"
```

### 4. Power Platform Solution

Agents are deployed into Power Platform Solutions, which provide:
- Packaging for distribution
- Environment migration
- Managed/unmanaged deployment options
- Component versioning

## Data Flow

### Spec → Template Generation

```
┌─────────────────────────────────────────────────────────────────┐
│                    GENERATE PIPELINE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐  │
│  │  Parse  │────▶│ Validate│────▶│Transform│────▶│ Output  │  │
│  │  YAML   │     │ Schema  │     │  Spec   │     │ Template│  │
│  └─────────┘     └─────────┘     └─────────┘     └─────────┘  │
│                                                                 │
│  Input:          JSON Schema     Mapping           Output:      │
│  agent-spec.yaml validation      logic             template.yaml│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Step by step:**

1. **Parse** — Load YAML spec into JavaScript object
2. **Validate** — Check against JSON Schema for required fields
3. **Transform** — Apply mapping rules to generate Copilot Studio format
4. **Output** — Write YAML template file

### Template → Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOY PIPELINE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐  │
│  │  Load   │────▶│  Auth   │────▶│ Create  │────▶│ Verify  │  │
│  │Template │     │ PAC CLI │     │   Bot   │     │ Deploy  │  │
│  └─────────┘     └─────────┘     └─────────┘     └─────────┘  │
│                                                                 │
│  template.yaml   Device code     Dataverse       Bot ID +      │
│                  or cached       API calls       Status URL    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Step by step:**

1. **Load** — Read generated template YAML
2. **Auth** — Verify PAC CLI authentication to target environment
3. **Create** — Call `pac copilot create` to push to Dataverse
4. **Verify** — Confirm deployment and return Copilot Studio URL

## Component Mapping

### Topics

```yaml
# Agent Spec                         # Copilot Studio Template
topics:                              components:
  - name: Password Reset             - kind: DialogComponent
    description: Helps reset         displayName: Password Reset
    triggers:                          description: Helps reset
      phrases:                         dialog:
        - "reset password"               beginDialog:
        - "forgot password"                kind: OnRecognizedIntent
    actions:                               intent:
      - type: message                        triggerQueries:
        text: "I can help!"                    - "reset password"
                                               - "forgot password"
                                           actions:
                                             - kind: SendActivity
                                               activity: "I can help!"
```

### Actions

| Agent Spec Action | Copilot Studio Action |
|-------------------|----------------------|
| `type: message` | `kind: SendActivity` |
| `type: question` | `kind: Question` |
| `type: condition` | `kind: ConditionGroup` |
| `type: set_variable` | `kind: SetVariable` |
| `type: call_topic` | `kind: BeginDialog` |
| `type: generative_answer` | `kind: SearchAndSummarizeContent` |
| `type: end_conversation` | `kind: EndConversation` |
| `type: escalate` | `kind: BeginDialog` (to Escalate topic) |

### GPT Instructions

```yaml
# Agent Spec                         # Copilot Studio Template
instructions: |                      components:
  You are a helpful                    - kind: LegacyOrUnknownComponent
  assistant that...                      componentTypeInt: 15
                                         data: |
                                           kind: GptComponentMetadata
                                           instructions: |
                                             You are a helpful
                                             assistant that...
```

## File Structure

```
agent-factory/
├── cli/
│   └── index.js              # CLI entry point (af command)
├── lib/
│   ├── generate.js           # Spec → Template generator
│   ├── validate.js           # Schema validation
│   ├── deploy.js             # PAC CLI wrapper
│   ├── test.js               # Conversation testing
│   └── package.js            # Solution packaging
├── docs/
│   ├── README.md             # Documentation index
│   ├── overview.md           # This file
│   ├── architecture.md       # System architecture
│   └── agent-spec-reference.md # YAML specification
├── specs/
│   └── examples/
│       └── contract-review-agent.yaml
├── templates/                 # Generated templates (output)
├── solutions/                 # Power Platform solution project
└── package.json
```

## Technology Stack

| Component | Technology |
|-----------|------------|
| CLI | Node.js + Commander.js |
| YAML Parsing | js-yaml |
| Schema Validation | Ajv (JSON Schema) |
| Deployment | PAC CLI (.NET) |
| Runtime | Power Platform / Dataverse |

## Security Considerations

### Authentication

- PAC CLI uses Azure AD / Entra ID authentication
- Supports device code flow for interactive auth
- Supports service principal for CI/CD automation

### Secrets Management

- No secrets stored in agent specs
- Connection references resolved at runtime
- Environment-specific configuration via Power Platform

### Access Control

- Agents deployed with `ChatbotReaders` access policy
- Solution-level security for component access
- Environment-level RBAC for deployment permissions

## Next Steps

- [Getting Started](./getting-started.md) — Set up your environment
- [Agent Spec Reference](./agent-spec-reference.md) — Full YAML specification
- [CLI Reference](./cli-reference.md) — Command documentation
