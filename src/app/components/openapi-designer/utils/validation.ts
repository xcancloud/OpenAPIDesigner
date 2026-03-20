import type { OpenAPIDocument, ValidationError, OperationObject, HttpMethod, SchemaObject } from '../types/openapi';
import { HTTP_METHODS } from '../types/openapi';

export function validateDocument(doc: OpenAPIDocument): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!doc.openapi) {
    errors.push({ path: 'openapi', message: 'OpenAPI version is required', severity: 'error' });
  } else if (!doc.openapi.startsWith('3.1')) {
    errors.push({ path: 'openapi', message: `OpenAPI version should be 3.1.x, got ${doc.openapi}`, severity: 'warning' });
  }

  if (!doc.info) {
    errors.push({ path: 'info', message: 'Info object is required', severity: 'error' });
  } else {
    if (!doc.info.title) {
      errors.push({ path: 'info.title', message: 'API title is required', severity: 'error' });
    }
    if (!doc.info.version) {
      errors.push({ path: 'info.version', message: 'API version is required', severity: 'error' });
    }
    if (doc.info.contact?.email && !isValidEmail(doc.info.contact.email)) {
      errors.push({ path: 'info.contact.email', message: 'Invalid email format', severity: 'warning' });
    }
    if (doc.info.contact?.url && !isValidUrl(doc.info.contact.url)) {
      errors.push({ path: 'info.contact.url', message: 'Invalid URL format', severity: 'warning' });
    }
    if (doc.info.termsOfService && !isValidUrl(doc.info.termsOfService)) {
      errors.push({ path: 'info.termsOfService', message: 'Terms of Service should be a valid URL', severity: 'warning' });
    }
  }

  // Servers validation
  if (doc.servers) {
    doc.servers.forEach((server, i) => {
      if (!server.url) {
        errors.push({ path: `servers[${i}].url`, message: 'Server URL is required', severity: 'error' });
      }
      // Validate server variables
      if (server.variables) {
        const urlVars = server.url.match(/\{([^}]+)\}/g)?.map(v => v.slice(1, -1)) || [];
        Object.entries(server.variables).forEach(([varName, variable]) => {
          if (!urlVars.includes(varName)) {
            errors.push({ path: `servers[${i}].variables.${varName}`, message: `Server variable "${varName}" is not referenced in the URL`, severity: 'warning' });
          }
          if (variable.default === undefined || variable.default === null) {
            errors.push({ path: `servers[${i}].variables.${varName}.default`, message: 'Server variable must have a default value', severity: 'error' });
          }
          if (variable.enum && variable.enum.length > 0 && !variable.enum.includes(variable.default)) {
            errors.push({ path: `servers[${i}].variables.${varName}.default`, message: 'Server variable default must be in the enum list', severity: 'error' });
          }
        });
      }
    });
  }

  // Paths validation
  if (doc.paths) {
    const operationIds = new Set<string>();
    Object.entries(doc.paths).forEach(([path, pathItem]) => {
      if (!path.startsWith('/')) {
        errors.push({ path: `paths.${path}`, message: 'Path must start with /', severity: 'error' });
      }

      // Check for path parameters
      const pathParams = path.match(/\{([^}]+)\}/g)?.map(p => p.slice(1, -1)) || [];

      HTTP_METHODS.forEach((method) => {
        const operation = pathItem[method] as OperationObject | undefined;
        if (!operation) return;

        const opPath = `paths.${path}.${method}`;

        // Check operationId uniqueness
        if (operation.operationId) {
          if (operationIds.has(operation.operationId)) {
            errors.push({ path: `${opPath}.operationId`, message: `Duplicate operationId: ${operation.operationId}`, severity: 'error' });
          }
          operationIds.add(operation.operationId);
        } else {
          errors.push({ path: `${opPath}.operationId`, message: 'operationId is recommended', severity: 'info' });
        }

        // Check path parameters are defined
        pathParams.forEach(param => {
          const hasParam = operation.parameters?.some(p => p.name === param && p.in === 'path');
          const hasPathLevelParam = pathItem.parameters?.some(p => p.name === param && p.in === 'path');
          if (!hasParam && !hasPathLevelParam) {
            errors.push({
              path: `${opPath}.parameters`,
              message: `Path parameter "{${param}}" is not defined in parameters`,
              severity: 'error',
            });
          }
        });

        // Check responses
        if (!operation.responses || Object.keys(operation.responses).length === 0) {
          errors.push({ path: `${opPath}.responses`, message: 'At least one response is required', severity: 'warning' });
        }

        // Check parameters
        operation.parameters?.forEach((param, pi) => {
          if (!param.name) {
            errors.push({ path: `${opPath}.parameters[${pi}].name`, message: 'Parameter name is required', severity: 'error' });
          }
          if (param.in === 'path' && !param.required) {
            errors.push({ path: `${opPath}.parameters[${pi}].required`, message: 'Path parameters must be required', severity: 'error' });
          }
        });

        // Validate request body
        if (operation.requestBody) {
          const content = operation.requestBody.content;
          if (!content || Object.keys(content).length === 0) {
            errors.push({ path: `${opPath}.requestBody.content`, message: 'Request body must have at least one media type', severity: 'error' });
          }
        }

        // Validate operation-level security references
        if (operation.security) {
          operation.security.forEach((requirement, si) => {
            Object.keys(requirement).forEach(schemeName => {
              if (!doc.components?.securitySchemes?.[schemeName]) {
                errors.push({
                  path: `${opPath}.security[${si}].${schemeName}`,
                  message: `Security scheme "${schemeName}" is not defined in components.securitySchemes`,
                  severity: 'error',
                });
              }
            });
          });
        }
      });
    });
  }

  // Schema validation
  if (doc.components?.schemas) {
    Object.entries(doc.components.schemas).forEach(([name, schema]) => {
      if (!schema.type && !schema.$ref && !schema.allOf && !schema.oneOf && !schema.anyOf) {
        errors.push({ path: `components.schemas.${name}`, message: 'Schema should have a type, $ref, or composition keyword', severity: 'info' });
      }
      validateSchemaConstraints(schema, `components.schemas.${name}`, errors);
    });
  }

  // Security schemes validation
  if (doc.components?.securitySchemes) {
    Object.entries(doc.components.securitySchemes).forEach(([name, scheme]) => {
      if (scheme.type === 'apiKey') {
        if (!scheme.name) {
          errors.push({ path: `components.securitySchemes.${name}.name`, message: 'API Key name is required', severity: 'error' });
        }
        if (!scheme.in) {
          errors.push({ path: `components.securitySchemes.${name}.in`, message: 'API Key location (in) is required', severity: 'error' });
        }
      }
      if (scheme.type === 'http' && !scheme.scheme) {
        errors.push({ path: `components.securitySchemes.${name}.scheme`, message: 'HTTP scheme is required', severity: 'error' });
      }
      if (scheme.type === 'oauth2') {
        if (!scheme.flows || Object.keys(scheme.flows).length === 0) {
          errors.push({ path: `components.securitySchemes.${name}.flows`, message: 'OAuth2 must define at least one flow', severity: 'error' });
        } else {
          if (scheme.flows.authorizationCode) {
            if (!scheme.flows.authorizationCode.authorizationUrl) {
              errors.push({ path: `components.securitySchemes.${name}.flows.authorizationCode.authorizationUrl`, message: 'Authorization URL is required for authorization code flow', severity: 'error' });
            }
            if (!scheme.flows.authorizationCode.tokenUrl) {
              errors.push({ path: `components.securitySchemes.${name}.flows.authorizationCode.tokenUrl`, message: 'Token URL is required for authorization code flow', severity: 'error' });
            }
          }
          if (scheme.flows.implicit && !scheme.flows.implicit.authorizationUrl) {
            errors.push({ path: `components.securitySchemes.${name}.flows.implicit.authorizationUrl`, message: 'Authorization URL is required for implicit flow', severity: 'error' });
          }
          if (scheme.flows.password && !scheme.flows.password.tokenUrl) {
            errors.push({ path: `components.securitySchemes.${name}.flows.password.tokenUrl`, message: 'Token URL is required for password flow', severity: 'error' });
          }
          if (scheme.flows.clientCredentials && !scheme.flows.clientCredentials.tokenUrl) {
            errors.push({ path: `components.securitySchemes.${name}.flows.clientCredentials.tokenUrl`, message: 'Token URL is required for client credentials flow', severity: 'error' });
          }
        }
      }
      if (scheme.type === 'openIdConnect' && !scheme.openIdConnectUrl) {
        errors.push({ path: `components.securitySchemes.${name}.openIdConnectUrl`, message: 'OpenID Connect URL is required', severity: 'error' });
      }
    });
  }

  // Global security references
  if (doc.security) {
    doc.security.forEach((requirement, i) => {
      Object.keys(requirement).forEach(name => {
        if (!doc.components?.securitySchemes?.[name]) {
          errors.push({
            path: `security[${i}].${name}`,
            message: `Security scheme "${name}" is not defined in components.securitySchemes`,
            severity: 'error',
          });
        }
      });
    });
  }

  // Tags - check for unused tags
  if (doc.tags && doc.paths) {
    const usedTags = new Set<string>();
    Object.values(doc.paths).forEach(pathItem => {
      HTTP_METHODS.forEach(method => {
        const op = pathItem[method] as OperationObject | undefined;
        op?.tags?.forEach(t => usedTags.add(t));
      });
    });
    doc.tags.forEach(tag => {
      if (!usedTags.has(tag.name)) {
        errors.push({ path: `tags.${tag.name}`, message: `Tag "${tag.name}" is defined but not used`, severity: 'info' });
      }
    });
  }

  // $ref resolution check
  validateRefs(doc, errors);

  return errors;
}

