// OpenAPI 3.1 Type Definitions

export interface OpenAPIDocument {
  openapi: string;
  info: InfoObject;
  jsonSchemaDialect?: string;
  servers?: ServerObject[];
  paths?: PathsObject;
  webhooks?: Record<string, PathItemObject>;
  components?: ComponentsObject;
  security?: SecurityRequirementObject[];
  tags?: TagObject[];
  externalDocs?: ExternalDocumentationObject;
}

export interface InfoObject {
  title: string;
  summary?: string;
  description?: string;
  termsOfService?: string;
  contact?: ContactObject;
  license?: LicenseObject;
  version: string;
}

export interface ContactObject {
  name?: string;
  url?: string;
  email?: string;
}

export interface LicenseObject {
  name: string;
  identifier?: string;
  url?: string;
}

export interface ServerObject {
  url: string;
  description?: string;
  variables?: Record<string, ServerVariableObject>;
}

export interface ServerVariableObject {
  enum?: string[];
  default: string;
  description?: string;
}

export interface PathsObject {
  [path: string]: PathItemObject;
}

export interface PathItemObject {
  summary?: string;
  description?: string;
  get?: OperationObject;
  put?: OperationObject;
  post?: OperationObject;
  delete?: OperationObject;
  options?: OperationObject;
  head?: OperationObject;
  patch?: OperationObject;
  trace?: OperationObject;
  servers?: ServerObject[];
  parameters?: ParameterObject[];
}

export type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';

export const HTTP_METHODS: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'];

export const METHOD_COLORS: Record<HttpMethod, string> = {
  get: '#61affe',
  post: '#49cc90',
  put: '#fca130',
  patch: '#50e3c2',
  delete: '#f93e3e',
  options: '#0d5aa7',
  head: '#9012fe',
  trace: '#666666',
};

export interface OperationObject {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
  operationId?: string;
  parameters?: ParameterObject[];
  requestBody?: RequestBodyObject;
  responses?: ResponsesObject;
  callbacks?: Record<string, Record<string, PathItemObject>>;
  deprecated?: boolean;
  security?: SecurityRequirementObject[];
  servers?: ServerObject[];
}

export interface ParameterObject {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  schema?: SchemaObject;
  example?: unknown;
  examples?: Record<string, ExampleObject>;
}

export interface RequestBodyObject {
  description?: string;
  content: Record<string, MediaTypeObject>;
  required?: boolean;
}

export interface MediaTypeObject {
  schema?: SchemaObject;
  example?: unknown;
  examples?: Record<string, ExampleObject>;
  encoding?: Record<string, EncodingObject>;
}

export interface EncodingObject {
  contentType?: string;
  headers?: Record<string, HeaderObject>;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
}

export interface HeaderObject {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema?: SchemaObject;
}

export interface ResponsesObject {
  [statusCode: string]: ResponseObject;
}

export interface ResponseObject {
  description: string;
  headers?: Record<string, HeaderObject>;
  content?: Record<string, MediaTypeObject>;
  links?: Record<string, LinkObject>;
}

export interface LinkObject {
  operationRef?: string;
  operationId?: string;
  parameters?: Record<string, unknown>;
  requestBody?: unknown;
  description?: string;
  server?: ServerObject;
}

export interface SchemaObject {
  type?: string | string[];
  format?: string;
  title?: string;
  description?: string;
  default?: unknown;
  enum?: unknown[];
  const?: unknown;
  // Numeric
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  // String
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  // Array
  items?: SchemaObject;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  // Object
  properties?: Record<string, SchemaObject>;
  additionalProperties?: boolean | SchemaObject;
  required?: string[];
  maxProperties?: number;
  minProperties?: number;
  // Composition
  allOf?: SchemaObject[];
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  not?: SchemaObject;
  // Ref
  $ref?: string;
  // Meta — note: `nullable` is an OAS 3.0 construct; in OAS 3.1 use `type: ['string', 'null']`
  readOnly?: boolean;
  writeOnly?: boolean;
  example?: unknown;
  deprecated?: boolean;
}

export interface ExampleObject {
  summary?: string;
  description?: string;
  value?: unknown;
  externalValue?: string;
}

export interface TagObject {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
}

export interface ExternalDocumentationObject {
  description?: string;
  url: string;
}

export interface ComponentsObject {
  schemas?: Record<string, SchemaObject>;
  responses?: Record<string, ResponseObject>;
  parameters?: Record<string, ParameterObject>;
  examples?: Record<string, ExampleObject>;
  requestBodies?: Record<string, RequestBodyObject>;
  headers?: Record<string, HeaderObject>;
  securitySchemes?: Record<string, SecuritySchemeObject>;
  links?: Record<string, LinkObject>;
  callbacks?: Record<string, Record<string, PathItemObject>>;
}

