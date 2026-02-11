# Getting Started

Get Agent Factory up and running in 10 minutes.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** — [Download](https://nodejs.org/)
- **.NET 6.0+ SDK** — [Download](https://dotnet.microsoft.com/download)
- **Power Platform access** — An environment where you can create Copilots
- **Admin permissions** — To deploy agents and create solutions

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/johnturek/agent-factory.git
cd agent-factory
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install PAC CLI

The Power Platform CLI is required for deployment:

```bash
# Install as .NET global tool
dotnet tool install --global Microsoft.PowerApps.CLI.Tool

# Verify installation
pac --version
```

### 4. Authenticate to Power Platform

```bash
# Interactive authentication (opens browser)
pac auth create --deviceCode
```

Follow the prompts to sign in with your Microsoft account.

## Quick Start

### Step 1: Create Your First Agent Spec

Create a file `specs/my-first-agent.yaml`:

```yaml
apiVersion: agent-factory/v1
kind: AgentSpec

name: My First Agent
description: A simple demo agent

instructions: |
  You are a helpful assistant.
  Be friendly and concise in your responses.
  If you don't know something, say so.

greeting: "Hello! I'm here to help. What can I do for you today?"

topics:
  - name: About Me
    description: Explains what this agent does
    triggers:
      phrases:
        - "what can you do"
        - "help"
        - "what are you"
    actions:
      - type: message
        text: "I'm a demo agent created with Agent Factory! I can answer your questions and have a friendly conversation."
```

### Step 2: Validate the Spec

```bash
npx af validate specs/my-first-agent.yaml
```

Expected output:
```
🔍 Validating specs...
  ✅ specs/my-first-agent.yaml
```

### Step 3: Generate Copilot Studio Template

```bash
npx af generate specs/my-first-agent.yaml -o templates/
```

Expected output:
```
⚙️  Generating templates...
  ✅ specs/my-first-agent.yaml → templates/my-first-agent-template.yaml
```

### Step 4: Create a Solution (First Time Only)

Agents must be deployed into a Power Platform Solution:

```bash
# Initialize solution project
cd solutions
pac solution init --publisher-name "AgentFactoryPub" --publisher-prefix "af"

# Pack and import the empty solution
pac solution pack --zipfile AgentFactory.zip -f src
pac solution import --path AgentFactory.zip
```

### Step 5: Deploy to Copilot Studio

```bash
pac copilot create \
  --schemaName "af_MyFirstAgent" \
  --displayName "My First Agent" \
  --templateFileName templates/my-first-agent-template.yaml \
  --solution "solutions"
```

Expected output:
```
Connected as your-email@domain.com
Loaded 9 components for bot 'My First Agent' with id xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Bot created successfully: https://web.powerva.microsoft.com/environments/.../bots/...
```

### Step 6: Test Your Agent

1. Click the URL from the output to open Copilot Studio
2. Click **Test** in the bottom-left corner
3. Say "hello" and watch your agent respond!

## Verify Deployment

List all agents in your environment:

```bash
pac copilot list
```

```
Name            Bot ID                               Status
My First Agent  xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx Active
```

## Project Structure

After setup, your project should look like:

```
agent-factory/
├── specs/
│   ├── examples/
│   │   └── contract-review-agent.yaml
│   └── my-first-agent.yaml          # Your agent spec
├── templates/
│   └── my-first-agent-template.yaml  # Generated template
├── solutions/
│   ├── src/
│   │   └── Other/
│   │       ├── Solution.xml
│   │       └── Customizations.xml
│   └── AgentFactory.zip             # Packaged solution
└── ...
```

## Workflow Summary

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Write     │────▶│  Validate   │────▶│  Generate   │────▶│   Deploy    │
│   YAML      │     │   af val    │     │   af gen    │     │  pac create │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

## Common Commands

| Task | Command |
|------|---------|
| Validate spec | `npx af validate specs/agent.yaml` |
| Generate template | `npx af generate specs/agent.yaml` |
| List solutions | `pac solution list` |
| List copilots | `pac copilot list` |
| Deploy copilot | `pac copilot create --templateFileName ... --solution ...` |
| Switch environment | `pac org select --environment <name>` |

## Troubleshooting

### "No auth profile found"

Run `pac auth create --deviceCode` to authenticate.

### "Solution not found"

Create and import the solution first (Step 4).

### "Invalid schema name prefix"

Schema names must start with your publisher prefix (e.g., `af_`). The generator handles this automatically.

### "Entity with schemaName already exists"

An agent with that schema name already exists. Either:
- Delete the existing agent: `pac copilot delete --bot <bot-id>`
- Use a different schema name

## Next Steps

- [Agent Spec Reference](./agent-spec-reference.md) — Full YAML specification
- [CLI Reference](./cli-reference.md) — All CLI commands
- [Deployment Guide](./deployment-guide.md) — Advanced deployment scenarios
- [GCC Guide](./gcc-guide.md) — Government cloud deployment
