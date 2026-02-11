# CLI Reference

Complete reference for the Agent Factory command-line interface.

## Installation

The CLI is available as `af` when installed globally, or via `npx af` when run from the project directory.

```bash
# From project directory
npx af <command>

# Or install globally
npm install -g agent-factory
af <command>
```

## Commands

### `af validate`

Validate agent spec files against the schema.

```bash
af validate <specs...> [options]
```

**Arguments:**
- `<specs...>` — One or more spec files to validate

**Options:**
- `-s, --schema <path>` — Custom schema file (default: built-in schema)

**Examples:**

```bash
# Validate a single spec
af validate specs/my-agent.yaml

# Validate multiple specs
af validate specs/*.yaml

# Use custom schema
af validate specs/agent.yaml --schema custom-schema.yaml
```

**Output:**

```
🔍 Validating specs...
  ✅ specs/my-agent.yaml
  ❌ specs/broken-agent.yaml
     - name is required
     - topics[0].actions must have at least 1 item
```

---

### `af generate`

Generate Copilot Studio templates from agent specs.

```bash
af generate <specs...> [options]
```

**Arguments:**
- `<specs...>` — One or more spec files to generate

**Options:**
- `-o, --output <path>` — Output file or directory (default: `templates/`)
- `-p, --prefix <prefix>` — Publisher prefix for schema names (default: `af`)

**Examples:**

```bash
# Generate to default templates/ directory
af generate specs/my-agent.yaml

# Generate to specific file
af generate specs/my-agent.yaml -o templates/custom-name.yaml

# Generate multiple specs
af generate specs/*.yaml -o templates/

# Use custom prefix
af generate specs/agent.yaml --prefix cst
```

**Output:**

```
⚙️  Generating templates...
  ✅ specs/my-agent.yaml → templates/my-agent-template.yaml
```

---

### `af deploy`

Deploy templates to Power Platform environment.

```bash
af deploy <templates...> [options]
```

**Arguments:**
- `<templates...>` — One or more template files to deploy

**Options:**
- `-e, --env <environment>` — Target environment: `test`, `staging`, or `prod` (required)
- `--solution <name>` — Solution name (default: `AgentFactory`)
- `--schema-name <name>` — Override schema name
- `--display-name <name>` — Override display name

**Examples:**

```bash
# Deploy to test environment
af deploy templates/my-agent-template.yaml --env test

# Deploy with custom solution
af deploy templates/agent.yaml --env prod --solution CustomerSolution
```

**Output:**

```
🚀 Deploying to test...
  ✅ templates/my-agent-template.yaml → af_MyAgent
     URL: https://web.powerva.microsoft.com/environments/.../bots/...
```

---

### `af test`

Run automated conversation tests against deployed agents.

```bash
af test <templates...> [options]
```

**Arguments:**
- `<templates...>` — Template files (used to identify which agents to test)

**Options:**
- `-e, --env <environment>` — Target environment (required)
- `--scenarios <path>` — Test scenarios file (YAML)
- `--timeout <ms>` — Response timeout in milliseconds (default: 30000)

**Examples:**

```bash
# Run default tests
af test templates/agent.yaml --env test

# Run custom test scenarios
af test templates/agent.yaml --env test --scenarios tests/scenarios.yaml
```

**Test Scenarios File:**

```yaml
scenarios:
  - name: Greeting test
    turns:
      - user: "hello"
        expect:
          contains: "help"
          
  - name: Password reset flow
    turns:
      - user: "I need to reset my password"
        expect:
          contains: "which system"
      - user: "Windows"
        expect:
          contains: "Service Desk"
```

**Output:**

```
🧪 Testing in test...
  ✅ templates/agent.yaml: 5/5 tests passed
```

---

### `af package`

Package templates as Power Platform solutions for distribution.

```bash
af package <templates...> [options]
```

**Arguments:**
- `<templates...>` — Template files to package

**Options:**
- `-o, --output <dir>` — Output directory (default: `releases/`)
- `--managed` — Create managed solution (default: unmanaged)
- `--version <version>` — Solution version

**Examples:**

```bash
# Create unmanaged solution
af package templates/agent.yaml

# Create managed solution with version
af package templates/agent.yaml --managed --version 1.0.0

# Output to custom directory
af package templates/*.yaml -o dist/
```

**Output:**

```
📦 Packaging solutions...
  ✅ templates/my-agent-template.yaml → releases/MyAgent_1.0.0.zip
```

---

### `af cleanup`

Remove test deployments from an environment.

```bash
af cleanup <templates...> [options]
```

**Arguments:**
- `<templates...>` — Template files (identifies agents to remove)

**Options:**
- `-e, --env <environment>` — Target environment (required)
- `--force` — Skip confirmation prompt

**Examples:**

```bash
# Cleanup with confirmation
af cleanup templates/agent.yaml --env test

# Force cleanup (no confirmation)
af cleanup templates/*.yaml --env test --force
```

**Output:**

```
🧹 Cleaning up test...
  ✅ af_MyAgent removed
```

---

### `af init`

Create a new agent spec from template.

```bash
af init [name] [options]
```

**Arguments:**
- `[name]` — Agent name (optional, prompts if not provided)

**Options:**
- `-t, --template <type>` — Template type: `basic`, `helpdesk`, `faq` (default: `basic`)
- `-c, --cloud <cloud>` — Target cloud: `commercial`, `gcc`, `gcch`, `dod` (default: `commercial`)
- `-o, --output <dir>` — Output directory (default: `specs/`)

**Examples:**

```bash
# Interactive mode
af init

# Quick create
af init "My New Agent" --template helpdesk --cloud gcc

# Output to custom location
af init "Agent" -o custom-specs/
```

**Output:**

```
📝 Creating new agent spec...
  ✅ Created specs/my-new-agent.yaml
  📖 Edit the file and run: af validate specs/my-new-agent.yaml
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AF_PREFIX` | Default publisher prefix | `af` |
| `AF_SOLUTION` | Default solution name | `AgentFactory` |
| `PAC_CLI_PATH` | Path to PAC CLI | (auto-detected) |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Validation error or command failure |
| 2 | Invalid arguments |

## Configuration File

Create `agent-factory.config.yaml` in your project root:

```yaml
# Default publisher prefix
prefix: cst

# Default solution name
solution: CustomerSolution

# Environment mappings
environments:
  test:
    url: https://org-test.crm.dynamics.com
  staging:
    url: https://org-staging.crm.dynamics.com
  prod:
    url: https://org-prod.crm.dynamics.com

# Default options
defaults:
  cloud: gcc
  template: helpdesk
```

## PAC CLI Integration

Agent Factory wraps the Power Platform CLI (PAC) for deployment operations. Ensure PAC is installed and authenticated:

```bash
# Check PAC version
pac --version

# Authenticate
pac auth create --deviceCode

# List environments
pac org list

# Select environment
pac org select --environment "Your Environment"
```

## Next Steps

- [Deployment Guide](./deployment-guide.md) — Advanced deployment scenarios
- [GCC Guide](./gcc-guide.md) — Government cloud deployment
- [Architecture](./architecture.md) — How it works under the hood
