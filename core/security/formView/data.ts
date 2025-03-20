
export const inOpt = [
  {
    value: 'query',
    label: 'query'
  },
  {
    value: 'header',
    label: 'header'
  }
];

export const authTypeOptions = [
  {
    label: '不认证',
    value: null
  },
  {
    label: 'Basic Auth',
    value: 'basic'
  },
  {
    label: 'Bearer Token',
    value: 'bearer'
  },
  {
    label: 'Api Key',
    value: 'apiKey'
  },
  {
    label: 'OAuth 2.0',
    value: 'oauth2'
  },

  {
    label: '公共',
    value: 'extends'
  }
];

export const authInOpt = [
  {
    label: '通过Basic认证头发送',
    value: 'BASIC_AUTH_HEADER'
  },
  {
    label: '通过请求体发送',
    value: 'REQUEST_BODY'
  }
];

export const flowAuthType = [
  {
    value: 'authorizationCode',
    label: '授权码模式（Authorization Code）'
  },
  {
    value: 'password',
    label: '密码模式（Password Credentials）'
  },
  {
    value: 'implicit',
    label: '隐式模式（Implicit）'
  },
  {
    value: 'clientCredentials',
    label: '客户端模式（Client Credentials））'
  }
];

export const authLabels = [
  {
    valueKey: 'authorizationUrl',
    label: '授权URL',
    maxLength: 400,
    required: true
  },
  {
    valueKey: 'x-xc-oauth2-callbackUrl',
    label: '回调URL',
    maxLength: 400,
    required: true
  },
  {
    valueKey: 'tokenUrl',
    label: '访问令牌URL',
    maxLength: 400,
    required: true
  },
  {
    valueKey: 'refreshUrl',
    label: '刷新令牌URL',
    maxLength: 400
  },
  {
    valueKey: 'x-xc-oauth2-clientId',
    label: '客户端ID',
    maxLength: 400,
    required: true
  },
  {
    valueKey: 'x-xc-oauth2-clientSecret',
    label: '客户端密钥',
    maxLength: 1024,
    required: true
  },
  {
    valueKey: 'x-xc-oauth2-username',
    label: '用户名',
    maxLength: 400,
    required: true
  },
  {
    valueKey: 'x-xc-oauth2-password',
    label: '密码',
    maxLength: 1024,
    required: true
  },
  {
    valueKey: 'x-xc-oauth2-challengeMethod',
    label: '加密方式'
  },
  {
    valueKey: 'x-xc-oauth2-codeVerifier',
    label: '验证码'
  },
  {
    valueKey: 'scopes',
    label: 'Scope',
    maxLength: 200
  }
];

export const encryptionTypeOpt = [
  {
    value: 'SHA-256',
    label: 'SHA-256'
  },
  {
    value: 'Plain',
    label: 'Plain'
  }
];

export const authorizationCode = [
  'authorizationUrl',
  'x-xc-oauth2-callbackUrl',
  'tokenUrl',
  'refreshUrl',
  'x-xc-oauth2-clientId',
  'x-xc-oauth2-clientSecret',
  'scopes'
];
export const password = [
  'tokenUrl',
  'refreshUrl',
  'x-xc-oauth2-clientId',
  'x-xc-oauth2-clientSecret',
  'x-xc-oauth2-username',
  'x-xc-oauth2-password',
  'scopes'
];
export const implicit = [
  'authorizationUrl',
  'x-xc-oauth2-callbackUrl',
  // 'tokenUrl',
  'refreshUrl',
  'x-xc-oauth2-clientId',
  'x-xc-oauth2-clientSecret',
  'scopes'
];
export const clientCredentials = [
  'tokenUrl',
  'refreshUrl',
  'x-xc-oauth2-clientId',
  'x-xc-oauth2-clientSecret',
  'scopes'
];
export const authorizationCodePKCE = [
  'authorizationUrl',
  'x-xc-oauth2-callbackUrl',
  'tokenUrl',
  'refreshUrl',
  'x-xc-oauth2-clientId',
  'x-xc-oauth2-clientSecret',
  'x-xc-oauth2-challengeMethod',
  'x-xc-oauth2-codeVerifier',
  'scopes'
];

export const flowAuthKeys = {
  authorizationCode,
  password,
  implicit,
  clientCredentials,
  authorizationCodePKCE
};

export const API_EXTENSION_KEY = {
  perfix: 'x-xc-', // 前缀
  valueKey: 'x-xc-value', // 值
  enabledFlagKey: 'x-xc-enabledFlag', // 启用/禁用
  exportVariableFlagKey: 'x-xc-exportVariableFlag', // 是否设置成变量
  requestSettingKey: 'x-xc-requestSetting', // 接口设置 例如超时时间等设置, object
  serverNameKey: 'x-xc-serverName', // 服务器URL名称
  serverSourceKey: 'x-xc-serverSource', // 服务器来源
  securityApiKeyPerfix: 'x-xc-apiKey', // apiKey 类型扩展
  securitySubTypeKey: 'sx-xc-securitySubType', // 安全方案子类型
  fileNameKey: 'x-xc-fileName', // 文件名称
  newTokenKey: 'x-xc-oauth2-newToken', // 是否使用生成认证令牌
  oAuth2Key: 'x-xc-oauth2-authFlow', // 生成令牌授权类型
  oAuth2Token: 'x-xc-oauth2-token', // 已有令牌 token
  formContentTypeKey: 'x-xc-contentType',
  basicAuthKey: 'x-xc-basicAuth',
  wsMessageKey: 'x-wsMessage'
};

