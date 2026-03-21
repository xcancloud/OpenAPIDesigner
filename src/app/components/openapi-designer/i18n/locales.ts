export type Locale = 'en' | 'zh';

export interface I18nMessages {
  // App
  appName: string;
  // Navigation
  nav: {
    info: string;
    servers: string;
    paths: string;
    webhooks: string;
    schemas: string;
    security: string;
    tags: string;
    components: string;
    codeEditor: string;
    preview: string;
    validation: string;
  };
  // Common
  common: {
    add: string;
    delete: string;
    edit: string;
    save: string;
    cancel: string;
    confirm: string;
    search: string;
    name: string;
    description: string;
    type: string;
    required: string;
    optional: string;
    deprecated: string;
    example: string;
    default: string;
    format: string;
    import: string;
    export: string;
    copy: string;
    copied: string;
    reset: string;
    close: string;
    expand: string;
    collapse: string;
    none: string;
    yes: string;
    no: string;
    loading: string;
    noData: string;
    actions: string;
    properties: string;
    value: string;
    key: string;
    url: string;
    email: string;
    version: string;
    summary: string;
    title: string;
    parameters: string;
    responses: string;
    requestBody: string;
    operationId: string;
    method: string;
    path: string;
    statusCode: string;
    contentType: string;
    schema: string;
    selectPlaceholder: string;
    inputPlaceholder: string;
    language: string;
    theme: string;
    lightTheme: string;
    darkTheme: string;
    downloadYaml: string;
    downloadJson: string;
    importFile: string;
    importPostman: string;
    newDocument: string;
    samplePetstore: string;
    undo: string;
    redo: string;
    downloadMarkdown: string;
    downloadHtml: string;
    downloadWord: string;
    printPdf: string;
    unsaved: string;
    saved: string;
  };
  // Info panel
  info: {
    title: string;
    apiTitle: string;
    apiVersion: string;
    apiDescription: string;
    apiSummary: string;
    termsOfService: string;
    contact: string;
    contactName: string;
    contactEmail: string;
    contactUrl: string;
    license: string;
    licenseName: string;
    licenseUrl: string;
    licenseIdentifier: string;
    openApiVersion: string;
  };
  // Servers
  servers: {
    title: string;
    addServer: string;
    serverUrl: string;
    serverDescription: string;
    variables: string;
    addVariable: string;
    variableName: string;
    variableDefault: string;
    variableEnum: string;
    noServers: string;
  };
  // Paths
  paths: {
    title: string;
    addPath: string;
    addOperation: string;
    pathUrl: string;
    noEndpoints: string;
    endpoint: string;
    endpoints: string;
    operation: string;
    operations: string;
    tags: string;
    deprecated: string;
    externalDocs: string;
    callbacks: string;
    noOperations: string;
    allTags: string;
    parameterLocation: string;
    paramIn: {
      query: string;
      header: string;
      path: string;
      cookie: string;
    };
  };
  // Schemas
  schemas: {
    title: string;
    addSchema: string;
    schemaName: string;
    schemaType: string;
    noSchemas: string;
    objectProperties: string;
    addProperty: string;
    propertyName: string;
    arrayItems: string;
    enumValues: string;
    addEnumValue: string;
    composition: string;
    constraints: string;
    minimum: string;
    maximum: string;
    minLength: string;
    maxLength: string;
    pattern: string;
    minItems: string;
    maxItems: string;
    uniqueItems: string;
    nullable: string;
    readOnly: string;
    writeOnly: string;
    additionalProperties: string;
    ref: string;
    selectRef: string;
    schemaTypes: {
      string: string;
      number: string;
      integer: string;
      boolean: string;
      array: string;
      object: string;
      null: string;
    };
  };
  // Security
  security: {
    title: string;
    addScheme: string;
    schemeName: string;
    schemeType: string;
    noSchemes: string;
    apiKeyName: string;
    apiKeyIn: string;
    httpScheme: string;
    bearerFormat: string;
    oauthFlows: string;
    openIdConnectUrl: string;
    authorizationUrl: string;
    tokenUrl: string;
    refreshUrl: string;
    scopes: string;
    addScope: string;
    scopeName: string;
    scopeDescription: string;
    globalSecurity: string;
    types: {
      apiKey: string;
      http: string;
      oauth2: string;
      openIdConnect: string;
      mutualTLS: string;
    };
    flows: {
      implicit: string;
      password: string;
      clientCredentials: string;
      authorizationCode: string;
    };
  };
  // Tags
  tags: {
    title: string;
    addTag: string;
    tagName: string;
    noTags: string;
  };
  // Webhooks
  webhooks: {
    title: string;
    addWebhook: string;
    webhookName: string;
    noWebhooks: string;
    addOperation: string;
    noOperations: string;
  };
  // Code Editor
  codeEditor: {
    title: string;
    yaml: string;
    json: string;
    syncToVisual: string;
    syncFromVisual: string;
    formatCode: string;
    copyCode: string;
    parseError: string;
  };
  // Preview
  preview: {
    title: string;
    noContent: string;
    tryItOut: string;
    sendRequest: string;
    sending: string;
    responseHeaders: string;
    responseBody: string;
    requestUrl: string;
    authorization: string;
    expandAll: string;
    collapseAll: string;
    selectServer: string;
    serverVariables: string;
    statusCode: string;
    responseTime: string;
    debugError: string;
    paramValue: string;
    headerValue: string;
    requestBodyContent: string;
  };
  // Validation
  validation: {
    title: string;
    noErrors: string;
    errors: string;
    warnings: string;
    infos: string;
    runValidation: string;
    errorCount: string;
    warningCount: string;
    valid: string;
    invalid: string;
  };
  // Import/Export
  importExport: {
    title: string;
    importTitle: string;
    exportTitle: string;
    importDescription: string;
    dropFileHere: string;
    orClickToSelect: string;
    supportedFormats: string;
    exportAsYaml: string;
    exportAsJson: string;
    bundled: string;
    dereferenced: string;
  };
  // Markdown editor
  markdown: {
    edit: string;
    preview: string;
    noContent: string;
  };
  // Tooltip hints (i18n keys for ? icon tooltips)
  hints: {
    apiTitle: string;
    apiVersion: string;
    apiSummary: string;
    apiDescription: string;
    termsOfService: string;
    openApiVersion: string;
    contactName: string;
    contactEmail: string;
    contactUrl: string;
    licenseName: string;
    licenseIdentifier: string;
    licenseUrl: string;
    serverUrl: string;
    serverDescription: string;
    operationSummary: string;
    operationId: string;
    operationDescription: string;
    operationTags: string;
    schemaDescription: string;
    tagDescription: string;
  };
  // Export document labels
  export: {
    contents: string;
    overview: string;
    servers: string;
    endpoints: string;
    schemas: string;
    security: string;
    untagged: string;
    openAPI: string;
    version: string;
    termsOfService: string;
    contact: string;
    license: string;
    externalDocs: string;
    serverUrl: string;
    serverDescription: string;
    variables: string;
    variable: string;
    default: string;
    enumValues: string;
    description: string;
    parameters: string;
    name: string;
    paramIn: string;
    type: string;
    constraints: string;
    required: string;
    requestBody: string;
    contentType: string;
    responses: string;
    headers: string;
    statusCode: string;
    property: string;
    items: string;
    schema: string;
    additionalProperties: string;
    enum: string;
    option: string;
    reusableParameters: string;
    reusableResponses: string;
    reusableRequestBodies: string;
    securitySchemes: string;
    in: string;
    parameterName: string;
    httpScheme: string;
    bearerFormat: string;
    openIdConnectUrl: string;
    authorizationUrl: string;
    tokenUrl: string;
    refreshUrl: string;
    scopes: string;
    globalSecurityRequirement: string;
    implicit: string;
    password: string;
    clientCredentials: string;
    authorizationCode: string;
    public: string;
    privateAuth: string;
    deprecated: string;
  };
  // Placeholder examples for input fields
  placeholders: {
    apiTitle: string;
    apiVersion: string;
    apiSummary: string;
    apiDescription: string;
    termsOfService: string;
    openApiVersion: string;
    contactName: string;
    contactEmail: string;
    contactUrl: string;
    licenseName: string;
    licenseIdentifier: string;
    licenseUrl: string;
    serverUrl: string;
    serverDescription: string;
    variableEnum: string;
    variableDefault: string;
    variableDescription: string;
    operationSummary: string;
    operationId: string;
    pathUrl: string;
    propertyDescription: string;
    schemaDescription: string;
    regexPattern: string;
    enumValues: string;
  };
}