export interface SecuritySchemeObject {
  type: 'apiKey' | 'http' | 'mutualTLS' | 'oauth2' | 'openIdConnect';
  description?: string;
  name?: string;
  in?: 'query' | 'header' | 'cookie';
  scheme?: string;
  bearerFormat?: string;
  flows?: OAuthFlowsObject;
  openIdConnectUrl?: string;
}

export interface OAuthFlowsObject {
  implicit?: OAuthFlowObject;
  password?: OAuthFlowObject;
  clientCredentials?: OAuthFlowObject;
  authorizationCode?: OAuthFlowObject;
}

export interface OAuthFlowObject {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

export interface SecurityRequirementObject {
  [name: string]: string[];
}

// Validation types
export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// Default empty document
export function createDefaultDocument(): OpenAPIDocument {
  return {
    openapi: '3.1.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'A sample API specification',
    },
    servers: [
      {
        url: 'https://api.example.com/v1',
        description: 'Production server',
      },
    ],
    paths: {},
    components: {
      schemas: {},
      securitySchemes: {},
    },
    tags: [],
  };
}

// Sample pet store document
export function createPetStoreDocument(): OpenAPIDocument {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Petstore API',
      version: '1.0.0',
      description: 'A sample Pet Store API that demonstrates features of OpenAPI 3.1 specification.',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
        url: 'https://example.com/support',
      },
      license: {
        name: 'Apache 2.0',
        url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
      },
    },
    servers: [
      { url: 'https://petstore.example.com/v1', description: 'Production' },
      { url: 'https://staging.petstore.example.com/v1', description: 'Staging' },
    ],
    tags: [
      { name: 'pets', description: 'Operations about pets' },
      { name: 'store', description: 'Access to pet store orders' },
      { name: 'user', description: 'Operations about users' },
    ],
    paths: {
      '/pets': {
        get: {
          tags: ['pets'],
          summary: 'List all pets',
          operationId: 'listPets',
          parameters: [
            {
              name: 'limit',
              in: 'query',
              description: 'How many items to return',
              required: false,
              schema: { type: 'integer', format: 'int32', maximum: 100 },
            },
            {
              name: 'status',
              in: 'query',
              description: 'Filter by status',
              required: false,
              schema: { type: 'string', enum: ['available', 'pending', 'sold'] },
            },
          ],
          responses: {
            '200': {
              description: 'A list of pets',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/Pet' } },
                },
              },
            },
            '500': {
              description: 'Unexpected error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
        post: {
          tags: ['pets'],
          summary: 'Create a pet',
          operationId: 'createPet',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Pet' },
              },
            },
          },
          responses: {
            '201': { description: 'Pet created successfully' },
            '400': { description: 'Invalid input' },
          },
        },
      },
      '/pets/{petId}': {
        get: {
          tags: ['pets'],
          summary: 'Get a pet by ID',
          operationId: 'getPetById',
          parameters: [
            {
              name: 'petId',
              in: 'path',
              required: true,
              description: 'The ID of the pet to retrieve',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'A single pet',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Pet' },
                },
              },
            },
            '404': { description: 'Pet not found' },
          },
        },
        put: {
          tags: ['pets'],
          summary: 'Update a pet',
          operationId: 'updatePet',
          parameters: [
            {
              name: 'petId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Pet' },
              },
            },
          },
          responses: {
            '200': { description: 'Pet updated' },
            '404': { description: 'Pet not found' },
          },
        },
        delete: {
          tags: ['pets'],
          summary: 'Delete a pet',
          operationId: 'deletePet',
          parameters: [
            {
              name: 'petId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '204': { description: 'Pet deleted' },
            '404': { description: 'Pet not found' },
          },
        },
      },
      '/store/orders': {
        post: {
          tags: ['store'],
          summary: 'Place an order',
          operationId: 'placeOrder',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Order' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Order placed',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Order' },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Pet: {
          type: 'object',
          required: ['id', 'name'],
          properties: {
            id: { type: 'integer', format: 'int64', description: 'Unique identifier' },
            name: { type: 'string', description: 'Name of the pet' },
            tag: { type: 'string', description: 'Tag for categorization' },
            status: {
              type: 'string',
              enum: ['available', 'pending', 'sold'],
              description: 'Pet status in the store',
            },
            category: { $ref: '#/components/schemas/Category' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', format: 'int64' },
            name: { type: 'string' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer', format: 'int64' },
            petId: { type: 'integer', format: 'int64' },
            quantity: { type: 'integer', format: 'int32', minimum: 1 },
            shipDate: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['placed', 'approved', 'delivered'] },
            complete: { type: 'boolean', default: false },
          },
        },
        Error: {
          type: 'object',
          required: ['code', 'message'],
          properties: {
            code: { type: 'integer', format: 'int32' },
            message: { type: 'string' },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token authentication',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key authentication',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  };
}
