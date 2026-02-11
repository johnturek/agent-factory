# Agent Factory

**AI-Driven Agent Creation Platform for Microsoft Copilot Studio**

Define agents in YAML → Generate tooling → Test → Package → Deliver to customers.

## Vision

CSA engineers define agent requirements in a human-readable spec. Agent Factory:
1. Generates Copilot Studio-compatible templates
2. Creates required connectors, flows, and actions
3. Deploys to test environment for validation
4. Packages as Power Platform solution for customer import

## Quick Start

```bash
# Define your agent
vim specs/my-agent.yaml

# Validate the spec
af validate specs/my-agent.yaml

# Generate Copilot Studio template
af generate specs/my-agent.yaml -o templates/

# Deploy to test environment
af deploy templates/my-agent/ --env test

# Run automated tests
af test templates/my-agent/ --env test

# Package for customer delivery
af package templates/my-agent/ -o releases/my-agent-v1.0.0.zip
```

## Agent Spec Format

```yaml
apiVersion: agentfactory.microsoft.com/v1
kind: Agent
metadata:
  name: contract-review-agent
  version: 1.0.0
  description: Reviews government contracts for compliance
  cloud: gcc  # commercial | gcc | gcch | dod
  
spec:
  capabilities:
    - document_analysis
    - policy_lookup
    
  knowledge:
    - type: sharepoint
      site: /sites/policies
      
  topics:
    - name: Review Contract
      trigger: "review this contract"
      actions:
        - analyze_document
        - check_compliance
        - generate_report
        
  connectors:
    - name: sharepoint
      type: standard
    - name: compliance-api
      type: custom
      spec: ./connectors/compliance-api.yaml
```

## Project Structure

```
agent-factory/
├── specs/           # Agent specification files
├── templates/       # Generated Copilot Studio templates  
├── connectors/      # Custom connector definitions
├── flows/           # Power Automate flow definitions
├── tests/           # Automated test scenarios
├── releases/        # Packaged solutions for delivery
├── lib/             # Core library
├── cli/             # Command-line interface
└── docs/            # Documentation
```

## Environments

| Cloud | Use Case | Notes |
|-------|----------|-------|
| commercial | Non-government | Standard Power Platform |
| gcc | Government Community Cloud | FedRAMP Moderate |
| gcch | Government Community Cloud High | FedRAMP High + DoD IL4 |
| dod | Department of Defense | DoD IL5 |

## CI/CD

- **main** - Stable, tested, ready for customer delivery
- **develop** - Active development, may be unstable
- **feature/*** - Work in progress

Pull requests require:
- [ ] Spec validation passes
- [ ] Template generation succeeds
- [ ] Automated tests pass in test environment
- [ ] Code review approval

## Status

🚧 **Under Development** 🚧

---

*Built by the Copilot CSA Team*
