# Department of State OIG Demo — Copilot Studio + MCP

## Executive Summary

This demo showcases how the Department of State Office of Inspector General can leverage Microsoft Copilot Studio and Model Context Protocol (MCP) to build AI assistants that support auditors and investigators while maintaining data sovereignty and security.

**What We're Demonstrating:**
1. Three purpose-built AI agents deployed to Copilot Studio
2. Remote MCP server integration (your backend, your data, your control)
3. Agent-as-Code deployment via YAML definitions
4. End-user scenarios for auditors, investigators, and foreign assistance analysts

**Target Audience:** State OIG leadership, IT staff, audit and investigation leadership

---

## Part 1: Understanding the Architecture (10 minutes)

### 1.1 The Problem We're Solving

**SAY:**
> "Your auditors and investigators are knowledge workers dealing with complex regulatory environments. They need to understand the Foreign Affairs Manual, GAGAS, 2 CFR 200, fraud indicators, embassy inspection protocols — and they need it fast.
>
> Today, that knowledge lives in people's heads, in filing cabinets, in scattered SharePoint sites. New staff take months to get up to speed. Experienced staff spend hours answering the same questions.
>
> What if we could encode that institutional knowledge into an AI assistant that's available 24/7, speaks your language, and keeps your data secure?"

### 1.2 Why Copilot Studio?

**SAY:**
> "Let me explain why Copilot Studio is the right platform for federal use cases."

**SHOW (draw or present):**
```
┌────────────────────────────────────────────────────────────────┐
│                     COPILOT STUDIO                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • FedRAMP Authorized (Moderate baseline)                 │  │
│  │ • Azure Government Cloud available (GCC, GCC-High)       │  │
│  │ • Built-in security, compliance, DLP                     │  │
│  │ • Integrates with Microsoft 365, Teams, SharePoint       │  │
│  │ • No code required for basic agents                      │  │
│  │ • Enterprise governance and audit logging                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  KEY: The AI runs in Microsoft's cloud, but YOUR data          │
│       stays in YOUR environment through MCP                    │
└────────────────────────────────────────────────────────────────┘
```

**SAY:**
> "Copilot Studio gives you enterprise-grade AI without building infrastructure. It's already FedRAMP authorized, available in GCC, and integrates with your existing Microsoft stack."

### 1.3 The MCP Architecture

**SAY:**
> "Now here's where it gets interesting. The AI agent needs to answer questions about YOUR policies, YOUR cases, YOUR audit history. But that data can't live in Microsoft's cloud.
>
> Model Context Protocol — MCP — is how we solve this."

**SHOW:**
```
┌──────────────────────────────────────────────────────────────────────────┐
│                           YOUR USERS                                      │
│                    (Auditors, Investigators)                              │
│                              │                                            │
│                              ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                     COPILOT STUDIO (GCC)                             │ │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │ │
│  │  │ Audit Agent   │  │ Investigator  │  │ Foreign Asst  │           │ │
│  │  │               │  │    Agent      │  │    Agent      │           │ │
│  │  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘           │ │
│  │          │                  │                  │                    │ │
│  │          └──────────────────┼──────────────────┘                    │ │
│  │                             │                                        │ │
│  │                     MCP Protocol (HTTPS)                            │ │
│  └─────────────────────────────┼───────────────────────────────────────┘ │
│                                │                                          │
│ ═══════════════════════════════╪══════════════════════════════════════   │
│   AGENCY BOUNDARY (FedRAMP)    │                                         │
│ ═══════════════════════════════╪══════════════════════════════════════   │
│                                │                                          │
│  ┌─────────────────────────────┼───────────────────────────────────────┐ │
│  │                     YOUR MCP SERVER                                  │ │
│  │                     (Your Network)                                   │ │
│  │                             │                                        │ │
│  │   ┌─────────────────────────┼─────────────────────────────────────┐ │ │
│  │   │                AVAILABLE TOOLS                                 │ │ │
│  │   │                                                                │ │ │
│  │   │  audit_guidance     │  fraud_indicators    │  grant_compliance │ │ │
│  │   │  embassy_checklist  │  case_intake         │  partner_risk     │ │ │
│  │   │  prior_findings     │  interview_questions │  cfr_lookup       │ │ │
│  │   │                                                                │ │ │
│  │   └────────────────────────────────────────────────────────────────┘ │ │
│  │                             │                                        │ │
│  │   ┌─────────────────────────┼─────────────────────────────────────┐ │ │
│  │   │            YOUR DATA SOURCES                                   │ │ │
│  │   │                                                                │ │ │
│  │   │  Case Management   │  Audit Database   │  FAM Knowledge Base   │ │ │
│  │   │  SharePoint        │  Grant System     │  HR Records           │ │ │
│  │   │                                                                │ │ │
│  │   └────────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

**SAY:**
> "The Copilot Studio agent is the brain — it understands language, reasons through problems, generates responses. But when it needs real data, it calls YOUR MCP server.
>
> Your server decides what tools to expose, what data to return, and what access controls apply. Case files never leave your network. The AI just sees the structured responses you choose to provide."

### 1.4 Agent-as-Code: Why It Matters

**SAY:**
> "Here's something that will resonate with your IT team: we deploy these agents using code."

**SHOW:**
```yaml
# state-oig-audit-assistant.yaml
apiVersion: af/v1
kind: AgentSpec

