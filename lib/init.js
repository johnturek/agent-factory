/**
 * Init Module
 * 
 * Creates new agent specs from templates
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const TEMPLATES = {
  basic: {
    apiVersion: 'agentfactory.microsoft.com/v1',
    kind: 'Agent',
    metadata: {
      name: 'my-agent',
      displayName: 'My Agent',
      version: '1.0.0',
      description: 'Description of what this agent does',
      cloud: 'commercial'
    },
    spec: {
      instructions: 'You are a helpful assistant.',
      capabilities: ['q_and_a'],
      topics: [
        {
          name: 'Greeting',
          triggers: ['hello', 'hi', 'hey'],
          actions: []
        }
      ]
    }
  }
};

async function init(name, options) {
  const { template, cloud } = options;
  
  // Get base template
  const baseTemplate = TEMPLATES[template] || TEMPLATES.basic;
  
  // Customize
  const spec = JSON.parse(JSON.stringify(baseTemplate));
  if (name) {
    spec.metadata.name = name;
    spec.metadata.displayName = name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  spec.metadata.cloud = cloud;
  
  // Write file
  const fileName = `${spec.metadata.name}.yaml`;
  const filePath = path.join('specs', fileName);
  
  fs.mkdirSync('specs', { recursive: true });
  fs.writeFileSync(filePath, yaml.stringify(spec));
  
  return filePath;
}

module.exports = { init };
