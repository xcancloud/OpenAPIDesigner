<script lang="ts" setup>
import { onMounted, ref, watch, inject, onBeforeUnmount } from 'vue';
import { Button, Popover, Switch, TabPane, Tabs, Tag, Tooltip, Select } from 'ant-design-vue';
import { TagsOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';

import { Props } from './PropTypes';

import Genaral from './general.vue';
import Parameters from './parameters.vue';
import RequestBody from './requestBody.vue';
import Responses from './responses.vue';

const { t } = useI18n();
const props = withDefaults(defineProps<Props>(), {
  dataSource: () => ({
    parameters: [],
    tags: [],
    responses: {},
    deprecated: false,
    operationId: ''
  }),
  openapiDoc: () => ({})
});

const dataSource = inject('dataSource', ref());
const getAppFunc = inject('getAppFunc', (param: {name: string, func: Function})=>{});

const emits = defineEmits<{(e: 'cancel'):void, (e: 'ok', value: Props['dataSource']):void}>();
const activeKey = ref('general');

const generalRef = ref();
const parametersRef = ref();
const requestBodyRef = ref();
const responsesRef = ref();

const addTagRef = ref();

const docs = ref<{[key: string]: any}>({});
const sourceApi = ref<Props['dataSource']>();

const saveData = (method: string, endpoint: string):Props['dataSource'] => {

  const apiData = {
    ...sourceApi.value,
  }
  delete apiData.endpoint;
  delete apiData.method;
  if (generalRef.value) {
    Object.assign(apiData, generalRef.value.getData());
  }
  if (parametersRef.value) {
    const parameters = parametersRef.value.getData();
    apiData.parameters = parameters?.length ? parameters : undefined;
  }
  if (responsesRef.value && responsesRef.value.getData()) {
    apiData.responses = responsesRef.value.getData()
  }

  if (requestBodyRef.value && requestBodyRef.value.getData()) {
    apiData.requestBody = requestBodyRef.value.getData()
  }
  dataSource.value.paths[endpoint][method] = apiData;
};

onMounted(() => {
  watch([() => props.dataSource.method, () => props.dataSource.endpoint], ([newValue1, newValue2], [oldNewValue1, oldNewValue2]) => {
    if (oldNewValue1 && oldNewValue2) {
      saveData(oldNewValue1, oldNewValue2);
    }
    sourceApi.value = props.dataSource;
  }, {
    immediate: true
  });
  docs.value = JSON.parse(JSON.stringify(props.openapiDoc));
  getAppFunc({name: 'updateData', func: saveData});
});

const delTags = () => {
  sourceApi.value.tags = [];
};

onBeforeUnmount(() => {
  saveData(props.dataSource.method, props.dataSource.endpoint);
});


</script>
<template>
  <div class="p-2 flex flex-col h-full">
    <div class="flex items-center py-2">
      <Popover trigger="click" placement="bottomLeft">
        <Button
          ref="addTagRef"
          size="small"
          class="">
          <TagsOutlined />
        </Button>
        <template #content>
          <Select
            v-if="sourceApi"
            v-model:value="sourceApi.tags"
            mode="tags"
            class="w-100"
            :getPopupContainer="(triggerNode) => triggerNode" />
        </template>
      </Popover>
      <Tooltip title="Tags">
        <div class="h-6 flex items-center ml-2">
          <Tag
            v-for="tag in (sourceApi?.tags || [])"
            :key="tag"
            :closable="false"
            color="green"
            class="leading-6">
            {{ tag }}
          </Tag>
        </div>
      </Tooltip>
      <Button
        v-show="!!sourceApi?.tags?.length"
        size="small"
        class=""
        @click="delTags">
        <DeleteOutlined />
      </Button>
      <div class="flex items-center space-x-1 ml-5">
        <span>DEPRECATED</span>
        <Switch
          v-if="sourceApi"
          v-model:checked="sourceApi.deprecated"
          size="small" />
      </div>
    </div>
    <Tabs
      v-model:activeKey="activeKey"
      size="small"
      class="flex-1 overflow-auto">
      <TabPane
        key="general"
        :tab="t('general')">
        <Genaral ref="generalRef" :dataSource="props.dataSource" :openapiDoc="props.openapiDoc" />
      </TabPane>
      <TabPane
        key="parameter"
        :tab="t('parameter')">
        <Parameters ref="parametersRef" :dataSource="props.dataSource.parameters" />
      </TabPane>
      <TabPane
        key="request"
        :tab="t('request_body')">
        <RequestBody ref="requestBodyRef" :dataSource="props.dataSource?.requestBody" />
      </TabPane>
      <TabPane
        key="response"
        :tab="t('response')">
        <Responses ref="responsesRef" :dataSource="props.dataSource.responses" />
      </TabPane>
    </Tabs>
  </div>
</template>