metadata:
  name: state-oig-audit-assistant
  displayName: State OIG Audit Assistant
  version: "1.0.0"

agent:
  primaryInstruction: |
    You are an AI assistant for State OIG auditors.
    Help with GAGAS compliance, embassy inspections,
    and foreign assistance program reviews.
    Always cite applicable FAM sections.
    
tools:
  - type: mcp
    url: https://your-internal-server/oig-mcp
```

**SAY:**
> "That's the entire agent definition. It goes into version control — Git. When you need to change the agent's instructions, you update the file, create a pull request, get approval, and deploy.
>
> - Version history of every change
> - Code review before deployment
> - Rollback capability
> - Audit trail
> - CI/CD integration
>
> This is how enterprise software should be managed. Not clicking through UIs and hoping you remember what you changed."

---

## Part 2: End-User Scenarios (15 minutes)

### 2.1 Scenario: New Auditor Starting an Embassy Inspection

**SAY:**
> "Let's see this from an auditor's perspective. I'm a new auditor assigned to inspect Embassy Nairobi. I've never done an embassy inspection before."

**TYPE:**
```
I'm a new auditor assigned to inspect Embassy Nairobi. What's the standard methodology for an embassy inspection?
```

**EXPECTED RESPONSE:**
The agent explains the State OIG embassy inspection framework:
- Executive direction review
- Policy and program implementation
- Resource management
- Information management operations
- Coordination with Regional Security Officer
- Key FAM references (1 FAM 050)

**SAY:**
> "In 30 seconds, the new auditor has a framework that would take days to piece together from manuals and asking colleagues. And it's citing the actual regulations — FAM sections, GAGAS standards."

---

**TYPE:**
```
What are the high-risk areas I should focus on for a large embassy like Nairobi?
```

**EXPECTED RESPONSE:**
Guidance on priority risk areas:
- Security posture (high-threat post)
- Locally Employed Staff (LE Staff) management
- Contract oversight (guard forces, construction)
- Regional management responsibilities
- Visa fraud indicators (if consular section)

**SAY:**
> "The AI is contextualizing based on the embassy profile. Nairobi is a high-threat post with significant regional responsibilities. Different risk profile than, say, Embassy Copenhagen."

---

### 2.2 Scenario: Investigator Receiving a Hotline Complaint

**SAY:**
> "Now let's switch to investigations. A complaint comes in through the OIG hotline."

**TYPE:**
```
I received a hotline complaint alleging that a grants officer is steering awards to an NGO where her husband works. How do I assess this allegation?
```

**EXPECTED RESPONSE:**
Case intake guidance:
- Conflict of interest indicators
- Questions to investigate (financial disclosure review, award history, husband's role)
- Evidence to preserve (emails, award files, SF-278)
- Coordination considerations (OIG counsel, potentially DOJ)
- Relevant statutes and regulations

**SAY:**
> "The agent immediately recognizes this as a potential conflict of interest / grant fraud case. It's suggesting specific evidence sources — financial disclosure forms, the award file, email preservation.
>
> For a new investigator, this is invaluable. For an experienced investigator, it's a time-saver."

---

**TYPE:**
```
What fraud indicators should I look for in the award files?
```

**EXPECTED RESPONSE:**
Specific fraud indicators for grant steering:
- Narrow scope that fits only one applicant
- Short application windows
- Evaluation criteria changes mid-process
- Waivers of standard requirements
- Below-market cost proposals (too good to be true)
- History of awards to same recipient

**SAY:**
> "These are the red flags that experienced investigators know to look for. Now that knowledge is encoded in the system, available to everyone."

---

### 2.3 Scenario: Foreign Assistance Program Review

**SAY:**
> "Foreign assistance is one of State OIG's major oversight areas, especially with the recent USAID integration. Let's see the specialized agent."

**TYPE:**
```
I'm reviewing a $50 million democracy promotion program in a high-corruption country. What are my key risk areas?
```

**EXPECTED RESPONSE:**
Comprehensive risk framework:
- Country-specific corruption risks
- Implementing partner due diligence
- Subaward monitoring (flow-down requirements)
- Cash handling in difficult operating environments
- Cost-share verification challenges
- Program measurement validity
- 2 CFR 200 compliance specifics

**SAY:**
> "This is where specialized knowledge really shines. The agent understands that a democracy program in a high-corruption country has different risks than an educational exchange in Western Europe. It's surfacing the right issues."

---

**TYPE:**
```
What should the pre-award risk assessment cover for a new implementing partner in this environment?
```

**EXPECTED RESPONSE:**
Pre-award assessment checklist:
- Prior federal award history
- Financial management capacity
- Internal controls assessment
- Local registration and legal status
- Sub-recipient monitoring capabilities
- Personnel and management capacity
- SAM.gov and OFAC screening

**SAY:**
> "This is 2 CFR 200.206 come to life — the risk assessment requirements for pass-through entities. The AI is translating regulations into actionable guidance."

---

## Part 3: Under the Hood — Technical Deep Dive (10 minutes)

### 3.1 How the Agent is Built

**SAY:**
> "Let me show you exactly how this was built. This is the actual YAML definition."

**SHOW (scroll through actual spec file):**
```yaml
agent:
  primaryInstruction: |
    You are an AI assistant for Department of State OIG auditors.
    
    Your responsibilities:
    1. Help auditors understand applicable standards (GAGAS, FAM)
    2. Provide guidance on embassy inspection methodology
    3. Assist with foreign assistance program audits
    ...