function validateSchemaConstraints(schema: SchemaObject, path: string, errors: ValidationError[]): void {
  const type = typeof schema.type === 'string' ? schema.type : undefined;

  // String constraints
  if (type === 'string') {
    if (schema.minLength !== undefined && schema.maxLength !== undefined && schema.minLength > schema.maxLength) {
      errors.push({ path: `${path}.minLength`, message: 'minLength should not be greater than maxLength', severity: 'error' });
    }
    if (schema.minLength !== undefined && schema.minLength < 0) {
      errors.push({ path: `${path}.minLength`, message: 'minLength must be non-negative', severity: 'error' });
    }
    if (schema.pattern) {
      try { new RegExp(schema.pattern); } catch {
        errors.push({ path: `${path}.pattern`, message: `Invalid regex pattern: ${schema.pattern}`, severity: 'error' });
      }
    }
  }

  // Numeric constraints
  if (type === 'number' || type === 'integer') {
    if (schema.minimum !== undefined && schema.maximum !== undefined && schema.minimum > schema.maximum) {
      errors.push({ path: `${path}.minimum`, message: 'minimum should not be greater than maximum', severity: 'error' });
    }
    if (schema.multipleOf !== undefined && schema.multipleOf <= 0) {
      errors.push({ path: `${path}.multipleOf`, message: 'multipleOf must be positive', severity: 'error' });
    }
  }

  // Array constraints
  if (type === 'array') {
    if (schema.minItems !== undefined && schema.maxItems !== undefined && schema.minItems > schema.maxItems) {
      errors.push({ path: `${path}.minItems`, message: 'minItems should not be greater than maxItems', severity: 'error' });
    }
    if (schema.minItems !== undefined && schema.minItems < 0) {
      errors.push({ path: `${path}.minItems`, message: 'minItems must be non-negative', severity: 'error' });
    }
    if (!schema.items && !schema.$ref) {
      errors.push({ path: `${path}.items`, message: 'Array schema should define items', severity: 'info' });
    }
  }

  // Enum validation
  if (schema.enum && schema.enum.length === 0) {
    errors.push({ path: `${path}.enum`, message: 'Enum should have at least one value', severity: 'warning' });
  }

  // readOnly + writeOnly conflict
  if (schema.readOnly && schema.writeOnly) {
    errors.push({ path, message: 'Schema cannot be both readOnly and writeOnly', severity: 'error' });
  }

  // Recursively validate nested schemas
  if (schema.properties) {
    Object.entries(schema.properties).forEach(([propName, propSchema]) => {
      validateSchemaConstraints(propSchema, `${path}.properties.${propName}`, errors);
    });
  }
  if (schema.items && !schema.items.$ref) {
    validateSchemaConstraints(schema.items, `${path}.items`, errors);
  }
  schema.allOf?.forEach((s, i) => { if (!s.$ref) validateSchemaConstraints(s, `${path}.allOf[${i}]`, errors); });
  schema.oneOf?.forEach((s, i) => { if (!s.$ref) validateSchemaConstraints(s, `${path}.oneOf[${i}]`, errors); });
  schema.anyOf?.forEach((s, i) => { if (!s.$ref) validateSchemaConstraints(s, `${path}.anyOf[${i}]`, errors); });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// $ref resolution — checks that every internal $ref points to a defined component
// ---------------------------------------------------------------------------
function validateRefs(doc: OpenAPIDocument, errors: ValidationError[]): void {
  // Build the set of all reachable internal reference targets.
  const defined = new Set<string>();
  const components = doc.components;
  if (components) {
    (['schemas', 'responses', 'parameters', 'examples', 'requestBodies', 'headers', 'securitySchemes', 'links', 'callbacks'] as const)
      .forEach(section => {
        const bucket = components[section as keyof typeof components];
        if (bucket && typeof bucket === 'object') {
          Object.keys(bucket).forEach(k => defined.add(`#/components/${section}/${k}`));
        }
      });
  }

  // Recursively walk the document object, collect $ref strings and validate them.
  function walk(node: unknown, nodePath: string): void {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, `${nodePath}[${i}]`));
      return;
    }
    const obj = node as Record<string, unknown>;
    if (typeof obj['$ref'] === 'string') {
      const ref = obj['$ref'] as string;
      // Only validate internal (same-document) references.
      if (ref.startsWith('#/')) {
        if (!defined.has(ref)) {
          errors.push({
            path: nodePath,
            message: `Unresolved $ref: "${ref}"`,
            severity: 'error',
          });
        }
      }
      // JSON Reference objects are not supposed to have sibling keys; stop walking.
      return;
    }
    Object.entries(obj).forEach(([key, value]) => walk(value, `${nodePath}.${key}`));
  }

  if (doc.paths) walk(doc.paths, 'paths');
  if (doc.webhooks) walk(doc.webhooks, 'webhooks');
  // Walk components itself to catch inter-component $ref cycles / dangling refs.
  if (doc.components) walk(doc.components, 'components');
}
