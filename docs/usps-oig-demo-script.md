# USPS OIG Demo Script - Copilot Studio + MCP

## The Audience
**USPS Office of Inspector General** — auditors and special agents who:
- Conduct independent audits of USPS programs and operations
- Investigate fraud, waste, abuse, and misconduct
- Oversee $78B in revenue, 635K employees, 31K facilities
- Handle contract fraud, financial fraud, mail theft, narcotics, healthcare fraud, cyber crimes

---

## The Problem (Your Opening)

**SAY:**
> "Your auditors and investigators are drowning in information. You've got audit standards, postal regulations, prior findings, case files, interview notes — and your people spend hours just finding the right reference or figuring out what's been done before.
>
> What if your team had an AI assistant that actually knows postal policy, understands audit methodology, and can help triage cases in seconds instead of hours?
>
> Let me show you what's possible."

---

## DEMO FLOW (15-20 minutes)

### ACT 1: The Auditor's Assistant (5 min)

**SAY:**
> "Let's say I'm an auditor starting a new engagement — reviewing mail processing efficiency at a distribution center."

**TYPE:**
```
I'm starting an audit of mail processing operations at a distribution center. What audit standards apply and what should my risk assessment cover?
```

**EXPECTED:** The bot explains GAGAS (Generally Accepted Government Auditing Standards), key risk areas for mail processing (throughput, misrouting, overtime costs, equipment maintenance), and suggests audit objectives.

**SAY:**
> "In 10 seconds, we've got a framework that would normally take a new auditor hours to pull together. And this is connected to YOUR policy database — not just generic ChatGPT knowledge."

---

**TYPE:**
```
What are the most common findings in USPS mail processing audits from the past 3 years?
```

**EXPECTED:** Returns categorized findings — delayed mail, equipment downtime, staffing inefficiencies, service standard failures.

**SAY:**
> "This is pulling from your historical audit database. Your institutional knowledge, instantly accessible. New auditors can learn from 20 years of findings in minutes."

---

### ACT 2: The Investigator's Partner (5 min)

**SAY:**
> "Now let's switch to investigations. I'm a special agent, and I just received a tip on the OIG hotline."

**TYPE:**
```
I received a hotline complaint alleging that a supervisor at a delivery unit is stealing gift cards from packages. What are my next steps for case intake?
```

**EXPECTED:** Returns intake checklist — document complainant info, assess credibility, check for prior complaints on this employee, determine jurisdiction (internal mail theft = OIG), identify evidence preservation needs, preliminary case classification.

**SAY:**
> "Instant case intake guidance. The bot knows this is internal mail theft — that's OIG jurisdiction, not Postal Inspection Service. It's already thinking about evidence preservation."

---

**TYPE:**
```
What questions should I ask when interviewing the complainant about suspected mail theft?
```

**EXPECTED:** Structured interview guide — timeline questions, specific observations, potential witnesses, documentation they may have, how they learned about the theft.

**SAY:**
> "Interview prep in seconds. Your agents spend less time on admin and more time investigating."

---

### ACT 3: Contract Fraud Detection (3 min)

**SAY:**
> "Contract fraud is one of your biggest program areas. Let's see how AI can help spot red flags."

**TYPE:**
```
I'm reviewing a $5M IT services contract. The same vendor has won the last 4 task orders with bids that are always 2% below the next competitor. What fraud indicators should I look for?
```

**EXPECTED:** Red flags — bid rigging patterns, potential collusion, check for relationships between contracting officer and vendor, review bid timing, examine subcontractor arrangements, compare to independent cost estimates.

**SAY:**
> "Pattern recognition that would take a human analyst days to spot. The AI is trained on federal fraud indicators — it knows what doesn't smell right."

---

### ACT 4: Healthcare Fraud Triage (3 min)

**SAY:**
> "Healthcare fraud — both providers and claimants — is another major area. Let's see the triage capability."

**TYPE:**
```
We have a workers' comp claim from an employee alleging a back injury from lifting packages. They've been out for 18 months. What should we look for to assess legitimacy?
```

**EXPECTED:** Investigation angles — surveillance considerations, social media review, medical record consistency, comparison to similar claims, return-to-work program compliance, IME (Independent Medical Examination) results.

**SAY:**
> "This is about prioritizing your caseload. AI can help triage hundreds of claims to find the ones that warrant full investigation."

---

### ACT 5: Under the Hood (2 min)

**SAY:**
> "So what's actually happening here? Let me show you the architecture."