```

**SAY:**
> "The `primaryInstruction` is the agent's core personality. It defines what the agent knows, how it should respond, what topics it covers. This is where your subject matter experts encode their knowledge."

**SHOW:**
```yaml
topics:
  - name: EmbassyInspection
    triggerPhrases:
      - "embassy inspection"
      - "post inspection"
    
  - name: ForeignAssistance
    triggerPhrases:
      - "foreign assistance"
      - "grant audit"
```

**SAY:**
> "Topics help route conversations. When someone asks about 'embassy inspection,' the agent knows to activate that specialized knowledge area. This improves response quality."

**SHOW:**
```yaml
tools:
  - type: mcp
    url: "${MCP_SERVER_URL}"
```

**SAY:**
> "And here's the connection to your backend. The MCP URL points to your server. When the agent needs live data — case history, current policies, audit findings — it calls your tools."

### 3.2 How the MCP Server Works

**SAY:**
> "Let me show you what the MCP server looks like."

**SHOW (simplified code):**
```javascript
// MCP Server - Your Network
server.registerTool("audit_guidance", {
  description: "Get audit methodology guidance",
  inputSchema: {
    auditArea: z.string().describe("Area being audited")
  }
}, async ({ auditArea }) => {
  // Query your internal knowledge base
  const guidance = await queryAuditDatabase(auditArea);
  return { content: [{ type: "text", text: guidance }] };
});
```

**SAY:**
> "Each tool is a function. It takes structured input, queries your systems, and returns formatted results. You control the logic. You control the data access. The AI just calls the tool and uses the response."

### 3.3 Deployment Pipeline

**SAY:**
> "Here's how we deploy changes."

**SHOW:**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   AUTHOR    │    │   REVIEW    │    │   BUILD     │    │   DEPLOY    │
│             │    │             │    │             │    │             │
│ Edit YAML   │───▶│ Pull Request│───▶│  Validate   │───▶│ Copilot     │
│ in Git      │    │ + Approval  │    │  + Generate │    │ Studio      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Commands:**
```bash
# Generate Copilot Studio format from spec
af generate specs/state-oig-audit-assistant.yaml

