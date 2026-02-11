/**
 * Template Generation
 * 
 * Transforms Agent Factory specs into Copilot Studio templates
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

/**
 * Generate Copilot Studio template from agent spec
 * @param {string} specPath - Path to the agent spec
 * @param {string} outputDir - Output directory
 * @returns {Promise<string>} - Path to generated template
 */
async function generate(specPath, outputDir) {
  // Read and parse spec
  const specContent = fs.readFileSync(specPath, 'utf-8');
  const spec = yaml.parse(specContent);
  
  const agentName = spec.metadata.name;
  const templateDir = path.join(outputDir, agentName);
  
  // Create output directory
  fs.mkdirSync(templateDir, { recursive: true });
  
  // Generate Copilot Studio template YAML
  const csTemplate = transformToCopilotStudio(spec);
  
  // Write template
  const templatePath = path.join(templateDir, `${agentName}.yaml`);
  fs.writeFileSync(templatePath, yaml.stringify(csTemplate));
  
  // Generate manifest
  const manifest = generateManifest(spec);
  const manifestPath = path.join(templateDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  // Generate any referenced flows
  if (spec.spec.flows) {
    const flowsDir = path.join(templateDir, 'flows');
    fs.mkdirSync(flowsDir, { recursive: true });
    // TODO: Generate flow definitions
  }
  
  // Generate any custom connectors
  if (spec.spec.connectors?.some(c => c.type === 'custom')) {
    const connectorsDir = path.join(templateDir, 'connectors');
    fs.mkdirSync(connectorsDir, { recursive: true });
    // TODO: Generate connector definitions
  }
  
  return templateDir;
}

/**
 * Transform Agent Factory spec to Copilot Studio template format
 * This is the core transformation logic
 */
function transformToCopilotStudio(spec) {
  const { metadata, spec: agentSpec } = spec;
  
  // Base template structure (based on pac copilot extract-template output)
  const template = {
    templateName: metadata.name,
    templateVersion: metadata.version,
    botDefinition: {
      schemaName: `msdyn_${metadata.name.replace(/-/g, '_')}`,
      displayName: metadata.displayName || metadata.name,
      description: metadata.description,
      language: 'en-US',
      // System instructions
      instructions: agentSpec.instructions || '',
      // Topics
      topics: (agentSpec.topics || []).map(topic => ({
        name: topic.name,
        description: topic.description,
        triggers: {
          phrases: topic.triggers || []
        },
        // Actions get transformed to Copilot Studio action nodes
        nodes: transformActions(topic.actions || [])
      })),
      // Knowledge sources
      knowledge: {
        sources: (agentSpec.knowledge || []).map(k => transformKnowledge(k))
      }
    },
    // Cloud-specific settings
    cloudSettings: getCloudSettings(metadata.cloud),
    // Security settings
    security: agentSpec.security || {},
    // Deployment channels
    channels: agentSpec.deployment?.channels || ['teams']
  };
  
  return template;
}

/**
 * Transform actions to Copilot Studio node format
 */
function transformActions(actions) {
  return actions.map((action, index) => {
    if (typeof action === 'string') {
      return {
        id: `action_${index}`,
        type: 'action',
        name: action
      };
    }
    
    return {
      id: `action_${index}`,
      type: action.type || 'action',
      name: action.name,
      ref: action.ref,
      parameters: action.parameters || {}
    };
  });
}

/**
 * Transform knowledge source to Copilot Studio format
 */
function transformKnowledge(knowledge) {
  switch (knowledge.type) {
    case 'sharepoint':
      return {
        type: 'SharePoint',
        siteUrl: knowledge.site
      };
    case 'dataverse':
      return {
        type: 'Dataverse',
        tableName: knowledge.table
      };
    case 'website':
      return {
        type: 'Website',
        url: knowledge.url
      };
    default:
      return {
        type: knowledge.type,
        ...knowledge
      };
  }
}

/**
 * Get cloud-specific Power Platform settings
 */
function getCloudSettings(cloud) {
  const settings = {
    commercial: {
      cloud: 'Public',
      apiEndpoint: 'https://api.powerplatform.com'
    },
    gcc: {
      cloud: 'UsGov',
      apiEndpoint: 'https://gov.api.powerplatform.us'
    },
    gcch: {
      cloud: 'UsGovHigh',
      apiEndpoint: 'https://high.api.powerplatform.us'
    },
    dod: {
      cloud: 'UsGovDoD',
      apiEndpoint: 'https://api.appsplatform.us'
    }
  };
  
  return settings[cloud] || settings.commercial;
}

/**
 * Generate manifest file for the template package
 */
function generateManifest(spec) {
  return {
    name: spec.metadata.name,
    displayName: spec.metadata.displayName || spec.metadata.name,
    version: spec.metadata.version,
    description: spec.metadata.description,
    cloud: spec.metadata.cloud || 'commercial',
    authors: spec.metadata.authors || [],
    tags: spec.metadata.tags || [],
    generatedAt: new Date().toISOString(),
    generatedBy: 'Agent Factory',
    components: {
      agent: true,
      flows: (spec.spec.flows || []).length,
      connectors: (spec.spec.connectors || []).filter(c => c.type === 'custom').length
    }
  };
}

module.exports = { generate };
