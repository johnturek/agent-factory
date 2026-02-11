/**
 * Spec Validation
 * 
 * Validates agent specs against the schema
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const Ajv = require('ajv');

// Default schema path
const DEFAULT_SCHEMA = path.join(__dirname, '../docs/agent-spec-schema.yaml');

/**
 * Validate an agent spec file
 * @param {string} specPath - Path to the spec file
 * @param {string} [schemaPath] - Optional custom schema path
 * @returns {Promise<{valid: boolean, errors: string[]}>}
 */
async function validate(specPath, schemaPath = DEFAULT_SCHEMA) {
  // Read spec file
  const specContent = fs.readFileSync(specPath, 'utf-8');
  const spec = yaml.parse(specContent);
  
  // Read schema
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  const schema = yaml.parse(schemaContent);
  
  // Validate with AJV
  const ajv = new Ajv({ allErrors: true });
  const validateFn = ajv.compile(schema);
  const valid = validateFn(spec);
  
  if (valid) {
    return { valid: true, errors: [] };
  }
  
  // Format errors
  const errors = validateFn.errors.map(err => {
    const path = err.instancePath || '/';
    return `${path}: ${err.message}`;
  });
  
  return { valid: false, errors };
}

module.exports = { validate };