export const en: I18nMessages = {
  appName: 'OpenAPI Designer',
  nav: {
    info: 'Info',
    servers: 'Servers',
    paths: 'Paths',
    webhooks: 'Webhooks',
    schemas: 'Schemas',
    security: 'Security',
    tags: 'Tags',
    components: 'Components',
    codeEditor: 'Code',
    preview: 'Preview',
    validation: 'Validation',
  },
  common: {
    add: 'Add',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    search: 'Search...',
    name: 'Name',
    description: 'Description',
    type: 'Type',
    required: 'Required',
    optional: 'Optional',
    deprecated: 'Deprecated',
    example: 'Example',
    default: 'Default',
    format: 'Format',
    import: 'Import',
    export: 'Export',
    copy: 'Copy',
    copied: 'Copied!',
    reset: 'Reset',
    close: 'Close',
    expand: 'Expand',
    collapse: 'Collapse',
    none: 'None',
    yes: 'Yes',
    no: 'No',
    loading: 'Loading...',
    noData: 'No data',
    actions: 'Actions',
    properties: 'Properties',
    value: 'Value',
    key: 'Key',
    url: 'URL',
    email: 'Email',
    version: 'Version',
    summary: 'Summary',
    title: 'Title',
    parameters: 'Parameters',
    responses: 'Responses',
    requestBody: 'Request Body',
    operationId: 'Operation ID',
    method: 'Method',
    path: 'Path',
    statusCode: 'Status Code',
    contentType: 'Content Type',
    schema: 'Schema',
    selectPlaceholder: 'Select...',
    inputPlaceholder: 'Enter value...',
    language: 'Language',
    theme: 'Theme',
    lightTheme: 'Light',
    darkTheme: 'Dark',
    downloadYaml: 'Download YAML',
    downloadJson: 'Download JSON',
    importFile: 'Import OpenAPI File',
    importPostman: 'Import Postman Collection',
    newDocument: 'New Document',
    samplePetstore: 'Petstore Sample',
    undo: 'Undo',
    redo: 'Redo',
    downloadMarkdown: 'Export as Markdown',
    downloadHtml: 'Export as HTML',
    downloadWord: 'Export as Word (.doc)',
    printPdf: 'Print / Save as PDF',
    unsaved: 'Unsaved',
    saved: 'Saved',
  },
  info: {
    title: 'API Information',
    apiTitle: 'API Title',
    apiVersion: 'API Version',
    apiDescription: 'Description',
    apiSummary: 'Summary',
    termsOfService: 'Terms of Service',
    contact: 'Contact Information',
    contactName: 'Contact Name',
    contactEmail: 'Contact Email',
    contactUrl: 'Contact URL',
    license: 'License',
    licenseName: 'License Name',
    licenseUrl: 'License URL',
    licenseIdentifier: 'SPDX Identifier',
    openApiVersion: 'OpenAPI Version',
  },
  servers: {
    title: 'Servers',
    addServer: 'Add Server',
    serverUrl: 'Server URL',
    serverDescription: 'Description',
    variables: 'Variables',
    addVariable: 'Add Variable',
    variableName: 'Variable Name',
    variableDefault: 'Default Value',
    variableEnum: 'Enum Values',
    noServers: 'No servers defined. Add a server to get started.',
  },
  paths: {
    title: 'API Paths',
    addPath: 'Add Path',
    addOperation: 'Add Operation',
    pathUrl: 'Path URL (e.g. /pets/{petId})',
    noEndpoints: 'No endpoints defined. Add a path to get started.',
    endpoint: 'Endpoint',
    endpoints: 'Endpoints',
    operation: 'Operation',
    operations: 'Operations',
    tags: 'Tags',
    deprecated: 'Deprecated',
    externalDocs: 'External Docs',
    callbacks: 'Callbacks',
    noOperations: 'No operations. Add a method to this path.',
    allTags: 'All',
    parameterLocation: 'Location',
    paramIn: {
      query: 'Query',
      header: 'Header',
      path: 'Path',
      cookie: 'Cookie',
    },
  },
  schemas: {
    title: 'Schemas',
    addSchema: 'Add Schema',
    schemaName: 'Schema Name',
    schemaType: 'Schema Type',
    noSchemas: 'No schemas defined. Add a schema to get started.',
    objectProperties: 'Properties',
    addProperty: 'Add Property',
    propertyName: 'Property Name',
    arrayItems: 'Array Items',
    enumValues: 'Enum Values',
    addEnumValue: 'Add Value',
    composition: 'Composition',
    constraints: 'Constraints',
    minimum: 'Minimum',
    maximum: 'Maximum',
    minLength: 'Min Length',
    maxLength: 'Max Length',
    pattern: 'Pattern',
    minItems: 'Min Items',
    maxItems: 'Max Items',
    uniqueItems: 'Unique Items',
    nullable: 'Nullable',
    readOnly: 'Read Only',
    writeOnly: 'Write Only',
    additionalProperties: 'Allow Additional Properties',
    ref: '$ref',
    selectRef: 'Select Reference',
    schemaTypes: {
      string: 'String',
      number: 'Number',
      integer: 'Integer',
      boolean: 'Boolean',
      array: 'Array',
      object: 'Object',
      null: 'Null',
    },
  },
  security: {
    title: 'Security',
    addScheme: 'Add Security Scheme',
    schemeName: 'Scheme Name',
    schemeType: 'Type',
    noSchemes: 'No security schemes defined.',
    apiKeyName: 'API Key Name',
    apiKeyIn: 'Location',
    httpScheme: 'HTTP Scheme',
    bearerFormat: 'Bearer Format',
    oauthFlows: 'OAuth2 Flows',
    openIdConnectUrl: 'OpenID Connect URL',
    authorizationUrl: 'Authorization URL',
    tokenUrl: 'Token URL',
    refreshUrl: 'Refresh URL',
    scopes: 'Scopes',
    addScope: 'Add Scope',
    scopeName: 'Scope Name',
    scopeDescription: 'Description',
    globalSecurity: 'Global Security',
    types: {
      apiKey: 'API Key',
      http: 'HTTP',
      oauth2: 'OAuth 2.0',
      openIdConnect: 'OpenID Connect',
      mutualTLS: 'Mutual TLS',
    },
    flows: {
      implicit: 'Implicit',
      password: 'Resource Owner Password',
      clientCredentials: 'Client Credentials',
      authorizationCode: 'Authorization Code',
    },
  },
  tags: {
    title: 'Tags',
    addTag: 'Add Tag',
    tagName: 'Tag Name',
    noTags: 'No tags defined.',
  },
  webhooks: {
    title: 'Webhooks',
    addWebhook: 'Add Webhook',
    webhookName: 'Webhook Name (e.g. newPet)',
    noWebhooks: 'No webhooks defined. Add a webhook to get started.',
    addOperation: 'Add Operation',
    noOperations: 'No operations. Add a method to this webhook.',
  },
  codeEditor: {
    title: 'Code Editor',
    yaml: 'YAML',
    json: 'JSON',
    syncToVisual: 'Apply to Visual Editor',
    syncFromVisual: 'Sync from Visual Editor',
    formatCode: 'Format',
    copyCode: 'Copy',
    parseError: 'Failed to parse code. Please check for syntax errors.',
  },
  preview: {
    title: 'API Documentation Preview',
    noContent: 'No content to preview.',
    tryItOut: 'Try It Out',
    sendRequest: 'Send Request',
    sending: 'Sending...',
    responseHeaders: 'Response Headers',
    responseBody: 'Response Body',
    requestUrl: 'Request URL',
    authorization: 'Authorization',
    expandAll: 'Expand All',
    collapseAll: 'Collapse All',
    selectServer: 'Select Server',
    serverVariables: 'Server Variables',
    statusCode: 'Status',
    responseTime: 'Time',
    debugError: 'Request Failed',
    paramValue: 'Value',
    headerValue: 'Value',
    requestBodyContent: 'Request Body',
  },
  validation: {
    title: 'Validation',
    noErrors: 'No issues found. Your specification is valid!',
    errors: 'Errors',
    warnings: 'Warnings',
    infos: 'Info',
    runValidation: 'Run Validation',
    errorCount: 'errors',
    warningCount: 'warnings',
    valid: 'Valid',
    invalid: 'Invalid',
  },
  importExport: {
    title: 'Import / Export',
    importTitle: 'Import',
    exportTitle: 'Export',
    importDescription: 'Import an existing OpenAPI specification',
    dropFileHere: 'Drop file here',
    orClickToSelect: 'or click to select a file',
    supportedFormats: 'Supported: YAML, JSON (OpenAPI 2.0/3.0/3.1)',
    exportAsYaml: 'Export as YAML',
    exportAsJson: 'Export as JSON',
    bundled: 'Bundled',
    dereferenced: 'Dereferenced',
  },
  markdown: {
    edit: 'Edit',
    preview: 'Preview',
    noContent: 'No content to preview.',
  },
  hints: {
    apiTitle: 'The name of the API. Required. Shown as the main heading in generated documentation.',
    apiVersion: 'Version string of this API (not the OpenAPI spec version). E.g. 1.0.0, 2.1.3-beta.',
    apiSummary: 'A short one-line summary shown alongside the title in API listing pages.',
    apiDescription: 'Full description of the API. CommonMark (Markdown) syntax supported for rich text.',
    termsOfService: 'URL pointing to the Terms of Service page. Must be a valid absolute URL.',
    openApiVersion: 'OpenAPI Specification version in use. 3.1.0 adds full JSON Schema 2020-12 support.',
    contactName: 'Name of the contact person or organization responsible for this API.',
    contactEmail: 'Email address of the contact person. Must be a valid email format.',
    contactUrl: 'URL pointing to the contact information page for this API.',
    licenseName: 'License name for the API. E.g. Apache 2.0, MIT, GPL-3.0.',
    licenseIdentifier: 'SPDX license expression. E.g. Apache-2.0, MIT. Mutually exclusive with licenseUrl.',
    licenseUrl: 'URL pointing to the license text. Mutually exclusive with licenseIdentifier.',
    serverUrl: 'Target server URL. Supports {curly-brace} template variables. E.g. https://api.example.com/v1.',
    serverDescription: 'Optional description of the server. Markdown is supported.',
    operationSummary: 'A short one-line summary of the operation shown in endpoint listings.',
    operationId: 'Unique string ID for the operation, used in code generation. E.g. listPets, createUser.',
    operationDescription: 'Detailed description of what this operation does. Markdown is supported.',
    operationTags: 'Comma-separated tag names to group this operation. Tags must be defined in the Tags panel.',
    schemaDescription: 'Human-readable description of this schema or property. Markdown is supported.',
    tagDescription: 'Optional description for this tag. Markdown supported. Displayed under the tag heading in docs.',
  },
  export: {
    contents: 'Contents',
    overview: 'Overview',
    servers: 'Servers',
    endpoints: 'Endpoints',
    schemas: 'Schemas',
    security: 'Security Schemes',
    untagged: 'Untagged',
    openAPI: 'OpenAPI',
    version: 'Version',
    termsOfService: 'Terms of Service',
    contact: 'Contact',
    license: 'License',
    externalDocs: 'External Docs',
    serverUrl: 'Server URL',
    serverDescription: 'Description',
    variables: 'Variables',
    variable: 'Variable',
    default: 'Default',
    enumValues: 'Enum',
    description: 'Description',
    parameters: 'Parameters',
    name: 'Name',
    paramIn: 'In',
    type: 'Type',
    constraints: 'Constraints',
    required: 'Req',
    requestBody: 'Request Body',
    contentType: 'Content Type',
    responses: 'Responses',
    headers: 'Headers',
    statusCode: 'Status Code',
    property: 'Property',
    items: 'items',
    schema: 'Schema',
    additionalProperties: 'additionalProperties',
    enum: 'Enum',
    option: 'Option',
    reusableParameters: 'Reusable Parameters',
    reusableResponses: 'Reusable Responses',
    reusableRequestBodies: 'Reusable Request Bodies',
    securitySchemes: 'Security Schemes',
    in: 'In',
    parameterName: 'Parameter Name',
    httpScheme: 'HTTP Scheme',
    bearerFormat: 'Bearer Format',
    openIdConnectUrl: 'OpenID Connect URL',
    authorizationUrl: 'Auth URL',
    tokenUrl: 'Token URL',
    refreshUrl: 'Refresh URL',
    scopes: 'Scopes',
    globalSecurityRequirement: 'Global Security Requirement',
    implicit: 'Implicit',
    password: 'Password',
    clientCredentials: 'Client Credentials',
    authorizationCode: 'Authorization Code',
    public: 'Public (no auth)',
    privateAuth: 'Private',
    deprecated: 'deprecated',
  },
  placeholders: {
    apiTitle: 'Petstore API',
    apiVersion: '1.0.0',
    apiSummary: 'A simple API for managing pets',
    apiDescription: 'Describe your API in detail. **Markdown** is fully supported.',
    termsOfService: 'https://example.com/terms',
    openApiVersion: '3.1.0',
    contactName: 'API Support Team',
    contactEmail: 'support@example.com',
    contactUrl: 'https://example.com/support',
    licenseName: 'Apache 2.0',
    licenseIdentifier: 'Apache-2.0',
    licenseUrl: 'https://www.apache.org/licenses/LICENSE-2.0',
    serverUrl: 'https://api.example.com/v1',
    serverDescription: 'Type a description...',
    variableEnum: 'val1, val2',
    variableDefault: 'e.g. v1',
    variableDescription: 'Describe this variable',
    operationSummary: 'e.g. List all pets',
    operationId: 'listPets',
    pathUrl: 'e.g. /pets/{petId}',
    propertyDescription: 'Describe this property. Markdown supported.',
    schemaDescription: 'Describe this schema. **Markdown** is supported.',
    regexPattern: '^[a-z]+$',
    enumValues: 'val1, val2, val3',
  },
}

