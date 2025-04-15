
import { Script } from 'vm';
<script setup lang="ts">
import { ref, inject, computed, defineAsyncComponent, onMounted, watch } from 'vue';
import { Tag, RadioGroup, RadioButton } from 'ant-design-vue';
import { methodColor } from '../apisModel/PropTypes';

const EasyMd = defineAsyncComponent(() => import('@/common/easyMd/index.vue'));

const BodyModelView = defineAsyncComponent(() => import('./bodyModelView.vue'));
const ParamModelView = defineAsyncComponent(() => import('./parameterModelView.vue'));

interface Props {
  apis: {
    endpoint: string;
    method: string;
  }
};

const props = withDefaults(defineProps<Props>(), {
  apis: () => ({
    endpoint: '',
    method: 'get'
  }),
});

const dataSource = inject('dataSource', ref());


const apiInfo = computed(() => {
  const {endpoint,  method } = props.apis;
  return dataSource.value?.paths?.[endpoint]?.[method] || {};
});

const requestBody = computed(() => {
  let body = apiInfo.value.requestBody || {};
  if (body.$ref) {
    const modelTypeNameStrs = apiInfo.value.requestBody.$ref.replace('#/components/', '').split('/');
    const modelType = modelTypeNameStrs[0];
    const modelName = modelTypeNameStrs.splice(1, modelTypeNameStrs.length - 1).join('/');
    body = dataSource.value.components[modelType][modelName];
  };
  return body;
});

const parameters = computed<{name: string; in: string; schema: {type?: string; $ref?: string; properties?: any}}[]>(() => {
  return apiInfo.value.parameters || [];
});
const queryParamters = computed(() => {
  return parameters.value.filter(item => item.in === 'query');
});
const pathParamters = computed(() => {
  return parameters.value.filter(item => item.in === 'path');
});
const headerParamters = computed(() => {
  return parameters.value.filter(item => item.in === 'header');
});
const cookieParamters = computed(() => {
  return parameters.value.filter(item => item.in === 'cookie');
});

const responses = computed(() => {
  let body = apiInfo.value.responses || {};
  return body;
});

const responseStatus = computed(() => {
  return Object.keys(responses.value);
});

const currentRespStatus = ref<string>('');
const reponseBody = computed(() => {
  let body = responses.value?.[currentRespStatus.value]?.content || {};
  if (body.$ref) {
    const modelTypeNameStrs = apiInfo.value.requestBody.$ref.replace('#/components/', '').split('/');
    const modelType = modelTypeNameStrs[0];
    const modelName = modelTypeNameStrs.splice(1, modelTypeNameStrs.length - 1).join('/');
    body = dataSource.value.components[modelType][modelName];
  };
  const respHeaders = responses.value?.[currentRespStatus.value]?.headers || {};
  let headers = Object.keys(respHeaders).map(key => {
    return {
      name: key,
      ...respHeaders[key]
    }
  });
  return {
    content: body,
    description: responses.value?.[currentRespStatus.value]?.description,
    headers
  };
});



onMounted(() => {
  watch(() => props.apis, () => {
    currentRespStatus.value = responseStatus.value[0];
  }, {
    immediate: true
  })
})

</script>
<template>
  <div class="space-y-4">
    <div class="text-6 font-medium">{{ apiInfo.summary }}</div>

    <div class="p-2 rounded bg-gray-50 inline-block">
      <Tag :color="methodColor[props.apis.method]" class="h-7 leading-6 text-4 rounded">{{ props.apis.method }}</Tag>
      {{ props.apis.endpoint }}
    </div>

    <EasyMd v-if="apiInfo.description" :key="`${props.apis.endpoint}_${props.apis.method}`" :value="apiInfo.description" :preview="true" />

    <template v-if="parameters.length">
      <template v-if="queryParamters.length">
        <div class="text-5 font-medium">Query Parameters</div>
        <ParamModelView :params="queryParamters" />
      </template>
      <template v-if="pathParamters.length">
        <div class="text-5 font-medium">Path Parameters</div>
        <ParamModelView :params="pathParamters" />
      </template>
      <template v-if="headerParamters.length">
        <div class="text-5 font-medium">Header Parameters</div>
        <ParamModelView :params="headerParamters" />
      </template>
      <template v-if="cookieParamters.length">
        <div class="text-5 font-medium">Cookie Parameters</div>
        <ParamModelView :params="cookieParamters" />
      </template>
    </template>

    <template v-if="requestBody">

      <div class="text-6 font-semibold">Request</div>

      <BodyModelView :body="requestBody" />

    </template>
   
    <template v-if="responseStatus.length">

      <div class="flex items-center">
        <span class="text-6 font-semibold">Responses</span>
        <RadioGroup v-model:value="currentRespStatus"  button-style="solid" class="ml-3">
          <RadioButton v-for="status in responseStatus" :value="status">{{ status }}</RadioButton>
        </RadioGroup>
      </div>
  
      <EasyMd :key="currentRespStatus" :value="reponseBody.description" :preview="true" />

      <div v-if="reponseBody.headers?.length" class="space-y-3" :key="`${props.apis.endpoint}_${props.apis.method}`" >
        <div class="text-5 font-medium">Headers</div>
        <ParamModelView :params="reponseBody.headers" />
      </div>
      
      <BodyModelView :key="`${props.apis.endpoint}_${props.apis.method}`" :body="reponseBody" />

    </template>

    
  </div>

</template>