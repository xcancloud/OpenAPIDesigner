<script lang="ts" setup>
import { ref, computed, inject } from 'vue';
import { Tag } from 'ant-design-vue';
import Arrow from '@/common/Arrow/index.vue';

const dataSource = inject('dataSource', ref());

const arrowOpen = ref<Boolean[]>([]);

const security = computed(() => {
  return dataSource.value.security || [];
});

const securitySchemes = computed<{[key:string]: {[key: string]: any}}>(() => {
  return dataSource.value?.components?.securitySchemes || {}
});

const getSecurityNames = (securityGroup: {[key: string]: string[] | null}) => {
  return Object.keys(securityGroup).map(name => {
    if (securitySchemes.value[name].type === 'http') {
      if (securitySchemes.value[name].scheme.includes('basic')) {
        return `Basic Auth (${name})`;
      }
      if (securitySchemes.value[name].scheme.includes('bearer')) {
        return `Bearer Auth (${name})`;
      }
    }
    if (securitySchemes.value[name].type === 'apiKey') {
      return `API Key (${name})`;
    }

    if (securitySchemes.value[name].type === 'oauth2') {
      return `OAuth 2.0 (${name})`;
    }
  }).filter(Boolean).join(' & ');
};

const getSecurityContent = (securityGroup: {[key: string]: string[] | null}): { showName: string; type: string; name: string}[] => {
  return Object.keys(securityGroup).map(name => {
    if (securitySchemes.value[name].type === 'http') {
      if (securitySchemes.value[name].scheme.includes('basic')) {
        return {
          showName: `Basic Auth ${name}`,
          type: 'basic_auth',
          name
        };
      }
      if (securitySchemes.value[name].scheme.includes('bearer')) {
        return {
          showName: `Bearer Auth ${name}`,
          type: 'bearer_auth',
          name
        };
      }
    }
    if (securitySchemes.value[name].type === 'apiKey') {
      return {
          showName: `API Key (${name})`,
          type: 'api_key',
          name
      };
    }

    if (securitySchemes.value[name].type === 'oauth2') {
      return {
        showName: `OAuth 2.0 (${name})`,
        type: 'oauth2',
        name
      }
    }
  }).filter(Boolean) as { showName: string; type: string; name: string}[];
}

const getOauth2Flow = (name: string): {[key: string]: {[key: string]: string}} => {
  return securitySchemes.value?.[name]?.flows || {}
};

</script>
<template>
  <div>
    <div class="leading-8 px-2 bg-gray-200">Security</div>
    <div v-for="(securityGroup, idx) in security" :key="idx">
      <div class="h-8 px-2 flex space-x-1 items-center bg-gray-100">
        <Arrow v-model:open="arrowOpen[idx]" />
        <p>{{ getSecurityNames(securityGroup) }}</p>
      </div>
      <div v-show="arrowOpen[idx]" class="px-2 py-3 space-y-2">
        <div v-for="securityNameInfo in getSecurityContent(securityGroup)" class="border p-1">
          <div v-if="securityNameInfo.type !== 'oauth2'" class="font-medium">{{ securityNameInfo.showName }}</div>
          <template v-if="securityNameInfo.type === 'basic_auth'">
            <div>
              Basic authentication is a simple authentication scheme built into the HTTP protocol. To use it, send your HTTP requests with an Authorization header that contains the word Basic followed by a space and a base64-encoded string
              <Tag>username:password</Tag>
            </div>
            <div>
              Example: <Tag>Authorization: Basic ZGVtbzpwQDU1dzByZA==</Tag>
            </div>
          </template>
          <template v-if="securityNameInfo.type === 'bearer_auth'">
            <div>
              Provide your bearer token in the Authorization header when making requests to protected resources.
            </div>
            <div>
              Example: <Tag>Authorization: Bearer 123</Tag>
            </div>
          </template>
          <template v-if="securityNameInfo.type === 'api_key'">
            <div>
              An API key is a token that you provide when making API calls. Include the token in a header parameter called <Tag>api_key</Tag>
            </div>
            <div>
              Example: <Tag>api_key: 123</Tag>
            </div>
          </template>

          <template v-if="securityNameInfo.type === 'oauth2'">
            <div v-for="(value, key) in getOauth2Flow(securityNameInfo.name)">
              <div class="font-medium">
                <template v-if="key === 'implicit'">Implicit OAuth Flow</template>
                <template v-if="key === 'password'">Password OAuth Flow</template>
                <template v-if="key === 'authorizationCode'">Authorization Code OAuth Flow</template>
                <template v-if="key === 'clientCredentials'">Client Credentials Code OAuth Flow</template>
              </div>
              <template v-if="key === 'implicit'">
                <div>Authorize URL: {{value.authorizationUrl}}</div>
                <div>Refresh URL: {{value.refreshUrl}}</div>
              </template>

              <template v-if="key === 'authorizationUrl'">
                <div>Authorize URL: {{value.authorizationUrl}}</div>
                <div>Token URL: {{value.tokenUrl}}</div>
              </template>

              <template v-if="key === 'password'">
                <div>Token URL: {{value.tokenUrl}}</div>
                <div>Refresh URL: {{value.refreshUrl}}</div>
              </template>

              <template v-if="key === 'clientCredentials'">
                <div>Token URL: {{value.tokenUrl}}</div>
                <div>Refresh URL: {{value.refreshUrl}}</div>
              </template>

              <template v-if="value.scopes">
                <div>Scopes:</div>
                <li v-for="(scopeDesc, scopeName, ) in value.scopes" class="list-disc mt-1 pl-4">
                  <Tag>{{scopeName}}</Tag> <span>- {{scopeDesc}}</span>
                </li>
              </template>
            </div>
          </template>
        </div>
      </div>
    </div>
    
  </div>

</template>