# Deploy to Copilot Studio
af deploy specs/state-oig-audit-assistant.yaml --env production
```

**SAY:**
> "Author edits the YAML. It goes through code review. The build system validates and transforms it. Then it deploys to Copilot Studio.
>
> If something goes wrong, you can see exactly what changed and roll it back. That's the power of infrastructure as code."

---

## Part 4: Security and Compliance (5 minutes)

### 4.1 Data Sovereignty

**SAY:**
> "Let's address the security question directly."

**SHOW:**
```
WHAT LIVES WHERE:

COPILOT STUDIO (Microsoft Cloud/GCC):
├── Agent definitions (instructions, topics)
├── Conversation orchestration
├── Language understanding
└── Audit logs of all interactions

YOUR NETWORK:
├── MCP Server (you control)
├── Case files
├── Investigation data
├── Audit findings
├── Employee information
└── Sensitive policies
```

**SAY:**
> "The AI reasoning happens in Microsoft's cloud — that's Copilot Studio. But your sensitive data stays in your network. The MCP server is the gatekeeper.
>
> If someone asks about a case, the AI asks your server for information. Your server decides: Does this user have access? What data should I return? How much detail is appropriate?"

### 4.2 Audit and Logging

**SAY:**
> "Everything is logged."

**SHOW:**
```
AUDIT TRAIL:

Copilot Studio:
├── User identity (who asked)
├── Conversation transcript
├── Tool calls made
└── Timestamps

Your MCP Server:
├── Incoming requests
├── Authorization decisions
├── Data accessed
└── Responses returned
```

**SAY:**
> "You have complete visibility into who asked what and what the AI returned. This meets federal audit requirements."

### 4.3 GCC Deployment

**SAY:**
> "For classified or high-sensitivity environments, Copilot Studio is available in GCC and GCC-High. Same functionality, government-only infrastructure."

---

## Part 5: Roadmap and Next Steps (5 minutes)

### 5.1 Pilot Proposal

**SAY:**
> "Here's what a pilot could look like."

**SHOW:**
```
PHASE 1 (4 weeks): Proof of Concept
├── Deploy 3 agents to your GCC tenant
├── Stand up MCP server with sample data
├── Test with 5-10 pilot users (auditors + investigators)
└── Gather feedback

PHASE 2 (8 weeks): Integration
├── Connect MCP server to real data sources
│   ├── Audit findings database
│   ├── Case management system
│   └── FAM knowledge base
├── Expand to 50 users
└── Refine agent instructions based on feedback

PHASE 3 (ongoing): Production
├── Full deployment to OIG staff
├── CI/CD pipeline for agent updates
├── Regular review and improvement cycle
└── Expand to new use cases
```

### 5.2 Investment

**SAY:**
> "What does this cost?"

**SHOW:**
```
COSTS:

Copilot Studio:
├── Per-user licensing OR
├── Per-message pricing
└── Included in some M365 E5 bundles

MCP Server:
├── Your existing infrastructure
├── Minimal Azure resources if cloud-hosted
└── Development time for integrations

