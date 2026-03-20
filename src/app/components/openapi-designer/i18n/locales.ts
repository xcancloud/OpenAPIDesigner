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
    responseHeaders: string;
    responseBody: string;
    requestUrl: string;
    authorization: string;
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
    responseHeaders: 'Response Headers',
    responseBody: 'Response Body',
    requestUrl: 'Request URL',
    authorization: 'Authorization',
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
};

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
    responseHeaders: '响应头',
    responseBody: '响应体',
    requestUrl: '请求地址',
    authorization: '认证授权',
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
};

export const locales: Record<Locale, I18nMessages> = { en, zh };
