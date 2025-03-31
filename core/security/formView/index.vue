<script setup lang="ts">
import { ref, onMounted, inject, onBeforeUnmount, computed, reactive, watch } from 'vue';
import { Form, FormItem, Input, Select, Button } from 'ant-design-vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { flowAuthKeys, authLabels, encryptionTypeOpt, API_EXTENSION_KEY } from './data.ts';

const { valueKey, securityApiKeyPerfix, oAuth2Key, oAuth2Token, newTokenKey, basicAuthKey } = API_EXTENSION_KEY;
const getAppFunc = inject('getAppFunc', ()=>{});

type Authentication = {
  type: 'basic'|'bearer'|'apiKey'|'oauth2';
  name: string;
};


const flowAuthType = [
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

interface AuthItem {
  name?: string;
  type: 'http'|'apiKey'|'oauth2'|'extends';
  flows?: Record<string, any>;
  in?: string;
  scheme?: string;
  $ref?: string;
  'x-xc-value'?: string
}

interface Props {
  data:AuthItem;
  name: string;
}

const props = withDefaults(defineProps<Props>(), {
  name: ''
});

const oauthKey = ref(1);
const scheme = ref(); // http 类型下 值
const authType = ref<'authorizationCode'|'password'|'implicit'|'clientCredentials'>('clientCredentials');
let scopesObj = {};

const flowauthLabel = computed(() => {
  return authLabels.filter(i => {
    return flowAuthKeys[authType.value].includes(i.valueKey);
  });
});

const formState = ref<Authentication>({
  type: 'basic',
  name: ''
});

const httpAuthData = ref({
  name: '',
  value: ''
});

const apiKeyContentList = ref<{name: string, in: string, 'x-xc-value': string}[]>([
  {
    name: '',
    in: 'header',
    'x-xc-value': ''
  }
]);

const authTypeOpt = [
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
];

const authClientInOpt = [
    {
      value: "QUERY_PARAMETER",
      label: "通过Query参数发送"
    },
    {
      value: "BASIC_AUTH_HEADER",
      label: "通过Basic认证头发送"
    },
    {
      value: "REQUEST_BODY",
      label: "通过请求体发送"
    }
]

// oauth2 方案
const oauthData = reactive({
  authorizationUrl: undefined,
  tokenUrl: undefined,
  refreshUrl: undefined,
  scopes: [],
  'x-xc-oauth2-clientId': undefined,
  'x-xc-oauth2-clientSecret': undefined,
  'x-xc-oauth2-callbackUrl': undefined,
  'x-xc-oauth2-username': undefined,
  'x-xc-oauth2-password': undefined,
  'x-xc-oauth2-clientAuthType': 'REQUEST_BODY'
});

// apikey 方案
const initApiKeyContentList = (newValue) => {
  // const { name, in } = newValue;
  const first = { name: newValue.name, in: newValue.in || 'header', [valueKey]: newValue[valueKey] };
  const others = newValue[securityApiKeyPerfix] || [];
  apiKeyContentList.value = [first, ...others];
};

const initHttpBasicData = (data: {name: string; value: string}) => {
  // const decodeMap = decode(scheme.value.replace(/Basic\s+/, '')) as {name: string, value: string};
  // httpAuthData.name = decodeMap.name;
  // httpAuthData.value = decodeMap.value;
  const { name = '', value = '' } = data || {};
  httpAuthData.name = name || '';
  httpAuthData.value = value || '';
};

const addApiKey = () => {
  apiKeyContentList.value.push({
    name: '',
    in: 'header',
    'x-xc-value': ''
  });
}

const deleteApiKey = (idx: number) => {
  apiKeyContentList.value.splice(idx, 1);
};

const onOauthFlowTypeChange = (authFlow) => {
  const data: {[key: string]: any} = {};
  oauthData['x-xc-oauth2-clientAuthType'] = 'REQUEST_BODY';
  flowAuthKeys[authType.value].forEach(i => {
    if (i === 'scopes') {
      scopesObj = data[i] || {};
      oauthData[i] = Object.keys(scopesObj);
    } else {
      oauthData[i] = data[i];
    }
  });
};

const pakageOauthData = () => {
  const flowData:{[key: string]: any} = {
    'x-xc-oauth2-clientAuthType': oauthData['x-xc-oauth2-clientAuthType']
  };
  flowAuthKeys[authType.value].forEach(i => {
    if (i === 'scopes') {
      const scopes = {};
      oauthData[i].forEach(key => {
        scopes[key] = scopesObj[key] || '';
      });
      flowData[i] = scopes;
    } else {
      flowData[i] = oauthData[i];
    }
  });
  const authKey = authType.value === 'authorizationCodePKCE' ? 'authorizationCode' : authType.value;
  const data = {
    type: 'oauth2',
    flows: {
      [authKey]: flowData
    },
    [oAuth2Key]: authType.value,
    [oAuth2Token]: scheme.value,
    [newTokenKey]: oauthKey.value === 2
  };
  return data;
};


const getData = () => {
  let data = {};
  if (formState.value.type === 'basic') {
    data = { type: 'http', [basicAuthKey]: httpAuthData.value, scheme: formState.value.type }
  }
  if (formState.value.type === 'bearer') {
    httpAuthData.value.value = httpAuthData.value.value.startsWith('Bearer ') ? httpAuthData.value.value : 'Bearer ' + httpAuthData.value.value;
    scheme.value = httpAuthData.value;
    data = { type: 'http', [valueKey]: scheme.value, scheme: formState.value.type };
  }

  if (formState.value.type === 'apiKey') {
    const { name } = apiKeyContentList.value.filter(i => i.name)[0] || {};
    const lists = apiKeyContentList.value.slice(1);
    data = {
      type: 'apiKey',
      name,
      in: apiKeyContentList.value[0].in,
      [valueKey]: apiKeyContentList.value[0][valueKey],
      [securityApiKeyPerfix]: lists.length ? lists : undefined
      // [xcAuthMethod]: type.value
    };
  }
  if (formState.value.type === 'oauth2') {
    data = pakageOauthData();
  }
  // const data = JSON.parse(JSON.stringify(formState.value));
  return JSON.parse(JSON.stringify(data));
};

onMounted(() => {

  watch(() => props.data, (newValue) => {
    if (!newValue) {
      return;
    }
    if (newValue?.scheme) {
      if (newValue.scheme === 'basic') {
        // scheme.value = newValue[valueKey];
        initHttpBasicData(newValue[basicAuthKey]);
        formState.value.type = 'basic';
      } else if (newValue.scheme === 'bearer') {
        formState.value.type = 'bearer';
        scheme.value = newValue[valueKey];
        httpAuthData.name = scheme.value;
      }
      return;
    }
    if (newValue?.type === 'oauth2') {
      formState.value.type = 'oauth2';
      if (newValue[newTokenKey]) {
        oauthKey.value = 2;
      }
      authType.value = newValue[oAuth2Key] || 'clientCredentials';
      if (newValue.flows) {
        oauthData['x-xc-oauth2-clientAuthType'] = newValue.flows[authType.value]?.['x-xc-oauth2-clientAuthType'];
        flowAuthKeys[authType.value].forEach(i => {
          if (i === 'scopes') {
            scopesObj = newValue.flows[authType.value]?.[i] || {};
            oauthData[i] = Object.keys(scopesObj);
          } else {
            oauthData[i] = newValue.flows[authType.value]?.[i];
          }
        });
        scheme.value = newValue[oAuth2Token];
      }
      return;
    }
    if (newValue?.type === 'apiKey') {
      formState.value.type = 'apiKey';
      initApiKeyContentList(newValue);
    }
  }, {
    immediate: true
  })

  // getAppFunc({name: 'getDocInfoFormData', func: getData});
});

onBeforeUnmount(() => {
  // getAppFunc({name: 'getDocInfoFormData', func: () => ({})});
});

defineExpose({
  getFormData: getData
});

</script>

<template>
<Form
  :model="formState"
  layout="vertical">
  <div class="flex space-x-2">
    <FormItem label="类型" name="type" required class="flex-1/3">
      <Select
        v-model:value="formState.type"
        :options="authTypeOpt" />
    </FormItem>
    <FormItem label="名称" name="name" required  class="flex-2/3">
      <Input
        v-model:value="formState.name"
        :maxlength="100"
        placeholder="安全方案名称，要求不能重复，会在安全需求中引用，最多100个字符" />
    </FormItem>
  </div>

  <template v-if="formState.type === 'basic'">
    <div class="flex space-x-2">
      <FormItem label="用户名" class="flex-1/3">
        <Input
          v-model:value="httpAuthData.name"
          :maxlength="200"
          placeholder="Basic认证用户名，最多200个字符" />
      </FormItem>

      <FormItem label="密码" class="flex-2/3">
        <Input
          v-model:value="httpAuthData.value"
          :maxlength="800"
          placeholder="Basic认证用密码，最多800个字符" />
      </FormItem>
    </div>
  </template>

  <template v-if="formState.type==='bearer'">
    <FormItem label="令牌">
      <Input
        v-model:value="httpAuthData.value"
        :maxlength="800"
        placeholder="Bearer认证访问令牌，最多800个字符" />
    </FormItem>
  </template>

  <template v-if="formState.type==='apiKey'">
    <div class="flex space-x-2">
      <FormItem label="参数名称" class="flex-1/3">
        <Input
          v-for="(, idx) in apiKeyContentList"
          v-model:value="apiKeyContentList[idx].name"
          :key="idx+'name'"
          class="mb-2"
          placeholder="API认证参数名称，最多100个字符" />
      </FormItem>
      <FormItem label="参数值" class="flex-1/3">
        <Input
          v-for="(, idx) in apiKeyContentList"
          class="mb-2"
          v-model:value="apiKeyContentList[idx]['x-xc-value']"
          :key="idx+'value'"
          placeholder="API认证参数值，最多800个字符" />
      </FormItem>
      <FormItem label="参数位置" class="flex-1/3">
        <div v-for="(, idx) in apiKeyContentList" :key="idx+'in'" class="flex items-center mb-2">
          <Select
            v-model:value="apiKeyContentList[idx].in"
            :options="[{value: 'header', label: 'header'},{value: 'query', label: 'query'}]" />
          <Button v-show="apiKeyContentList.length > 1" size="small" type="link" @click="deleteApiKey(idx)">
            <DeleteOutlined />
          </Button>
          <Button
            size="small"
            type="link"
            :class="{'invisible': idx !== 0}"
            @click="addApiKey" >
            <PlusOutlined />
          </Button>
        </div>
      </FormItem>
    </div>
  </template>

  <template v-if="formState.type==='oauth2'">
    <div class="flex space-x-2">
      <FormItem class="flex-1/3">
        <Select
          v-model:value="oauthKey"
          :options="[{value: 1, label: '已有令牌'}, {value: 2, label: '生成令牌'}]" />
      </FormItem>
      <FormItem v-if="oauthKey === 1"  class="flex-2/3">
        <Input
          v-model:value="scheme"
          :maxlength="800"
          placeholder="证访问令牌，最多800个字符" />
      </FormItem>
      <FormItem v-if="oauthKey === 2"  class="flex-2/3">
        <Select
          v-model:value="authType"
          :options="flowAuthType"
          @change="onOauthFlowTypeChange" />
      </FormItem>
    </div>
    <template v-if="oauthKey === 2">
      <FormItem v-for="item in flowauthLabel" :key="item.valueKey" :required="item.required" :label="item.label">
        <Select
          v-if="item.valueKey === 'x-xc-oauth2-challengeMethod'"
          v-model:value="oauthData[item.valueKey]"
          :placeholder="item.maxLength ? `最多可输入${ item.maxLength }个字符` : ''"
          :options="encryptionTypeOpt" />
        <Select
          v-else-if="item.valueKey==='scopes'"
          v-model:value="oauthData[item.valueKey]"
          :placeholder="item.maxLength ? `最多可输入${ item.maxLength }个字符` : ''"
          mode="tags" />
        <Input
          v-else
          v-model:value="oauthData[item.valueKey]"
          :allowClear="true"
          :placeholder="item.maxLength ? `最多可输入${ item.maxLength }个字符` : ''"
          :maxlength="item.maxLength" />
      </FormItem>
      <FormItem label="客户端认证">
        <Select
          v-model:value="oauthData['x-xc-oauth2-clientAuthType']"
          :options="authClientInOpt" />
      </FormItem>
    </template>
  </template>


</Form>
</template>./data.js