Our Support:
├── Architecture guidance
├── Agent development assistance
├── Best practices and templates
```

---

## Closing

**SAY:**
> "What we've shown today:
>
> 1. **Enterprise AI for OIG** — purpose-built agents for auditors, investigators, and foreign assistance analysts
> 2. **Data sovereignty** — your sensitive data stays in your network via MCP
> 3. **Infrastructure as code** — version-controlled, auditable, repeatable deployments
> 4. **GCC-ready** — FedRAMP authorized, government cloud available
>
> The question isn't whether AI will transform oversight work. It's whether you'll lead that transformation or follow.
>
> Let's talk about a pilot."

---

## Backup Q&A

**Q: "How do we ensure the AI doesn't hallucinate about regulations?"**
> "Three ways: First, we ground responses in your actual documents via MCP tools. Second, the agent instructions tell it to cite sources and say 'I don't know' when uncertain. Third, we can implement human-in-the-loop for sensitive guidance."

**Q: "What about classified information?"**
> "Copilot Studio in GCC-High can handle CUI and some classified workloads. For higher classifications, we'd need a different architecture. But for most OIG work, GCC is appropriate."

**Q: "How do we train the AI on our specific procedures?"**
> "The MCP server is the training mechanism. You expose your policies through tools, and the AI learns to use them. No need to 'train' a model — you're providing real-time access to authoritative sources."

**Q: "Who maintains this?"**
> "Your IT team manages the MCP server like any other application. Agent updates go through code review. Microsoft maintains Copilot Studio. It's a shared responsibility model."

**Q: "What if the AI gives bad advice and someone acts on it?"**
> "Same risk management as any decision support tool. The agent includes disclaimers about verifying guidance. Users should validate critical decisions. We can add approval workflows for high-stakes recommendations."

---

## Test Prompts

| Agent | Scenario | Prompt |
|-------|----------|--------|
| Audit | New inspection | "I'm doing my first embassy inspection. Where do I start?" |
| Audit | Risk assessment | "What are typical findings in overseas building operations?" |
| Audit | Standards | "What GAGAS requirements apply to performance audits?" |
| Investigator | Hotline | "Complaint: contracting officer taking kickbacks from vendor" |
| Investigator | Fraud indicators | "Red flags for grant fraud in conflict zones?" |
| Investigator | Interview | "Questions for interviewing a whistleblower about procurement fraud" |
| Foreign Assistance | Compliance | "What does 2 CFR 200 require for subaward monitoring?" |
| Foreign Assistance | Risk | "High-risk country assessment for new implementing partner" |
| Foreign Assistance | Effectiveness | "How do I evaluate if a democracy program is working?" |

---

## Resources

| Resource | URL |
|----------|-----|
| MCP Server | https://mcp-analyst.turek.in/mcp |
| Agent Factory | https://github.com/johnturek/agent-factory |
| This Script | https://github.com/johnturek/agent-factory/blob/master/docs/state-oig-demo-script.md |
| Copilot Studio Docs | https://learn.microsoft.com/en-us/microsoft-copilot-studio |

---

## State OIG Context

**Mission:** Conduct independent audits, inspections, evaluations, and investigations to promote economy and efficiency and to prevent and detect waste, fraud, abuse, and mismanagement.

**Oversight Scope:**
- Department of State
- U.S. Agency for Global Media (USAGM)
- U.S. International Boundary and Water Commission (IBWC)
- (Soon) Elements of USAID following integration

**Key Work Products:**
- Embassy and consulate inspections
- Financial statement audits
- Foreign assistance program audits
- Investigations of fraud, waste, abuse
- Management challenge reports
- Congressional testimony

**Regulatory Framework:**
- Inspector General Act of 1978
- Foreign Service Act of 1980
- Foreign Affairs Manual (FAM)
- 2 CFR 200 / 2 CFR 600
- GAGAS (Yellow Book)

---

*Demo script by JTBotFather | Created: 2026-02-12*
