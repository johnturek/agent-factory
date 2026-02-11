# Agent Spec Reference

Complete reference for the Agent Factory YAML specification.

## Overview

Agent specs are YAML files that define your Copilot Studio agent in a declarative format. This document covers every available field and option.

## Basic Structure

```yaml
apiVersion: agent-factory/v1
kind: AgentSpec

# Required
name: My Agent Name
description: What this agent does

# Agent behavior
instructions: |
  Multi-line instructions for the AI...

greeting: "Welcome message when conversation starts"

# Optional sections
metadata: { ... }
capabilities: [ ... ]
security: { ... }
knowledge: { ... }
topics: [ ... ]
```

## Top-Level Fields

### `apiVersion` (required)

```yaml
apiVersion: agent-factory/v1
```

Specifies the spec format version. Currently only `agent-factory/v1` is supported.

### `kind` (required)

```yaml
kind: AgentSpec
```

Always `AgentSpec` for agent definitions.

### `name` (required)

```yaml
name: Contract Review Agent
```

Display name for the agent. Used in Copilot Studio UI and as the basis for the schema name.

### `description` (required)

```yaml
description: Reviews federal contracts and explains FAR clauses
```

Brief description of what the agent does.

### `instructions` (required)

```yaml
instructions: |
  You are a contract review specialist for federal government agencies.
  
  Your responsibilities:
  - Help users understand contract terms
  - Explain FAR (Federal Acquisition Regulation) clauses
  - Identify potential compliance issues
  
  Guidelines:
  - Be professional and accurate
  - Never provide legal advice
  - Recommend consulting a contracting officer when appropriate
```

The AI instructions that define the agent's personality and behavior. This becomes the GPT system prompt in Copilot Studio.

### `greeting` (optional)

```yaml
greeting: "Hello! I'm your Contract Review Assistant. How can I help you today?"
```

Message displayed when a conversation starts. If omitted, defaults to a generic greeting using the agent name.

## Metadata

```yaml
metadata:
  version: "1.0.0"
  author: "CSA Team"
  language: "en-US"
  tags:
    - contracts
    - federal
    - compliance
  targetCloud: gcc
```

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Semantic version of this spec |
| `author` | string | Author or team name |
| `language` | string | Primary language (BCP 47 format) |
| `tags` | string[] | Searchable tags |
| `targetCloud` | string | `commercial`, `gcc`, `gcch`, or `dod` |

## Capabilities

```yaml
capabilities:
  - generative_actions
  - knowledge_search
  - connector_actions
```

Available capabilities:

| Capability | Description |
|------------|-------------|
| `generative_actions` | Enable AI-generated responses |
| `knowledge_search` | Enable knowledge source search |
| `connector_actions` | Enable Power Platform connector calls |
| `flow_actions` | Enable Power Automate flow calls |

## Security

```yaml
security:
  authentication:
    mode: Integrated
    trigger: Always
  dataClassification: Confidential
  allowedDomains:
    - "*.gov"
    - "agency.mil"
```

### Authentication Modes

| Mode | Description |
|------|-------------|
| `Integrated` | Uses Power Platform authentication |
| `None` | No authentication required |
| `AAD` | Azure AD / Entra ID |

### Data Classification

| Level | Description |
|-------|-------------|
| `Public` | No restrictions |
| `Internal` | Organization only |
| `Confidential` | Restricted access |
| `HighlyConfidential` | Maximum protection |

## Knowledge Sources

```yaml
knowledge:
  sources:
    - type: sharepoint
      name: Contract Library
      url: https://contoso.sharepoint.com/sites/contracts
      
    - type: dataverse
      name: Contract Records
      table: contracts
      
    - type: website
      name: FAR Website
      url: https://acquisition.gov/far
```

### Source Types

| Type | Description |
|------|-------------|
| `sharepoint` | SharePoint site or library |
| `dataverse` | Dataverse table |
| `website` | Public website |
| `file` | Uploaded files |

## Topics

Topics define conversation flows with triggers and actions.

### Basic Topic

```yaml
topics:
  - name: Password Reset
    description: Helps users reset their password
    triggers:
      phrases:
        - "reset my password"
        - "forgot password"
        - "can't log in"
        - "password help"
    actions:
      - type: message
        text: "I can help you reset your password!"
      - type: question
        prompt: "Which system do you need help with?"
        variable: TargetSystem
        entity: string
      - type: generative_answer
```

### Topic Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Topic display name (required) |
| `description` | string | What this topic handles |
| `triggers.phrases` | string[] | Trigger phrases |
| `triggers.entities` | string[] | Entity-based triggers |
| `actions` | action[] | Sequence of actions |

## Actions

Actions define what happens in a topic.

### Message Action

Send a message to the user:

```yaml
- type: message
  text: "Here's some information for you."
```

With multiple variations (random selection):

```yaml
- type: message
  text:
    - "Sure, I can help with that!"
    - "Absolutely, let me assist you."
    - "Of course, here's what I can do."
```

### Question Action

Ask the user a question and store the response:

```yaml
- type: question
  prompt: "What's your email address?"
  variable: UserEmail
  entity: email
```

#### Entity Types

| Entity | Description |
|--------|-------------|
| `string` | Free text |
| `number` | Numeric value |
| `boolean` | Yes/no |
| `email` | Email address |
| `phone` | Phone number |
| `date` | Date |
| `datetime` | Date and time |
| `choice` | Multiple choice (see below) |

#### Multiple Choice

```yaml
- type: question
  prompt: "What department are you in?"
  variable: Department
  entity: choice
  choices:
    - HR
    - IT
    - Finance
    - Operations
```

