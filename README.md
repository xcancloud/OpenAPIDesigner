# OpenAPIDesigner
OpenAPIDesigner is an open-source OpenAPI specification design Tool that allows developers to design, write, and validate OpenAPI specifications.

## Install

```
  npm install open-api-designer
```

## Use

### Usage in html
```html
<!doctype html> <!-- Important: must specify -->
<html>
  <head>
    <meta charset="utf-8"> <!-- Important: rapi-doc uses utf8 characters -->
    <script type="module" src=""></script>
  </head>
  <body>
   <div class="open-api"></div>
  </body>
</html>
  
```

```js
import OpenApiDesign from 'open-api-designer';
import 'open-api-designer/style.css'
const apidoc = {
    "openapi": "3.0.0",
    "info": {
        "title": "PayPal APIs",
        "description": "",
        "version": "1.0.0"
    },
    "servers": [
        {
            "url": "http://{{base_url}}",
            "emptyContent": false,
            "notEmptyContent": true,
            "x-xc-id": 272139755771134050,
            "x-xc-serverSource": "PARENT_SERVERS"
        }
    ],
    "paths": {
       "/pet": {
        "put": {
          "tags": [
            "pet"
          ],
          "summary": "Update an existing pet",
          "description": "Update an existing pet by Id",
          "operationId": "updatePet",
          "parameters": [
            {
              "name": "Content-Type",
              "in": "header",
              "required": true,
              "deprecated": false,
              "schema": {
                "type": "array"
              }
            },
          ],
          "requestBody": {
            "$ref": "#/components/requestBodies/UserArray"
          },
          "responses": {
            "200": {
              "description": "Successful operation",
              "content": {

                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer",
                        "format": "int64",
                        "x-xc-value": 10
                      },
                      "name": {
                        "type": "string",
                        "x-xc-value": "doggie"
                      },
                      "tags": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "integer",
                              "description": "标签的id",
                              "format": "int64",
                              "x-xc-value": 1001
                            },
                            "name": {
                              "type": "string",
                              "description": "标签的名称",
                              "x-xc-value": "张安"
                            }
                          },
                          "xml": {
                            "name": "tag"
                          }
                        },
                        "xml": {
                          "wrapped": true
                        }
                      },
                      "status": {
                        "type": "string",
                        "enum": [
                          "available",
                          "pending",
                          "sold"
                        ],
                        "description": "pet status in the store",
                        "x-xc-value": "available"
                      },
                      "category": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "integer",
                            "format": "int64",
                            "x-xc-value": 1
                          },
                          "name": {
                            "type": "string",
                            "x-xc-value": "Dogs"
                          },
                          "order": {
                            "type": "object",
                            "properties": {
                              "id": {
                                "type": "integer",
                                "format": "int64",
                                "x-xc-value": 10
                              },
                              "user": {
                                "type": "array",
                                "items": {
                                  "type": "object",
                                  "properties": {
                                    "id": {
                                      "type": "integer",
                                      "format": "int64",
                                      "x-xc-value": 10
                                    },
                                    "email": {
                                      "type": "string",
                                      "x-xc-value": "john@email.com"
                                    },
                                    "phone": {
                                      "type": "string",
                                      "x-xc-value": "12345"
                                    },
                                    "lastName": {
                                      "type": "string",
                                      "x-xc-value": "James"
                                    },
                                    "password": {
                                      "type": "string",
                                      "x-xc-value": "12345"
                                    },
                                    "username": {
                                      "type": "string",
                                      "x-xc-value": "theUser"
                                    },
                                    "firstName": {
                                      "type": "string",
                                      "x-xc-value": "John"
                                    },
                                    "userStatus": {
                                      "type": "integer",
                                      "description": "User Status",
                                      "format": "int32",
                                      "x-xc-value": 1
                                    }
                                  },
                                  "xml": {
                                    "name": "user"
                                  }
                                }
                              },
                              "petId": {
                                "type": "integer",
                                "format": "int64",
                                "x-xc-value": 198772
                              },
                              "status": {
                                "type": "string",
                                "enum": [
                                  "placed",
                                  "approved",
                                  "delivered"
                                ],
                                "description": "Order Status",
                                "x-xc-value": "placed"
                              },
                              "complete": {
                                "type": "boolean"
                              },
                              "quantity": {
                                "type": "integer",
                                "format": "int32",
                                "x-xc-value": 7
                              },
                              "shipDate": {
                                "type": "string",
                                "format": "date-time"
                              }
                            },
                            "xml": {
                              "name": "order"
                            }
                          }
                        },
                        "xml": {
                          "name": "category"
                        }
                      },
                      "photoUrls": {
                        "type": "array",
                        "items": {
                          "type": "string",
                          "format": "integer",
                          "x-xc-value": "test",
                          "xml": {
                            "name": "photoUrl"
                          }
                        },
                        "xml": {
                          "wrapped": true
                        }
                      }
                    },
                    "required": [
                      "name",
                      "photoUrls"
                    ],
                    "xml": {
                      "name": "pet"
                    }
                  }
                }
              }
            },
          },
          "security": [
            {
              "petstore_auth": [
                "write:pets",
                "read:pets"
              ],
              "OAuth2": [
                "read",
                "write",
                "admin"
              ],
              "api_key": [],
              "ApiKeyAuth": [],
              "BearerAuth": [],
              "apiKey_1": [],
              "apiKey_2": [],
              "apiKey_3": [
                "scope_1"
              ]
            },
          ],
          "servers": [
            {
              "url": "https://petstore3.swagger.io/api/{versions}/{tags}",
              "description": "",
              "variables": {
                "tags": {
                  "description": "",
                  "default": "pet2",
                  "enum": [
                    "pet2",
                    "store",
                    ""
                  ]
                },
                "versions": {
                  "description": "",
                  "default": "v3",
                  "enum": [
                    "v1",
                    "v2",
                    "v3"
                  ]
                },
                "var1": {
                  "default": "ads",
                  "enum": [
                    "ads",
                    ""
                  ]
                }
              }
            },
          ],
          "x-internal": false,
        }, 
    },
     "externalDocs": {
      "url": "http://swagger.io",
      "description": "Find out more about Swagger"
    },
    "components": {
       "securitySchemes": {
        "petstore_auth": {
          "type": "oauth2",
          "flows": {
            "implicit": {
              "refreshUrl": "",
              "authorizationUrl": "https://petstore3.swagger.io/oauth/authorize",
              "scopes": {
                "write:pets": "modify pets in your account",
                "read:pets": "read your pets"
              }
            }
          }
        },
        "OAuth2": {
          "type": "oauth2",
          "flows": {
            "authorizationCode": {
              "refreshUrl": "",
              "authorizationUrl": "https://example.com/oauth/authorize",
              "scopes": {
                "read": "Grants read access",
                "write": "Grants write access",
                "admin": "Grants access to admin operations"
              },
              "tokenUrl": "https://example.com/oauth/token"
            }
          }
        },
        "BasicAuth": {
          "type": "http",
          "scheme": "basic"
        },
        "api_key": {
          "type": "apiKey",
          "name": "api_key",
          "in": "header"
        },
        "ApiKeyAuth": {
          "type": "apiKey",
          "name": "X-API-Key",
          "in": "header"
        },
        "BearerAuth": {
          "type": "http",
          "scheme": "bearer"
        },
        "apiKey_1": {
          "type": "apiKey",
          "name": "apiKey",
          "in": "query"
        },
        "apiKey_2": {
          "type": "openIdConnect",
          "openIdConnectUrl": ""
        },
        "apiKey_3": {
          "type": "oauth2",
          "flows": {
            "password": {
              "refreshUrl": "",
              "tokenUrl": "",
              "scopes": {}
            },
            "implicit": {
              "refreshUrl": "",
              "authorizationUrl": "",
              "scopes": {}
            },
            "authorizationCode": {
              "refreshUrl": "",
              "authorizationUrl": "",
              "scopes": {},
              "tokenUrl": ""
            },
            "clientCredentials": {
              "refreshUrl": "",
              "scopes": {
                "scope_1": ""
              },
              "tokenUrl": ""
            }
          }
        },
        "apiKey_4": {
          "type": "apiKey",
          "name": "apiKey",
          "in": "query"
        }
      },
      "schemas": {
        "Order": {
          "type": "object",
          "properties": {
            "q": {
              "allOf": [
                {
                  "$ref": "#/components/schemas/Tag"
                },
                {
                  "type": "array",
                  "items": {
                    "type": "array",
                    "items": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "11": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "ii": {
                                  "type": "array",
                                  "items": {
                                    "type": "object"
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
              ]
            }
          },
          "examples": [
            {
              "q": 0
            }
          ],
          "xml": {
            "name": "order"
          }
        },
        "Tag": {
          "type": "object",
          "properties": {
            "id": {
              "type": "integer",
              "description": "标签的id",
              "format": "int64",
              "x-xc-value": 1001
            },
            "name": {
              "type": "string",
              "description": "标签的名称",
              "x-xc-value": "张安"
            },
            "": {
              "type": "string"
            }
          },
          "xml": {
            "name": "tag"
          }
        }
      }
    }
  }
const myapi = new OpenApiDesign('.open-api', {
  language: 'en', // default zh_CN
  openApiDoc: apidoc
});

```


