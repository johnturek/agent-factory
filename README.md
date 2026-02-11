# Agent Factory

**Agent-as-Code for Microsoft Copilot Studio**

Define, version, and deploy Copilot Studio agents using simple YAML specifications.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Agent Spec    │────▶│  Agent Factory  │────▶│ Copilot Studio  │
│   (YAML)        │     │   (Generator)   │     │   (Deployed)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Why Agent-as-Code?

Building agents through the Copilot Studio UI is fine for prototypes, but doesn't scale:

| UI Approach | Agent-as-Code |
|-------------|---------------|
| Click-and-configure | Write YAML specs |
| Manual deployments | Automated CI/CD |
| No version history | Full Git history |
| Copy-paste patterns | Reusable templates |
| Environment-specific | Portable across tenants |

## Quick Start

### 1. Define Your Agent

```yaml
# specs/helpdesk-agent.yaml
apiVersion: agent-factory/v1
kind: AgentSpec

name: IT Help Desk Agent
description: Handles common IT support requests

instructions: |
  You are an IT Help Desk agent.
  Help users with password resets, software requests, and common issues.
  Always verify identity before making changes.

greeting: "Hello! I'm your IT Help Desk assistant. How can I help?"

topics:
  - name: Password Reset
    triggers:
      phrases:
        - "reset password"
        - "forgot password"
        - "can't log in"
    actions:
      - type: question
        prompt: "Which system do you need help with?"
        variable: TargetSystem
      - type: generative_answer
```

### 2. Generate Template

```bash
npx af generate specs/helpdesk-agent.yaml
```

### 3. Deploy to Copilot Studio

```bash
pac copilot create \
  --schemaName "af_ITHelpDeskAgent" \
  --displayName "IT Help Desk Agent" \
  --templateFileName templates/helpdesk-agent-template.yaml \
  --solution "AgentFactory"
```

**Done!** Your agent is live in Copilot Studio.

## Installation

```bash
# Clone the repo
git clone https://github.com/johnturek/agent-factory.git
cd agent-factory

# Install dependencies
npm install

# Install PAC CLI (Power Platform CLI)
dotnet tool install --global Microsoft.PowerApps.CLI.Tool

# Authenticate to your environment
pac auth create --deviceCode
```

## Documentation

| Document | Description |
|----------|-------------|
| [Overview](docs/overview.md) | What Agent Factory is and why |
| [Architecture](docs/architecture.md) | How it works under the hood |
| [Getting Started](docs/getting-started.md) | Step-by-step setup guide |
| [Agent Spec Reference](docs/agent-spec-reference.md) | Complete YAML specification |
| [CLI Reference](docs/cli-reference.md) | Command-line interface |
| [Deployment Guide](docs/deployment-guide.md) | CI/CD and multi-environment |
| [GCC Guide](docs/gcc-guide.md) | Government cloud deployment |

## Features

### ✅ Declarative YAML Specs

Define agents in version-controlled, human-readable YAML.

### ✅ Automatic Template Generation

Transforms your simple spec into Copilot Studio's native format.

### ✅ CLI Tools

Validate, generate, deploy, test, and package from the command line.

### ✅ CI/CD Ready

GitHub Actions and Azure DevOps examples included.

### ✅ Government Cloud Support

Works with Commercial, GCC, GCC-High, and DoD environments.

### ✅ Solution Packaging

Export as Power Platform Solutions for customer delivery.

## CLI Commands

```bash
# Validate agent specs
npx af validate specs/agent.yaml

# Generate Copilot Studio templates
npx af generate specs/agent.yaml

# Initialize new agent spec
npx af init "My Agent" --template helpdesk

# Deploy to environment (coming soon)
npx af deploy templates/agent.yaml --env test
```

## Example Agents

See [specs/examples/](specs/examples/) for complete examples:

- **Contract Review Agent** — Reviews federal contracts and FAR clauses
- **IT Help Desk Agent** — Handles common IT support requests
- **HR Assistant** — Answers HR policy questions

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
│   JSON Schema    Copilot Studio   PAC CLI       Conversation          │
│   Validation     YAML Template    Dataverse        Tests               │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

1. **VALIDATE** — Check your spec against the schema
2. **GENERATE** — Transform to Copilot Studio format
3. **DEPLOY** — Push to Power Platform via PAC CLI
4. **TEST** — Run automated conversation tests

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with 🤖 by [John Turek](https://github.com/johnturek) and the CSA team.
