#!/usr/bin/env node

/**
 * Agent Factory CLI
 * 
 * Commands:
 *   af validate <spec>     - Validate agent spec against schema
 *   af generate <spec>     - Generate Copilot Studio template from spec
 *   af deploy <template>   - Deploy template to Power Platform environment
 *   af test <template>     - Run automated tests against deployed agent
 *   af package <template>  - Package as Power Platform solution
 *   af cleanup <template>  - Remove test deployment
 */

const { program } = require('commander');
const path = require('path');
const fs = require('fs');

// Version from package.json
const pkg = require('../package.json');

program
  .name('af')
  .description('Agent Factory - AI-Driven Agent Creation Platform')
  .version(pkg.version);

// Validate command
program
  .command('validate <specs...>')
  .description('Validate agent spec files against schema')
  .option('-s, --schema <path>', 'Custom schema file')
  .action(async (specs, options) => {
    console.log('🔍 Validating specs...');
    const { validate } = require('../lib/validate');
    
    for (const specPath of specs) {
      try {
        const result = await validate(specPath, options.schema);
        if (result.valid) {
          console.log(`  ✅ ${specPath}`);
        } else {
          console.log(`  ❌ ${specPath}`);
          result.errors.forEach(err => console.log(`     - ${err}`));
          process.exitCode = 1;
        }
      } catch (err) {
        console.log(`  ❌ ${specPath}: ${err.message}`);
        process.exitCode = 1;
      }
    }
  });

// Generate command
program
  .command('generate <specs...>')
  .description('Generate Copilot Studio templates from specs')
  .option('-o, --output <path>', 'Output file or directory', 'templates/')
  .action(async (specs, options) => {
    console.log('⚙️  Generating templates...');
    const { generate } = require('../lib/generate');
    const yaml = require('js-yaml');
    
    for (const specPath of specs) {
      try {
        // Load and parse spec YAML
        const specContent = fs.readFileSync(specPath, 'utf8');
        const spec = yaml.load(specContent);
        
        // Generate Copilot Studio template
        const template = generate(spec);
        
        // Determine output path
        let outputPath = options.output;
        if (outputPath.endsWith('/')) {
          // Directory mode - use spec name
          const baseName = path.basename(specPath, '.yaml');
          outputPath = path.join(outputPath, `${baseName}-template.yaml`);
        }
        
        // Ensure output directory exists
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        
        // Write template
        fs.writeFileSync(outputPath, template);
        console.log(`  ✅ ${specPath} → ${outputPath}`);
      } catch (err) {
        console.log(`  ❌ ${specPath}: ${err.message}`);
        process.exitCode = 1;
      }
    }
  });

// Deploy command
program
  .command('deploy <templates...>')
  .description('Deploy templates to Power Platform environment')
  .requiredOption('-e, --env <environment>', 'Target environment (test|staging|prod)')
  .option('--solution <name>', 'Solution name')
  .action(async (templates, options) => {
    console.log(`🚀 Deploying to ${options.env}...`);
    const { deploy } = require('../lib/deploy');
    
    for (const templatePath of templates) {
      try {
        const result = await deploy(templatePath, options);
        console.log(`  ✅ ${templatePath} → ${result.schemaName}`);
      } catch (err) {
        console.log(`  ❌ ${templatePath}: ${err.message}`);
        process.exitCode = 1;
      }
    }
  });

// Test command
program
  .command('test <templates...>')
  .description('Run automated tests against deployed agents')
  .requiredOption('-e, --env <environment>', 'Target environment')
  .option('--scenarios <path>', 'Test scenarios file')
  .action(async (templates, options) => {
    console.log(`🧪 Testing in ${options.env}...`);
    const { test } = require('../lib/test');
    
    for (const templatePath of templates) {
      try {
        const results = await test(templatePath, options);
        const passed = results.filter(r => r.passed).length;
        const total = results.length;
        console.log(`  ${passed === total ? '✅' : '❌'} ${templatePath}: ${passed}/${total} tests passed`);
        if (passed !== total) process.exitCode = 1;
      } catch (err) {
        console.log(`  ❌ ${templatePath}: ${err.message}`);
        process.exitCode = 1;
      }
    }
  });

// Package command
program
  .command('package <templates...>')
  .description('Package templates as Power Platform solutions')
  .option('-o, --output <dir>', 'Output directory', 'releases/')
  .action(async (templates, options) => {
    console.log('📦 Packaging solutions...');
    const { pack } = require('../lib/package');
    
    for (const templatePath of templates) {
      try {
        const zipPath = await pack(templatePath, options.output);
        console.log(`  ✅ ${templatePath} → ${zipPath}`);
      } catch (err) {
        console.log(`  ❌ ${templatePath}: ${err.message}`);
        process.exitCode = 1;
      }
    }
  });

// Cleanup command
program
  .command('cleanup <templates...>')
  .description('Remove test deployments from environment')
  .requiredOption('-e, --env <environment>', 'Target environment')
  .action(async (templates, options) => {
    console.log(`🧹 Cleaning up ${options.env}...`);
    const { cleanup } = require('../lib/cleanup');
    
    for (const templatePath of templates) {
      try {
        await cleanup(templatePath, options);
        console.log(`  ✅ ${templatePath} removed`);
      } catch (err) {
        console.log(`  ❌ ${templatePath}: ${err.message}`);
        process.exitCode = 1;
      }
    }
  });

// Init command - create new agent spec
program
  .command('init [name]')
  .description('Create a new agent spec from template')
  .option('-t, --template <type>', 'Template type', 'basic')
  .option('-c, --cloud <cloud>', 'Target cloud', 'commercial')
  .action(async (name, options) => {
    console.log('📝 Creating new agent spec...');
    const { init } = require('../lib/init');
    
    try {
      const specPath = await init(name, options);
      console.log(`  ✅ Created ${specPath}`);
      console.log(`  📖 Edit the file and run: af validate ${specPath}`);
    } catch (err) {
      console.log(`  ❌ ${err.message}`);
      process.exitCode = 1;
    }
  });

program.parse();
