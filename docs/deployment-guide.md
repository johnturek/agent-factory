# Deployment Guide

This guide covers deploying agents to different environments and scenarios.

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEPLOYMENT FLOW                                    │
│                                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────────────────┐  │
│  │              │      │              │      │    POWER PLATFORM         │  │
│  │  Generated   │─────▶│   PAC CLI    │─────▶│                          │  │
│  │  Template    │      │              │      │  ┌────────────────────┐  │  │
│  │  (YAML)      │      │  - auth      │      │  │     SOLUTION       │  │  │
│  │              │      │  - create    │      │  │                    │  │  │
│  └──────────────┘      │  - sync      │      │  │  ┌──────────────┐  │  │  │
│                        └──────────────┘      │  │  │   COPILOT    │  │  │  │
│                                              │  │  │   STUDIO     │  │  │  │
│                                              │  │  │   AGENT      │  │  │  │
│                                              │  │  └──────────────┘  │  │  │
│                                              │  │                    │  │  │
│                                              │  └────────────────────┘  │  │
│                                              │                          │  │
│                                              └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Authentication

### Interactive (Device Code)

Best for development and manual deployments:

```bash
# Create new auth profile
pac auth create --deviceCode

# Follow the prompts to sign in via browser
```

### Service Principal (CI/CD)

Best for automated pipelines:

```bash
# Create auth with service principal
pac auth create \
  --tenant <tenant-id> \
  --applicationId <app-id> \
  --clientSecret <secret> \
  --environment <environment-url>
```

Required Azure AD app permissions:
- Dynamics CRM: `user_impersonation`
- Power Platform API: Various depending on operations

### Managing Auth Profiles

```bash
# List auth profiles
pac auth list

# Switch profiles
pac auth select --index 1

# Delete profile
pac auth delete --index 1
```

## Environment Management

### List Available Environments

```bash
pac org list
```

Output:
```
Environment ID                       URL                                      Environment Name
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx https://org-dev.crm.dynamics.com         Development
yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy https://org-test.crm.dynamics.com        Test
zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz https://org-prod.crm.dynamics.com        Production
```

### Select Environment

```bash
# By URL
pac org select --environment https://org-test.crm.dynamics.com

# By name (partial match)
pac org select --environment Test
```

## Solution Management

Agents must be deployed into Power Platform Solutions.

### Create New Solution

```bash
# Initialize solution project
mkdir my-solution && cd my-solution
pac solution init --publisher-name "MyPublisher" --publisher-prefix "mp"

# Pack the solution
pac solution pack --zipfile MySolution.zip -f src

# Import to environment
pac solution import --path MySolution.zip
```

### Use Existing Solution

```bash
# List solutions in environment
pac solution list

# Deploy to existing solution
pac copilot create \
  --schemaName "mp_MyAgent" \
  --displayName "My Agent" \
  --templateFileName template.yaml \
  --solution "ExistingSolution"
```

## Deployment Commands

### Create New Agent

```bash
pac copilot create \
  --schemaName "af_ContractReviewAgent" \
  --displayName "Contract Review Agent" \
  --templateFileName templates/contract-review.yaml \
  --solution "AgentFactory"
```

### Update Existing Agent

```bash
# Extract current state
pac copilot extract-template \
  --bot <bot-id> \
  --templateFileName current-state.yaml

# Make changes to spec, regenerate, then...

# Delete and recreate (current approach)
pac copilot delete --bot <bot-id>
pac copilot create ...

# Or use import (preserves ID)
pac copilot import-template \
  --bot <bot-id> \
  --templateFileName updated-template.yaml
```

### Delete Agent

```bash
# Get bot ID from list
pac copilot list

# Delete by ID
pac copilot delete --bot xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## Multi-Environment Deployment

### Environment Promotion

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│     DEV     │────▶│    TEST     │────▶│    PROD     │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
     Create          Solution Export     Solution Import
     & Test           / Import           (Managed)
```

