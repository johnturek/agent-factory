# Government Cloud Guide

Deploying Agent Factory to GCC, GCC-High, and DoD environments.

## Cloud Overview

Microsoft offers multiple cloud environments for government customers:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MICROSOFT CLOUD ENVIRONMENTS                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │              │  │              │  │              │  │              │    │
│  │  Commercial  │  │     GCC      │  │   GCC-High   │  │     DoD      │    │
│  │              │  │              │  │              │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│        │                 │                 │                 │              │
│        ▼                 ▼                 ▼                 ▼              │
│   Public Azure      Azure Gov         Azure Gov          Azure Gov         │
│                    (FedRAMP Mod)    (FedRAMP High)       (IL5/IL6)         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Cloud | Target Customers | Compliance Level |
|-------|------------------|------------------|
| **Commercial** | Private sector, general public | Standard |
| **GCC** | US Federal, State, Local, Tribal | FedRAMP Moderate |
| **GCC-High** | DoD, Defense contractors | FedRAMP High, ITAR |
| **DoD** | Department of Defense | IL5, IL6 |

## Endpoint Differences

### Power Platform URLs

| Cloud | Power Platform Admin | Copilot Studio |
|-------|---------------------|----------------|
| Commercial | admin.powerplatform.microsoft.com | web.powerva.microsoft.com |
| GCC | gcc.admin.powerplatform.microsoft.us | gcc.powerva.microsoft.us |
| GCC-High | high.admin.powerplatform.microsoft.us | high.powerva.microsoft.us |
| DoD | dod.admin.powerplatform.microsoft.us | dod.powerva.microsoft.us |

### Dataverse URLs

| Cloud | CRM Endpoint Format |
|-------|---------------------|
| Commercial | `https://<org>.crm.dynamics.com` |
| GCC | `https://<org>.crm9.dynamics.com` |
| GCC-High | `https://<org>.crm.microsoftdynamics.us` |
| DoD | `https://<org>.crm.appsplatform.us` |

### Azure AD / Entra ID

| Cloud | Login Endpoint |
|-------|----------------|
| Commercial | `login.microsoftonline.com` |
| GCC | `login.microsoftonline.com` |
| GCC-High | `login.microsoftonline.us` |
| DoD | `login.microsoftonline.us` |

## PAC CLI Configuration

### Authenticate to GCC

```bash
pac auth create \
  --deviceCode \
  --cloud UsGov
```

### Authenticate to GCC-High

```bash
pac auth create \
  --deviceCode \
  --cloud UsGovHigh
```

### Authenticate to DoD

```bash
pac auth create \
  --deviceCode \
  --cloud UsGovDoD
```

### Service Principal (GCC-High)

```bash
pac auth create \
  --tenant <tenant-id> \
  --applicationId <app-id> \
  --clientSecret <secret> \
  --environment https://<org>.crm.microsoftdynamics.us \
  --cloud UsGovHigh
```

## Agent Spec Configuration

Set the target cloud in your agent spec:

```yaml
apiVersion: agent-factory/v1
kind: AgentSpec

name: Contract Review Agent
description: Federal contract review assistant

metadata:
  targetCloud: gcc  # or gcch, dod
  version: "1.0.0"

# ... rest of spec
```

### Cloud-Specific Settings

Some features vary by cloud environment:

```yaml
# GCC-High specific settings
security:
  authentication:
    mode: Integrated
    trigger: Always
  dataClassification: HighlyConfidential
  
# Ensure no external service calls to commercial endpoints
capabilities:
  - generative_actions
  - knowledge_search
  # Note: Some connectors may not be available in higher clouds
```

## Feature Availability

Not all features are available in every cloud:

| Feature | Commercial | GCC | GCC-High | DoD |
|---------|------------|-----|----------|-----|
| Copilot Studio | ✅ | ✅ | ✅ | ⚠️ |
| Generative AI | ✅ | ✅ | ✅ | ⚠️ |
| Power Automate | ✅ | ✅ | ✅ | ✅ |
| Dataverse | ✅ | ✅ | ✅ | ✅ |
| SharePoint Knowledge | ✅ | ✅ | ✅ | ⚠️ |
| Teams Integration | ✅ | ✅ | ✅ | ⚠️ |
| Custom Connectors | ✅ | ✅ | ⚠️ | ⚠️ |

✅ = Available | ⚠️ = Limited/Preview | ❌ = Not Available