export const zh: I18nMessages = {
  appName: 'OpenAPI 设计器',
  nav: {
    info: '基本信息',
    servers: '服务器',
    paths: '接口路径',
    webhooks: 'Webhooks',
    schemas: '数据模型',
    security: '安全方案',
    tags: '标签',
    components: '组件',
    codeEditor: '代码',
    preview: '预览',
    validation: '校验',
  },
  common: {
    add: '添加',
    delete: '删除',
    edit: '编辑',
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    search: '搜索...',
    name: '名称',
    description: '描述',
    type: '类型',
    required: '必填',
    optional: '可选',
    deprecated: '已废弃',
    example: '示例',
    default: '默认值',
    format: '格式',
    import: '导入',
    export: '导出',
    copy: '复制',
    copied: '已复制！',
    reset: '重置',
    close: '关闭',
    expand: '展开',
    collapse: '收起',
    none: '无',
    yes: '是',
    no: '否',
    loading: '加载中...',
    noData: '暂无数据',
    actions: '操作',
    properties: '属性',
    value: '值',
    key: '键',
    url: 'URL',
    email: '邮箱',
    version: '版本',
    summary: '摘要',
    title: '标题',
    parameters: '参数',
    responses: '响应',
    requestBody: '请求体',
    operationId: '操作 ID',
    method: '方法',
    path: '路径',
    statusCode: '状态码',
    contentType: '内容类型',
    schema: '数据模型',
    selectPlaceholder: '请选择...',
    inputPlaceholder: '请输入...',
    language: '语言',
    theme: '主题',
    lightTheme: '浅色',
    darkTheme: '深色',
    downloadYaml: '下载 YAML',
    downloadJson: '下载 JSON',
    importFile: '导入 OpenAPI 文件',
    importPostman: '导入 Postman 集合',
    newDocument: '新建文档',
    samplePetstore: '宠物商店示例',
    undo: '撤销',
    redo: '重做',
    downloadMarkdown: '导出 Markdown',
    downloadHtml: '导出 HTML',
    downloadWord: '导出 Word (.doc)',
    printPdf: '打印 / 导出 PDF',
    unsaved: '未保存',
    saved: '已保存',
  },
  info: {
    title: 'API 基本信息',
    apiTitle: 'API 标题',
    apiVersion: 'API 版本',
    apiDescription: 'API 描述',
    apiSummary: 'API 摘要',
    termsOfService: '服务条款',
    contact: '联系信息',
    contactName: '联系人',
    contactEmail: '联系邮箱',
    contactUrl: '联系网址',
    license: '许可证',
    licenseName: '许可证名称',
    licenseUrl: '许可证网址',
    licenseIdentifier: 'SPDX 标识',
    openApiVersion: 'OpenAPI 版本',
  },
  servers: {
    title: '服务器配置',
    addServer: '添加服务器',
    serverUrl: '服务器地址',
    serverDescription: '描述',
    variables: '变量',
    addVariable: '添加变量',
    variableName: '变量名称',
    variableDefault: '默认值',
    variableEnum: '枚举值',
    noServers: '暂未定义服务器，点击添加开始配置。',
  },
  paths: {
    title: '接口路径',
    addPath: '添加路径',
    addOperation: '添加操作',
    pathUrl: '路径 URL（如 /pets/{petId}）',
    noEndpoints: '暂未定义接口，点击添加路径开始设计。',
    endpoint: '端点',
    endpoints: '端点',
    operation: '操作',
    operations: '操作',
    tags: '标签',
    deprecated: '已废弃',
    externalDocs: '外部文档',
    callbacks: '回调',
    noOperations: '暂无操作，请为此路径添加 HTTP 方法。',
    allTags: '全部',
    parameterLocation: '参数位置',
    paramIn: {
      query: '查询参数',
      header: '请求头',
      path: '路径参数',
      cookie: 'Cookie',
    },
  },
  schemas: {
    title: '数据模型',
    addSchema: '添加模型',
    schemaName: '模型名称',
    schemaType: '数据类型',
    noSchemas: '暂未定义数据模型，点击添加开始设计。',
    objectProperties: '对象属性',
    addProperty: '添加属性',
    propertyName: '属性名称',
    arrayItems: '数组元素',
    enumValues: '枚举值',
    addEnumValue: '添加枚举值',
    composition: '组合',
    constraints: '约束',
    minimum: '最小值',
    maximum: '最大值',
    minLength: '最小长度',
    maxLength: '最大长度',
    pattern: '正则表达式',
    minItems: '最少元素',
    maxItems: '最多元素',
    uniqueItems: '元素唯一',
    nullable: '可为空',
    readOnly: '只读',
    writeOnly: '只写',
    additionalProperties: '允许额外属性',
    ref: '引用（$ref）',
    selectRef: '选择引用',
    schemaTypes: {
      string: '字符串',
      number: '数字',
      integer: '整数',
      boolean: '布尔值',
      array: '数组',
      object: '对象',
      null: '空值',
    },
  },
  security: {
    title: '安全方案',
    addScheme: '添加安全方案',
    schemeName: '方案名称',
    schemeType: '方案类型',
    noSchemes: '暂未定义安全方案。',
    apiKeyName: 'API Key 名称',
    apiKeyIn: '传递位置',
    httpScheme: 'HTTP 方案',
    bearerFormat: 'Bearer 格式',
    oauthFlows: 'OAuth2 流程',
    openIdConnectUrl: 'OpenID Connect 地址',
    authorizationUrl: '授权地址',
    tokenUrl: '令牌地址',
    refreshUrl: '刷新地址',
    scopes: '作用域',
    addScope: '添加作用域',
    scopeName: '作用域名称',
    scopeDescription: '描述',
    globalSecurity: '全局安全配置',
    types: {
      apiKey: 'API Key',
      http: 'HTTP',
      oauth2: 'OAuth 2.0',
      openIdConnect: 'OpenID Connect',
      mutualTLS: '双向 TLS',
    },
    flows: {
      implicit: '隐式授权',
      password: '密码授权',
      clientCredentials: '客户端凭证',
      authorizationCode: '授权码',
    },
  },
  tags: {
    title: '标签管理',
    addTag: '添加标签',
    tagName: '标签名称',
    noTags: '暂未定义标签。',
  },
  webhooks: {
    title: 'Webhooks',
    addWebhook: '添加 Webhook',
    webhookName: 'Webhook 名称（如 newPet）',
    noWebhooks: '暂未定义 Webhook，点击添加开始配置。',
    addOperation: '添加操作',
    noOperations: '暂无操作，请为此 Webhook 添加 HTTP 方法。',
  },
  codeEditor: {
    title: '代码编辑器',
    yaml: 'YAML',
    json: 'JSON',
    syncToVisual: '应用到可视化编辑器',
    syncFromVisual: '从可视化编辑器同步',
    formatCode: '格式化',
    copyCode: '复制',
    parseError: '代码解析失败，请检查语法错误。',
  },
  preview: {
    title: 'API 文档预览',
    noContent: '暂无可预览的内容。',
    tryItOut: '在线调试',
    sendRequest: '发送请求',
    sending: '发送中...',
    responseHeaders: '响应头',
    responseBody: '响应体',
    requestUrl: '请求地址',
    authorization: '认证授权',
    expandAll: '全部展开',
    collapseAll: '全部收起',
    selectServer: '选择服务器',
    serverVariables: '服务器变量',
    statusCode: '状态码',
    responseTime: '耗时',
    debugError: '请求失败',
    paramValue: '值',
    headerValue: '值',
    requestBodyContent: '请求体',
  },
  validation: {
    title: '规范校验',
    noErrors: '未发现问题，规范文档有效！',
    errors: '错误',
    warnings: '警告',
    infos: '信息',
    runValidation: '运行校验',
    errorCount: '个错误',
    warningCount: '个警告',
    valid: '有效',
    invalid: '无效',
  },
  importExport: {
    title: '导入 / 导出',
    importTitle: '导入',
    exportTitle: '导出',
    importDescription: '导入已有的 OpenAPI 规范文件',
    dropFileHere: '将文件拖放到此处',
    orClickToSelect: '或点击选择文件',
    supportedFormats: '支持格式：YAML、JSON（OpenAPI 2.0/3.0/3.1）',
    exportAsYaml: '导出为 YAML',
    exportAsJson: '导出为 JSON',
    bundled: '打包模式',
    dereferenced: '解引用模式',
  },
  markdown: {
    edit: '编辑',
    preview: '预览',
    noContent: '暂无内容可预览。',
  },
  hints: {
    apiTitle: 'API 名称，必填。将作为生成文档的主标题显示。',
    apiVersion: '该 API 的版本号（非 OpenAPI 规范版本）。例如：1.0.0、2.1.3-beta。',
    apiSummary: '一句话摘要，显示在 API 列表页面的标题旁边。',
    apiDescription: 'API 的完整描述，支持 CommonMark（Markdown）语法进行富文本格式化。',
    termsOfService: '指向服务条款页面的 URL，必须是合法的绝对 URL 地址。',
    openApiVersion: '所使用的 OpenAPI 规范版本。3.1.0 完整支持 JSON Schema 2020-12。',
    contactName: '负责该 API 的联系人或组织名称。',
    contactEmail: '联系人的电子邮件地址，必须符合合法的邮箱格式。',
    contactUrl: '指向该 API 联系信息页面的 URL 地址。',
    licenseName: 'API 的许可证名称。例如：Apache 2.0、MIT、GPL-3.0。',
    licenseIdentifier: 'SPDX 许可证表达式，例如：Apache-2.0、MIT。与 licenseUrl 互斥，不可同时填写。',
    licenseUrl: '指向许可证文本的 URL 地址。与 licenseIdentifier 互斥，不可同时填写。',
    serverUrl: '目标服务器的 URL，支持使用 {花括号} 定义路径变量。例如：https://api.example.com/v1。',
    serverDescription: '服务器的可选描述信息，支持 Markdown 语法。',
    operationSummary: '接口的一句话简短描述，显示在接口列表中。',
    operationId: '接口的唯一标识符，用于代码生成。例如：listPets、createUser。',
    operationDescription: '该接口的详细描述，支持 Markdown 语法进行富文本格式化。',
    operationTags: '以逗号分隔的标签列表，用于对接口分组。标签须在"标签"面板中预先定义。',
    schemaDescription: '该数据模型或属性的可读描述，支持 Markdown 语法。',
    tagDescription: '标签的可选描述，支持 Markdown 语法，将显示在文档章节标题下方。',
  },
  export: {
    contents: '目录',
    overview: '概览',
    servers: '服务器',
    endpoints: '端点',
    schemas: '数据模型',
    security: '安全方案',
    untagged: '未分类',
    openAPI: 'OpenAPI',
    version: '版本',
    termsOfService: '服务条款',
    contact: '联系信息',
    license: '许可证',
    externalDocs: '外部文档',
    serverUrl: '服务器地址',
    serverDescription: '描述',
    variables: '变量',
    variable: '变量',
    default: '默认值',
    enumValues: '枚举值',
    description: '描述',
    parameters: '参数',
    name: '名称',
    paramIn: '位置',
    type: '类型',
    constraints: '约束',
    required: '必填',
    requestBody: '请求体',
    contentType: '内容类型',
    responses: '响应',
    headers: '响应头',
    statusCode: '状态码',
    property: '属性',
    items: '元素',
    schema: '数据模型',
    additionalProperties: '额外属性',
    enum: '枚举',
    option: '选项',
    reusableParameters: '可复用参数',
    reusableResponses: '可复用响应',
    reusableRequestBodies: '可复用请求体',
    securitySchemes: '安全方案',
    in: '位置',
    parameterName: '参数名',
    httpScheme: 'HTTP 方案',
    bearerFormat: 'Bearer 格式',
    openIdConnectUrl: 'OpenID Connect 地址',
    authorizationUrl: '授权地址',
    tokenUrl: '令牌地址',
    refreshUrl: '刷新地址',
    scopes: '作用域',
    globalSecurityRequirement: '全局安全配置',
    implicit: '隐式授权',
    password: '密码授权',
    clientCredentials: '客户端凭证',
    authorizationCode: '授权码',
    public: '公开（无认证）',
    privateAuth: '私有',
    deprecated: '已废弃',
  },
  placeholders: {
    apiTitle: '宠物商店 API',
    apiVersion: '1.0.0',
    apiSummary: '一个简单的宠物管理 API',
    apiDescription: '详细描述您的 API。支持 **Markdown** 格式化。',
    termsOfService: 'https://example.com/terms',
    openApiVersion: '3.1.0',
    contactName: 'API 支持团队',
    contactEmail: 'support@example.com',
    contactUrl: 'https://example.com/support',
    licenseName: 'Apache 2.0',
    licenseIdentifier: 'Apache-2.0',
    licenseUrl: 'https://www.apache.org/licenses/LICENSE-2.0',
    serverUrl: 'https://api.example.com/v1',
    serverDescription: '输入描述...',
    variableEnum: 'val1, val2',
    variableDefault: '例如：v1',
    variableDescription: '描述此变量',
    operationSummary: '例如：获取所有宠物',
    operationId: 'listPets',
    pathUrl: '例如：/pets/{petId}',
    propertyDescription: '描述此属性。支持 Markdown。',
    schemaDescription: '描述此数据模型。支持 **Markdown**。',
    regexPattern: '^[a-z]+$',
    enumValues: 'val1, val2, val3',
  },
};

export const locales: Record<Locale, I18nMessages> = { en, zh };