### Export from Source

```bash
# Switch to source environment
pac org select --environment Development

# Export solution
pac solution export \
  --name AgentFactory \
  --path ./exports/AgentFactory_1.0.0.zip \
  --managed false
```

### Import to Target

```bash
# Switch to target environment
pac org select --environment Production

# Import solution
pac solution import \
  --path ./exports/AgentFactory_1.0.0_managed.zip \
  --activate-plugins
```

## CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yaml
name: Deploy Agent

on:
  push:
    branches: [main]
    paths:
      - 'specs/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0'
          
      - name: Install dependencies
        run: |
          npm install
          dotnet tool install --global Microsoft.PowerApps.CLI.Tool
          
      - name: Validate specs
        run: npx af validate specs/*.yaml
        
      - name: Generate templates
        run: npx af generate specs/*.yaml -o templates/
        
      - name: Authenticate to Power Platform
        run: |
          pac auth create \
            --tenant ${{ secrets.TENANT_ID }} \
            --applicationId ${{ secrets.CLIENT_ID }} \
            --clientSecret ${{ secrets.CLIENT_SECRET }} \
            --environment ${{ secrets.ENVIRONMENT_URL }}
            
      - name: Deploy agents
        run: |
          for template in templates/*.yaml; do
            name=$(basename "$template" .yaml | sed 's/-template$//')
            pac copilot create \
              --schemaName "af_${name}" \
              --displayName "${name}" \
              --templateFileName "$template" \
              --solution "AgentFactory"
          done
```

### Azure DevOps Example

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main
  paths:
    include:
      - specs/*

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'

  - task: UseDotNet@2
    inputs:
      version: '8.0.x'

  - script: |
      npm install
      dotnet tool install --global Microsoft.PowerApps.CLI.Tool
    displayName: 'Install dependencies'

  - script: npx af validate specs/*.yaml
    displayName: 'Validate specs'

  - script: npx af generate specs/*.yaml -o templates/
    displayName: 'Generate templates'

  - script: |
      pac auth create \
        --tenant $(TENANT_ID) \
        --applicationId $(CLIENT_ID) \
        --clientSecret $(CLIENT_SECRET) \
        --environment $(ENVIRONMENT_URL)
    displayName: 'Authenticate to Power Platform'
    env:
      CLIENT_SECRET: $(CLIENT_SECRET)

  - script: |
      pac copilot create \
        --schemaName "af_MyAgent" \
        --displayName "My Agent" \
        --templateFileName templates/my-agent-template.yaml \
        --solution "AgentFactory"
    displayName: 'Deploy agent'
```

## Rollback

### Using Git

```bash
# Revert to previous spec version
git checkout HEAD~1 -- specs/my-agent.yaml

# Regenerate and deploy
af generate specs/my-agent.yaml
af deploy templates/my-agent-template.yaml --env prod
```

### Using Solution History

```bash
# List solution history
pac solution history --name AgentFactory

# Restore previous version
pac solution restore --name AgentFactory --version 1.0.0
```

## Troubleshooting

### "No active environment"

```bash
# Check current auth and environment
pac auth list
pac org list

# Select environment
pac org select --environment <url-or-name>
```

### "Solution not found"

Ensure the solution exists in the target environment:

```bash
pac solution list
```

If not, create and import it first.

### "Invalid schema name prefix"

Schema names must match the solution publisher prefix. Check your solution's prefix:

```bash
# View solution details
pac solution list
```

Use `--prefix` when generating to match.

### "Entity already exists"

An agent with that schema name exists. Options:

1. Delete existing: `pac copilot delete --bot <id>`
2. Use different schema name
3. Use `import-template` to update existing

## Next Steps

- [GCC Guide](./gcc-guide.md) — Government cloud deployment
- [CLI Reference](./cli-reference.md) — All commands
- [Architecture](./architecture.md) — How it works