### Condition Action

Branch based on conditions:

```yaml
- type: condition
  conditions:
    - if: "=Topic.Department = 'IT'"
      then:
        - type: message
          text: "Connecting you to IT support..."
        - type: call_topic
          topic: IT Support
    - if: "=Topic.Department = 'HR'"
      then:
        - type: message
          text: "Connecting you to HR..."
        - type: call_topic
          topic: HR Support
  else:
    - type: message
      text: "I'll connect you to general support."
```

### Set Variable Action

Set a variable value:

```yaml
- type: set_variable
  variable: TicketPriority
  value: "High"
```

With expression:

```yaml
- type: set_variable
  variable: FullName
  value: "=Concatenate(Topic.FirstName, ' ', Topic.LastName)"
```

### Call Topic Action

Transfer to another topic:

```yaml
- type: call_topic
  topic: Escalate
```

### Generative Answer Action

Use AI to generate a response:

```yaml
- type: generative_answer
```

This searches knowledge sources and generates an AI response.

### End Conversation Action

End the current conversation:

```yaml
- type: end_conversation
```

### Escalate Action

Transfer to a human agent:

```yaml
- type: escalate
```

### Call Connector Action

Call a Power Platform connector:

```yaml
- type: call_connector
  connector: shared_office365
  operation: SendEmail
  inputs:
    to: "=Topic.UserEmail"
    subject: "Password Reset Request"
    body: "Your password reset link is..."
```

### Call Flow Action

Trigger a Power Automate flow:

```yaml
- type: call_flow
  flow: "Password Reset Flow"
  inputs:
    userEmail: "=Topic.UserEmail"
    system: "=Topic.TargetSystem"
```

## Complete Example

```yaml
apiVersion: agent-factory/v1
kind: AgentSpec

name: IT Help Desk Agent
description: Handles common IT support requests for federal agencies

metadata:
  version: "1.2.0"
  author: "CSA Team"
  language: "en-US"
  targetCloud: gcc
  tags:
    - it-support
    - helpdesk
    - federal

capabilities:
  - generative_actions
  - knowledge_search
  - connector_actions

security:
  authentication:
    mode: Integrated
    trigger: Always
  dataClassification: Internal

instructions: |
  You are an IT Help Desk agent for a federal government agency.
  
  Your responsibilities:
  - Help with password resets
  - Assist with software installation requests
  - Troubleshoot common IT issues
  - Create support tickets when needed
  
  Guidelines:
  - Always verify the user's identity before making changes
  - Follow all security protocols
  - Escalate complex issues to human support
  - Be professional and patient

greeting: "Welcome to IT Help Desk! How can I assist you today?"

knowledge:
  sources:
    - type: sharepoint
      name: IT Knowledge Base
      url: https://agency.sharepoint.com/sites/ITSupport

topics:
  - name: Password Reset
    description: Helps users reset their passwords
    triggers:
      phrases:
        - "reset password"
        - "forgot password"
        - "can't log in"
        - "password expired"
        - "locked out"
    actions:
      - type: question
        prompt: "Which system do you need to reset your password for?"
        variable: TargetSystem
        entity: choice
        choices:
          - Windows Login
          - Email (O365)
          - VPN
          - Other
      - type: condition
        conditions:
          - if: "=Topic.TargetSystem = 'Windows Login'"
            then:
              - type: message
                text: "For Windows password resets, please contact the Service Desk at x5555 or use the self-service portal."
          - if: "=Topic.TargetSystem = 'Email (O365)'"
            then:
              - type: message
                text: "I can send you a password reset link to your recovery email."
              - type: call_flow
                flow: "O365 Password Reset"
                inputs:
                  user: "=System.User.Email"
        else:
          - type: message
            text: "Let me create a ticket for this request."
          - type: call_topic
            topic: Create Ticket

  - name: Software Request
    description: Handles software installation requests
    triggers:
      phrases:
        - "install software"
        - "need application"
        - "request program"
    actions:
      - type: question
        prompt: "What software do you need installed?"
        variable: SoftwareName
        entity: string
      - type: question
        prompt: "What is the business justification for this software?"
        variable: Justification
        entity: string
      - type: message
        text: "I'll submit a software request for {Topic.SoftwareName}. Your supervisor will receive an approval request."
      - type: call_flow
        flow: "Software Request"
        inputs:
          software: "=Topic.SoftwareName"
          justification: "=Topic.Justification"
          requester: "=System.User.Email"

  - name: Create Ticket
    description: Creates a support ticket
    triggers:
      phrases:
        - "create ticket"
        - "submit ticket"
        - "open ticket"
    actions:
      - type: question
        prompt: "Please describe your issue in detail."
        variable: IssueDescription
        entity: string
      - type: question
        prompt: "What priority level is this?"
        variable: Priority
        entity: choice
        choices:
          - Low (within 1 week)
          - Medium (within 2 days)
          - High (within 4 hours)
          - Critical (immediate)
      - type: call_connector
        connector: shared_commondataservice
        operation: CreateRecord
        inputs:
          entityName: incident
          description: "=Topic.IssueDescription"
          priority: "=Topic.Priority"
      - type: message
        text: "I've created ticket #{Topic.TicketNumber}. You'll receive a confirmation email shortly."
```

## Schema Validation

Validate your spec against the JSON Schema:

```bash
npx af validate specs/my-agent.yaml
```

The full JSON Schema is available at `docs/agent-spec-schema.yaml`.

## Next Steps

- [CLI Reference](./cli-reference.md) — Command documentation
- [Architecture](./architecture.md) — How generation works
- [Deployment Guide](./deployment-guide.md) — Deploying to environments
