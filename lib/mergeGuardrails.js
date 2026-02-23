const fs = require("fs");
const yaml = require("js-yaml");

function mergeGuardrails(instructions, guardrailPaths) {
  if (!guardrailPaths || guardrailPaths.length === 0) return instructions;

  let guardrailText = "\n";

  for (const path of guardrailPaths) {
    try {
      const content = fs.readFileSync(`guardrails/${path}.yaml`, "utf8");
      const guardrail = yaml.load(content);
      guardrailText += "\n" + guardrail.policies.join("\n") + "\n";
    } catch (error) {
      console.error(`Failed to load guardrail: ${path}`, error);
    }
  }

  return instructions + "\n\nGuardrails:\n" + guardrailText;
}

module.exports = { mergeGuardrails };