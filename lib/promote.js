const fs = require("fs");
const path = require("path");

function promote(fromEnv, toEnv, approver) {
  console.log(`Promoting deployment from ${fromEnv} to ${toEnv}...`);
  
  if (!approver) {
    console.error("Promotion requires an approver (--approver flag).");
    return;
  }

  // Simulated promotion validation
  const historyPath = path.join("history", `${fromEnv}-deployments.json`);

  if (!fs.existsSync(historyPath)) {
    console.error(`Deployment history for ${fromEnv} not found.`);
    return;
  }

  const deployments = JSON.parse(fs.readFileSync(historyPath, "utf8"));
  
  // Basic compatibility check
  const isValid = deployments.every(dep => dep.status === "success");

  if (!isValid) {
    console.error("Not all deployments are valid for promotion.");
    return;
  }

  // Record the promotion
  const promotionLog = {
    promotedAt: new Date().toISOString(),
    from: fromEnv,
    to: toEnv,
    approver: approver
  };

  fs.appendFileSync("promotions.log", JSON.stringify(promotionLog) + "\n");
  console.log("Promotion logged.");
}

module.exports = { promote };