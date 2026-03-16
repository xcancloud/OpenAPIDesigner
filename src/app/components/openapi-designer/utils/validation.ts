import type { OpenAPIDocument, ValidationError, OperationObject, HttpMethod } from '../types/openapi';
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
      });
    });
  }

  // Schema validation
  if (doc.components?.schemas) {
    Object.entries(doc.components.schemas).forEach(([name, schema]) => {
      if (!schema.type && !schema.$ref && !schema.allOf && !schema.oneOf && !schema.anyOf) {
        errors.push({ path: `components.schemas.${name}`, message: 'Schema should have a type, $ref, or composition keyword', severity: 'info' });
      }
    });
  }

  // Security schemes
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

  return errors;
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