> **Note:** Check the [Microsoft Trust Center](https://www.microsoft.com/en-us/trust-center) for current availability.

## Deployment Workflow

### GCC Deployment

```bash
# 1. Authenticate to GCC
pac auth create --deviceCode --cloud UsGov

# 2. Select environment
pac org select --environment https://yourorg.crm9.dynamics.com

# 3. Generate template with GCC metadata
af generate specs/agent.yaml --prefix af

# 4. Deploy
pac copilot create \
  --schemaName "af_ContractReviewAgent" \
  --displayName "Contract Review Agent" \
  --templateFileName templates/agent-template.yaml \
  --solution "AgentFactory"
```

### GCC-High Deployment

```bash
# 1. Authenticate to GCC-High
pac auth create --deviceCode --cloud UsGovHigh

# 2. Select environment
pac org select --environment https://yourorg.crm.microsoftdynamics.us

# 3. Deploy
pac copilot create \
  --schemaName "af_ContractReviewAgent" \
  --displayName "Contract Review Agent" \
  --templateFileName templates/agent-template.yaml \
  --solution "AgentFactory"
```

## CI/CD Considerations

### Separate Pipelines

Maintain separate pipelines for each cloud:

```
.github/workflows/
├── deploy-commercial.yaml
├── deploy-gcc.yaml
└── deploy-gcch.yaml
```

### Environment Secrets

Store cloud-specific secrets separately:

```yaml
# deploy-gcc.yaml
- name: Authenticate to GCC
  run: |
    pac auth create \
      --tenant ${{ secrets.GCC_TENANT_ID }} \
      --applicationId ${{ secrets.GCC_CLIENT_ID }} \
      --clientSecret ${{ secrets.GCC_CLIENT_SECRET }} \
      --environment ${{ secrets.GCC_ENVIRONMENT_URL }} \
      --cloud UsGov
```

### Self-Hosted Runners

For GCC-High and DoD, you may need self-hosted runners inside the appropriate network boundary:

```yaml
jobs:
  deploy-gcch:
    runs-on: [self-hosted, gcch-network]
    # ...
```

## Compliance Considerations

### Data Residency

- **GCC:** Data stays in US
- **GCC-High:** Data stays in US, Azure Government regions
- **DoD:** Data stays in DoD-specific regions

### Knowledge Sources

Ensure knowledge sources are in the same cloud:

```yaml
knowledge:
  sources:
    # ✅ GCC SharePoint site
    - type: sharepoint
      url: https://contoso.sharepoint.us/sites/contracts
      
    # ❌ DON'T use commercial SharePoint in GCC
    # - type: sharepoint
    #   url: https://contoso.sharepoint.com/sites/contracts
```

### Connectors

Only use certified GCC/GCCH connectors:

```yaml
# Check connector availability before using
actions:
  - type: call_connector
    connector: shared_commondataservice  # ✅ Available in GCC
    # connector: shared_twitter  # ❌ Not available in higher clouds
```

## Testing

### Test in Lower Cloud First

```
Commercial → GCC → GCC-High → DoD
```

1. Develop and test in commercial (fastest iteration)
2. Validate in GCC (most similar to production)
3. Deploy to GCC-High with compliance checks
4. DoD deployment (if applicable)

### Validation Checklist

Before deploying to government clouds:

- [ ] All knowledge sources in same cloud
- [ ] No external API calls to commercial endpoints
- [ ] Connectors verified for cloud availability
- [ ] Authentication configured correctly
- [ ] Data classification set appropriately
- [ ] No PII/CUI in source code or templates

## Troubleshooting

### "Unable to authenticate to cloud"

Ensure you're using the correct cloud flag:

```bash
# Wrong
pac auth create --deviceCode  # Defaults to commercial

# Correct for GCC
pac auth create --deviceCode --cloud UsGov
```

### "Connector not available"

Some connectors aren't available in government clouds. Check availability at:
- [GCC Connector List](https://learn.microsoft.com/power-platform/admin/power-automate-us-government)

### "Cannot connect to Dataverse"

Verify you're using the correct CRM endpoint:

| Cloud | Correct Endpoint |
|-------|------------------|
| GCC | `*.crm9.dynamics.com` |
| GCC-High | `*.crm.microsoftdynamics.us` |

### "Feature not available"

Some Copilot Studio features are commercial-only or in preview for government. Check:
- [Copilot Studio GCC Documentation](https://learn.microsoft.com/microsoft-copilot-studio/requirements-licensing-gcc)

## Resources

- [Power Platform US Government](https://learn.microsoft.com/power-platform/admin/powerapps-us-government)
- [Copilot Studio GCC](https://learn.microsoft.com/microsoft-copilot-studio/requirements-licensing-gcc)
- [Azure Government](https://azure.microsoft.com/explore/global-infrastructure/government)
- [Microsoft Trust Center](https://www.microsoft.com/trust-center)

## Next Steps

- [Deployment Guide](./deployment-guide.md) — General deployment
- [CLI Reference](./cli-reference.md) — All commands
- [Agent Spec Reference](./agent-spec-reference.md) — YAML specification
