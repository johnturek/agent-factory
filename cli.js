#!/usr/bin/env node

const { program } = require('commander');
const { generateAuditReport } = require('./lib/audit');
const { deploy } = require('./lib/deploy');

program
  .command('audit-report <spec>')
  .description('Generate an audit report for a given agent specification')
  .option('-o, --output <path>', 'Output file path', 'manifest.json')
  .action((spec, options) => {
    generateAuditReport(spec, options.output);
  });

program
  .command('deploy <templatePath>')
  .description('Deploy an agent template to the specified environment')
  .option('--env <environment>', 'Target environment (e.g., commercial, gcc, gcc-high, dod)', 'commercial')
  .action((templatePath, options) => {
    deploy(templatePath, options);
  });

program
  .command('promote')
  .description('Promote a deployment from one environment to another')
  .option('--from <fromEnv>', 'Source environment')
  .option('--to <toEnv>', 'Target environment')
  .option('--approver <email>', 'Approver email')
  .action((options) => {
    require('./lib/promote').promote(options.from, options.to, options.approver);
  });

program.parse(process.argv);