### In JavaScript Apps (integration with other frameworks)
```
  npm install open-api-designer
```


#### Usage in React

```js
import React, { Component } from 'react';
import OpenApiDesigner from 'open-api-designer';
import 'open-api-designer/style.css';

export class MyApiDoc extends Component {

  componentDidMount() {
    const myOpenApiDesigner = new OpenApiDesigner('.my-api-doc', {
      language: 'en' // default zh_CN,
      openApiDoc: {} // your doc json
    })
  }

  render() {
    return <div class="my-api-doc"></div>
  }
}
```
#### Usage in Vue

```vue
<script setup lang="ts">
import {ref, onMounted} from 'vue';
import OpenApiDesigner from 'open-api-designer';
import 'open-api-designer/style.css';

onMounted(() => {
  const myOpenApiDesigner = new OpenApiDesigner('.my-api-doc', {
    language: 'en' // default zh_CN,
    openApiDoc: {} // your doc json
  })
})
</script>

<template>
<div class="my-api-doc"></div>
</template>
```



#### view demo
```
  npm run build

  npm run demo
```

## Option
- ### element or element class or element id;
- ### option
  - #### langauge：en | zh_CN (default en)
  - #### openApiDoc: your apidoc OBject
  - #### onMountedCallback: Function, Cycle after loading

## Function
- ### getDocApi : return apidoc (JSON);
- ### updateData: update apidoc (JSON) after edit (apidoc (JSON) will auto update after you leave form page);


