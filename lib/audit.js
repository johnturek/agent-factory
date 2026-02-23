const fs = require("fs");
const crypto = require("crypto");

function generateAuditReport(specPath, outputPath) {
  const specContent = fs.readFileSync(specPath, "utf-8");
  const specHash = crypto.createHash("sha256").update(specContent).digest("hex");
  const spec = JSON.parse(specContent);

  const report = {
    generatedAt: new Date().toISOString(),
    generatedBy: process.env.USER || "unknown",
    specFile: specPath,
    specVersion: specHash,
    agentName: spec.agentName,
    compliance: spec.compliance,
    deployments: [],
    changes: []
  };

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`Audit report generated at ${outputPath}`);
}

module.exports = { generateAuditReport };