<script setup lang="ts">
import { ref, onMounted, inject, onBeforeUnmount, computed, reactive, watch } from 'vue';
import { Form, FormItem, Input, Select, Button } from 'ant-design-vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { flowAuthKeys, authLabels, encryptionTypeOpt, API_EXTENSION_KEY } from './data.ts';
import { useI18n } from 'vue-i18n';

const { valueKey, securityApiKeyPerfix, oAuth2Key, oAuth2Token, newTokenKey, basicAuthKey } = API_EXTENSION_KEY;

type Authentication = {
  type: 'basic'|'bearer'|'apiKey'|'oauth2';
  name: string;
};
const { t } = useI18n();


const flowAuthType = [
  {
    value: 'authorizationCode',
    label: t('authorization_code')
  },
  {
    value: 'password',
    label: t('password_credentials')
  },
  {
    value: 'implicit',
    label: t('implicit')
  },
  {
    value: 'clientCredentials',
    label: t('client_credentials')
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
  showName: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  name: '',
  showName: true
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
      label: t('security_query_parameter')
    },
    {
      value: "BASIC_AUTH_HEADER",
      label: t('security_basic_auth_header')
    },
    {
      value: "REQUEST_BODY",
      label: t('security_request_body')
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

const initHttpBasicData = (data: {name: string, value: string}) => {
  // const decodeMap = decode(data[valueKey].replace(/Basic\s+/, '')) as {name: string, value: string};
  // httpAuthData.value.name = decodeMap.name;
  // httpAuthData.value.value = decodeMap.value;
  const {name = '', value = '' } = data || {};
  httpAuthData.value.name = name || '';
  httpAuthData.value.value = value || '';
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
    data = { type: 'http', [basicAuthKey]: {name: httpAuthData.value?.name, value: httpAuthData.value?.value}, scheme: 'basic' }
  }
  if (formState.value.type === 'bearer') {
    httpAuthData.value.value = httpAuthData.value.value.startsWith('Bearer ') ? httpAuthData.value.value : 'Bearer ' + httpAuthData.value.value;
    scheme.value = httpAuthData.value.value;
    data = { type: 'http', [valueKey]: httpAuthData.value.value, scheme: 'bearer' };
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
  return JSON.parse(JSON.stringify({
    [formState.value.securityName]: data
  }));
};

onMounted(() => {

  watch(() => props.data, (newValue) => {
    if (!newValue) {
      return;
    }
    formState.value.securityName = newValue.securityName;
    if (newValue?.scheme) {
      if (newValue.scheme === 'basic') {
        // scheme.value = newValue[valueKey];
        initHttpBasicData(newValue[basicAuthKey]);
        formState.value.type = 'basic';
      } else if (newValue.scheme === 'bearer') {
        formState.value.type = 'bearer';
        // scheme.value = newValue[valueKey];
        httpAuthData.value.name = newValue[valueKey];
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

});

defineExpose({
  getData: getData
});

</script>

<template>
<Form
  :model="formState"
  layout="vertical">
  <div class="flex space-x-2">
    <FormItem :label="t('type')" name="type" required class="flex-1/3">
      <Select
        v-model:value="formState.type"
        :options="authTypeOpt" />
    </FormItem>
    <FormItem v-show="props.showName" :label="t('name')" name="securityName" required  class="flex-2/3">
      <Input
        v-model:value="formState.securityName"
        :maxlength="100"
        :placeholder="t('security_name_placeholder')" />
    </FormItem>
  </div>

  <template v-if="formState.type === 'basic'">
    <div class="flex space-x-2">
      <FormItem :label="t('username')" class="flex-1/3">
        <Input
          v-model:value="httpAuthData.name"
          :maxlength="200"
          :placeholder="t('security_username_placeholder')" />
      </FormItem>

      <FormItem :label="t('password')" class="flex-2/3">
        <Input
          v-model:value="httpAuthData.value"
          :maxlength="800"
          :placeholder="t('security_password_placeholder')" />
      </FormItem>
    </div>
  </template>

  <template v-if="formState.type==='bearer'">
    <FormItem :label="t('token')">
      <Input
        v-model:value="httpAuthData.value"
        :maxlength="800"
        :placeholder="t('security_bearer_token_placeholder')" />
    </FormItem>
  </template>

  <template v-if="formState.type==='apiKey'">
    <div class="flex space-x-2">
      <FormItem :label="t('param_name')" class="flex-1/3">
        <Input
          v-for="(, idx) in apiKeyContentList"
          v-model:value="apiKeyContentList[idx].name"
          :key="idx+'name'"
          class="mb-2"
          :maxlength="100"
          :placeholder="t('security_apikey_name_placeholder')" />
      </FormItem>
      <FormItem :label="t('param_value')" class="flex-1/3">
        <Input
          v-for="(, idx) in apiKeyContentList"
          class="mb-2"
          v-model:value="apiKeyContentList[idx]['x-xc-value']"
          :key="idx+'value'"
          :placeholder="t('security_apikey_value_placeholder')" />
      </FormItem>
      <FormItem :label="t('param_in')" class="flex-1/3">
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
          :options="[{value: 1, label: t('has_token')}, {value: 2, label: t('generate_token')}]" />
      </FormItem>
      <FormItem v-if="oauthKey === 1"  class="flex-2/3">
        <Input
          v-model:value="scheme"
          :maxlength="800"
          :placeholder="t('token_placeholder')" />
      </FormItem>
      <FormItem v-if="oauthKey === 2"  class="flex-2/3">
        <Select
          v-model:value="authType"
          :options="flowAuthType"
          @change="onOauthFlowTypeChange" />
      </FormItem>
    </div>
    <template v-if="oauthKey === 2">
      <FormItem v-for="item in flowauthLabel" :key="item.valueKey" :required="item.required" :label="t(item.label_i18n)">
        <Select
          v-if="item.valueKey === 'x-xc-oauth2-challengeMethod'"
          v-model:value="oauthData[item.valueKey]"
          :placeholder="item.maxLength ? t('input_max_placeholder', {num: item.maxLength}) : ''"
          :options="encryptionTypeOpt" />
        <Select
          v-else-if="item.valueKey==='scopes'"
          v-model:value="oauthData[item.valueKey]"
          :placeholder="item.maxLength ? t('input_max_placeholder', {num: item.maxLength}) : ''"
          mode="tags" />
        <Input
          v-else
          v-model:value="oauthData[item.valueKey]"
          :allowClear="true"
          :placeholder="item.maxLength ? t('input_max_placeholder', {num: item.maxLength}) : ''"
          :maxlength="item.maxLength" />
      </FormItem>
      <FormItem :label="t('client_auth')">
        <Select
          v-model:value="oauthData['x-xc-oauth2-clientAuthType']"
          :options="authClientInOpt" />
      </FormItem>
    </template>
  </template>
</Form>
</template>
