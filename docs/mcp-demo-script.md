# Federal Policy Analyst - Demo Script

## The Scenario
You're **JT, a Copilot Cloud Solution Architect** at Microsoft, showing federal customers how to extend Copilot Studio with custom MCP servers that connect to their own policy knowledge bases.

---

## Setup (Before Demo)
1. Have Copilot Studio open with the Federal Policy Advisor agent
2. MCP server is connected at `https://mcp-analyst.turek.in/mcp`
3. Have Agent Factory repo ready to show (https://github.com/johnturek/agent-factory)

---

## Demo Flow (15 minutes)

### ACT 1: "The Problem" (2 min)

**SAY:**
> "Federal agencies have tons of institutional knowledge locked in PDFs, wikis, and the heads of senior staff. When a new program manager needs to know if their cloud project needs FedRAMP, or what the Privacy Act requires, they're emailing around, waiting days for answers.
>
> Today I'm going to show you how we built an AI assistant that can answer these questions instantly — and the secret sauce is MCP, Model Context Protocol."

---

### ACT 2: "The Policy Expert" (5 min)

**SAY:**
> "Meet the Federal Policy Analyst. It's connected to our policy knowledge base via MCP. Watch what happens when I ask it a real question..."

**TYPE IN COPILOT STUDIO:**
```
I'm launching a new public-facing website that will collect citizen feedback. What compliance requirements do I need to worry about?
```

**EXPECTED RESPONSE:** The bot will call `assess_compliance` and return a full list including:
- FISMA/ATO requirements
- Section 508 accessibility
- Privacy Act (PIA, potentially SORN)
- FedRAMP if cloud-hosted
- Timeline recommendations

**SAY:**
> "In 5 seconds, we got a complete compliance checklist that would take a new PM a week to research. And look — it's citing specific authorities: OMB M-22-09, Privacy Act, Section 508. This isn't generic ChatGPT. It knows federal policy."

---

**TYPE:**
```
I need to procure cloud security monitoring tools, about $2M, and my agency has small business goals to meet. What contract vehicles should I use?
```

**EXPECTED RESPONSE:** The bot calls `find_contract_vehicle` and recommends:
- 8(a) STARS III (small business)
- GSA MAS
- SEWP V
- With next steps for each

**SAY:**
> "Now we're into procurement guidance. It knows about GWACs, it understands small business set-asides, and it's giving actionable next steps. This is the kind of tribal knowledge that usually lives in the head of one GS-15 who's about to retire."

---

### ACT 3: "The Acronym Decoder" (1 min)

**SAY:**
> "Quick one — ever been in a federal meeting and someone throws out an acronym you don't know?"

**TYPE:**
```
What does POAM stand for?
```

**EXPECTED:** "Plan of Action and Milestones - remediation tracking"

**SAY:**
> "Instant lookup. No more pretending you know what they're talking about."

---

### ACT 4: "Under the Hood" (3 min)

**SAY:**
> "So how does this work? Let me show you the architecture..."

**SHOW (draw or have diagram ready):**
```
┌─────────────────────┐
│   Copilot Studio    │
│   (The Agent)       │
└──────────┬──────────┘
           │ MCP Protocol
           ▼
┌─────────────────────┐
│  MCP Server         │
│  (Your API)         │
│  - analyze_policy   │
│  - find_vehicle     │
│  - assess_compliance│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Your Data          │
│  (Policy DB, APIs,  │
│   SharePoint, etc.) │
└─────────────────────┘
```

**SAY:**
> "MCP — Model Context Protocol — is the new standard for connecting AI agents to tools. It's like USB for AI. Copilot Studio speaks MCP natively now. 
>
> This MCP server is running in a Docker container. It exposes 5 tools. When you ask a question, Copilot Studio decides which tool to call, sends the request over HTTPS, and gets structured data back.
>
> The beautiful thing? The server can connect to ANYTHING on the backend — your policy database, ServiceNow, SharePoint, your agency's internal APIs. The AI doesn't need to know how. It just calls the tool."

---

### ACT 5: "Agent Factory" (3 min)

**SAY:**
> "Now the really cool part. We built these agents using code. No clicking through UIs."

**SHOW: Agent Factory repo**
```
https://github.com/johnturek/agent-factory
```

**SAY:**
> "Agent Factory lets you define agents in YAML and deploy them with a single command. Watch..."

**SHOW: A spec file**
```yaml
name: Federal Policy Advisor
description: Expert guidance on federal IT policy
instructions: |
  You are a federal policy expert...
  
tools:
  - type: mcp
    url: https://mcp-analyst.turek.in/mcp
```

**SAY:**
> "That's the entire agent definition. One YAML file. We run `af deploy` and it creates the agent in Copilot Studio, connects the MCP server, configures everything. 
>
> Why does this matter? Version control. CI/CD. You can have dev/staging/prod agents. You can roll back. You can do code review on agent changes. This is how you do AI at scale in the enterprise."

---

### ACT 6: "For GCC Customers" (1 min)

**SAY:**
> "And yes — this works in GCC and GCC-High. The MCP server runs in your boundary. Copilot Studio in GCC calls out to your server. No data leaves your environment except to call your own APIs.
>
> FedRAMP Moderate? We've got a path. Let's talk about your architecture."

---

## Closing (1 min)

**SAY:**
> "What we just saw:
> 1. An AI assistant that actually knows federal policy
> 2. Connected to external tools via MCP
> 3. Deployed using Agent-as-Code
> 4. Works in commercial AND GCC
>
> This is the future of government AI. Questions?"

---

## Backup Questions & Answers

**Q: "What's the latency?"**
> "Under 2 seconds typically. The MCP call is just an HTTPS POST. It's as fast as any API call."

**Q: "Can this connect to our ServiceNow / SharePoint / internal systems?"**
> "Absolutely. The MCP server is just code. You write connectors to whatever backend you need. We can help you architect that."

**Q: "Is MCP secure?"**
> "It's HTTPS with whatever auth you want — API keys, OAuth, Azure AD. The server runs in your environment. You control the network, the data, everything."

**Q: "What about PII?"**
> "Great question. The MCP server can implement data masking, access controls, audit logging — whatever your ISSO requires. The AI only sees what you let it see."

**Q: "How hard is it to build an MCP server?"**
> "This one is about 600 lines of JavaScript. We built it in a day. If you have developers who can write an API, they can write an MCP server."

---

## Quick Test Commands

Use these to test the bot before the demo:

| Test | What to Type |
|------|--------------|
| Policy analysis | "What are the Zero Trust requirements?" |
| Compliance check | "I'm building a cloud HR system with PII. What do I need?" |
| Contract vehicle | "How do I buy $1M of cybersecurity services?" |
| Acronym | "What is FISMA?" |
| Full flow | "Help me plan a new public website that collects feedback from citizens" |

---

## URLs

| Resource | URL |
|----------|-----|
| MCP Server | https://mcp-analyst.turek.in/mcp |
| Health Check | https://mcp-analyst.turek.in/health |
| Agent Factory | https://github.com/johnturek/agent-factory |

---

*Demo script by JTBotFather | Last updated: 2026-02-11*