**SHOW:**
```
┌─────────────────────┐
│   Copilot Studio    │
│   (Your AI Agent)   │
└──────────┬──────────┘
           │ MCP Protocol (secure HTTPS)
           ▼
┌─────────────────────┐
│  Your MCP Server    │
│  (In your network)  │
│  - Audit standards  │
│  - Case intake      │
│  - Prior findings   │
│  - Fraud indicators │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Your Data Sources  │
│  - Case management  │
│  - Audit findings DB│
│  - Policy library   │
│  - HR records       │
└─────────────────────┘
```

**SAY:**
> "The AI agent runs in Microsoft's cloud — Copilot Studio. But all your sensitive data stays in YOUR network. The MCP server is the bridge. It only exposes the tools and data you choose to expose.
>
> No case files go to OpenAI. No PII leaves your boundary. The AI just calls your APIs."

---

### ACT 6: The Deployment Story (2 min)

**SAY:**
> "And here's the really cool part — we can deploy this using code."

**SHOW: Agent Factory example**
```yaml
name: USPS OIG Investigator Assistant
description: AI assistant for OIG auditors and investigators

instructions: |
  You are an assistant for USPS OIG auditors and special agents.
  Help with audit planning, investigation intake, fraud detection,
  and policy lookups. Always cite your sources.
  
tools:
  - type: mcp
    url: https://your-internal-server/oig-mcp
```

**SAY:**
> "That's the entire agent definition. Version controlled, auditable, repeatable. When your policies change, you update the code and redeploy. No clicking through UIs."

---

## CLOSING

**SAY:**
> "What we've shown today:
> 
> 1. **Audit support** — standards, risk assessment, historical findings
> 2. **Investigation intake** — case triage, interview prep, jurisdiction routing
> 3. **Fraud detection** — pattern recognition, red flag identification
> 4. **Healthcare claims triage** — prioritizing your caseload
> 
> All running on Microsoft's secure cloud, with YOUR data staying in YOUR network.
>
> This isn't science fiction. We built this demo in an afternoon. Imagine what we could do with a proper pilot."

---

## BACKUP Q&A

**Q: "How does this connect to our case management system?"**
> "The MCP server is custom code that your team controls. It can connect to any system with an API — your case management, document storage, HR systems. We help you design that integration."

**Q: "What about FedRAMP?"**
> "Copilot Studio is FedRAMP authorized. The MCP server runs in your environment. We can architect this for GCC or GCC-High if needed."

**Q: "Can the AI access sensitive case files?"**
> "Only what you expose through the MCP server. You control the data access layer. The AI never sees raw case files — it sees the structured responses your server provides."

**Q: "How do we prevent the AI from hallucinating?"**
> "Two ways: First, we ground it in your actual data through MCP tools. Second, the system prompt instructs it to cite sources and say 'I don't know' when uncertain. We can also implement human-in-the-loop for sensitive actions."

**Q: "What about audit trail and accountability?"**
> "Every MCP call is logged. Every AI interaction is logged in Copilot Studio. You have full audit trail of who asked what and what the AI returned."

**Q: "How much does this cost?"**
> "Copilot Studio licensing plus your infrastructure for the MCP server. For a pilot, we're talking minimal Azure spend. Happy to do a cost estimate."

---

## TEST PROMPTS

| Scenario | Prompt |
|----------|--------|
| Audit planning | "I'm auditing vehicle maintenance at USPS. What should I look for?" |
| Investigation intake | "Hotline tip: carrier is running a personal business during work hours" |
| Contract fraud | "Review this scenario: sole source justification for $2M IT contract to former employee's company" |
| Healthcare fraud | "Claimant has been on OWCP for 3 years with soft tissue injury. What's the playbook?" |
| Policy lookup | "What are the Postal Service's rules on employee moonlighting?" |
| Prior findings | "What audit findings has OIG issued about retail operations?" |

---

## URLS

| Resource | URL |
|----------|-----|
| MCP Server | https://mcp-analyst.turek.in/mcp |
| Agent Factory | https://github.com/johnturek/agent-factory |
| This Script | https://github.com/johnturek/agent-factory/blob/master/docs/usps-oig-demo-script.md |

---

## KEY USPS OIG CONTEXT

**Office of Audit:**
- Independent audits of USPS and Postal Regulatory Commission
- Field operations reviews at plants and delivery units
- Focus: economy, efficiency, effectiveness, program integrity

**Office of Investigations (Program Areas):**
- Contract Fraud
- Financial Fraud
- Narcotics
- Internal Mail Theft
- Official Misconduct
- Health Care Provider Fraud
- Health Care Claimant Fraud
- Cyber Crimes Unit

**Scale:**
- $78B USPS revenue
- 635,000 employees
- 127 billion pieces of mail/year
- 165 million delivery points
- 236,000 vehicles
- 31,000 facilities

**Inspector General:** Tammy Hull (since 2018, reappointed through 2032)

---

*Demo script by JTBotFather | Created: 2026-02-11*
