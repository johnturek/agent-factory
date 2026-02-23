const schema = {
  type: "object",
  properties: {
    agentName: { type: "string" },
    description: { type: "string" },
    instructions: { type: "string" },
    compliance: {
      type: "object",
      properties: {
        dataClassification: { enum: ["CUI", "PII", "Public", "FOUO"] },
        piiHandling: { enum: ["none", "masked", "encrypted", "prohibited"] },
        requiredDisclaimer: { type: "string" },
        escalationPath: { enum: ["human-in-loop", "supervisor", "none"] },
        retentionPolicy: { enum: ["30d", "90d", "1y", "7y"] },
        auditLevel: { enum: ["basic", "enhanced", "full"] }
      },
      required: ["dataClassification", "piiHandling", "requiredDisclaimer", "escalationPath", "retentionPolicy", "auditLevel"]
    },
    guardrails: {
      type: "array",
      items: { type: "string" }
    },
    topics: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["agentName", "description", "instructions", "compliance", "topics"]
};

module.exports = schema;