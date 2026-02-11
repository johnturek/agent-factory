# Overview

## What is Agent Factory?

Agent Factory is an **Agent-as-Code** platform that enables teams to define, version, and deploy Microsoft Copilot Studio agents using simple YAML specifications.

Instead of clicking through the Copilot Studio UI, you write a declarative YAML file that describes your agent — its personality, topics, actions, and integrations. Agent Factory transforms this into the native Copilot Studio format and deploys it directly to your Power Platform environment.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Agent Spec    │────▶│  Agent Factory  │────▶│ Copilot Studio  │
│   (YAML)        │     │   (Generator)   │     │   (Deployed)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Why Agent-as-Code?

### The Problem

Building agents in Copilot Studio through the UI works fine for prototypes, but presents challenges at scale:

- **No version control** — Changes aren't tracked, can't be reviewed, can't be rolled back
- **No CI/CD** — Manual deployment to each environment (dev, test, prod)
- **Inconsistent quality** — Each agent built differently depending on who built it
- **Hard to replicate** — Moving agents between tenants requires manual recreation
- **No templates** — Starting from scratch every time

### The Solution

Agent Factory brings software engineering practices to agent development:

| Traditional UI Approach | Agent-as-Code |
|------------------------|---------------|
| Click-and-configure | Write YAML specs |
| Manual deployments | Automated CI/CD |
| No history | Full Git history |
| Copy-paste patterns | Reusable templates |
| Environment-specific | Portable across tenants |

## Key Features

### 🎯 Declarative Agent Definitions

Define your agent in human-readable YAML:

```yaml
name: IT Help Desk Agent
description: Handles common IT support requests

instructions: |
  You are a friendly IT support agent. Help users with:
  - Password resets
  - Software installation requests  
  - Hardware issues
  
  Always verify the user's identity before making changes.

greeting: "Hi! I'm your IT Help Desk assistant. How can I help?"

topics:
  - name: Password Reset
    triggers:
      phrases:
        - "reset my password"
        - "forgot password"
        - "can't log in"
    actions:
      - type: question
        prompt: "What system do you need password help with?"
        variable: TargetSystem
      - type: generative_answer
```

### 🔄 Version Control & Collaboration

- Store agent specs in Git
- Review changes via pull requests
- Track who changed what and when
- Roll back to any previous version

### 🚀 Automated Deployment

```bash
# Validate the spec
af validate specs/it-helpdesk.yaml

# Generate Copilot Studio template
af generate specs/it-helpdesk.yaml

# Deploy to environment
af deploy templates/it-helpdesk-template.yaml --env test
```

### 📦 Portable Packaging

Export agents as Power Platform Solutions for:
- Customer delivery
- Environment migration
- Managed solution distribution

### 🏛️ Government Cloud Ready

Built with federal customers in mind:
- Commercial cloud support
- GCC (Government Community Cloud)
- GCC-High
- DoD

## Who Is This For?

### Cloud Solution Architects (CSAs)

- Define reference architectures as code
- Build reusable agent templates
- Ensure consistent patterns across customer deployments

### DevOps Teams

- Integrate agent deployment into CI/CD pipelines
- Automate testing and validation
- Manage agents across multiple environments

### Partners & ISVs

- Build agent solutions as products
- Package for Marketplace distribution
- Deliver consistent solutions to customers

## How It Works

```
┌────────────────────────────────────────────────────────────────────────┐
│                           AGENT FACTORY                                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│  │          │    │          │    │          │    │          │         │
│  │ VALIDATE │───▶│ GENERATE │───▶│  DEPLOY  │───▶│   TEST   │         │
│  │          │    │          │    │          │    │          │         │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘         │
│       │              │               │               │                 │
│       ▼              ▼               ▼               ▼                 │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │  Schema  │  │ Copilot   │  │   Power   │  │Conversation│           │
│  │Validation│  │ Studio    │  │ Platform  │  │   Tests    │           │
│  │          │  │ Template  │  │    API    │  │            │           │
│  └──────────┘  └───────────┘  └───────────┘  └───────────┘           │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

1. **VALIDATE** — Check your agent spec against the schema
2. **GENERATE** — Transform to Copilot Studio native format
3. **DEPLOY** — Push to Power Platform via PAC CLI
4. **TEST** — Run automated conversation tests

## Next Steps

- [Getting Started](./getting-started.md) — Set up Agent Factory
- [Architecture](./architecture.md) — Deep dive into how it works
- [Agent Spec Reference](./agent-spec-reference.md) — Complete YAML specification
