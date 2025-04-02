<script lang="ts" setup>
import { onMounted, provide, ref, watch } from 'vue';
import { Button, Popover, Switch, TabPane, Tabs, Tag, Tooltip, Select } from 'ant-design-vue';
import { TagsOutlined, DeleteOutlined } from '@ant-design/icons-vue';

import { Props } from './PropTypes';

import Genaral from './general.vue';
import Parameters from './parameters.vue';
import RequestBody from './requestBody.vue';
import Responses from './responses.vue';

const statusKey = 'x-xc-status';

const props = withDefaults(defineProps<Props>(), {
  dataSource: () => ({
    parameters: [],
    tags: [],
    responses: {},
    deprecated: false,
    operationId: '',
    [statusKey]: ''
  }),
  openapiDoc: () => ({})
});

const emits = defineEmits<{(e: 'cancel'):void, (e: 'ok', value: Props['dataSource']):void}>();
const activeKey = ref('general');
const selectStr = ref({});
const path = ref('');

const generalRef = ref();
const parametersRef = ref();
const requestBodyRef = ref();
const responsesRef = ref();

const addTagRef = ref();

const _tags = ref<string[]>([]);
const _deprecated = ref(false);

const docs = ref<{[key: string]: any}>({});

onMounted(() => {
  watch([() => props.dataSource.method, () => props.dataSource.endpoint], () => {
    _deprecated.value = props.dataSource.deprecated;
    _tags.value = props.dataSource.tags || [];
    const { method, endpoint, ...datas } = props.dataSource;
    selectStr.value = { [method]: { ...datas } };
    path.value = endpoint;
  }, {
    immediate: true
  });
  docs.value = JSON.parse(JSON.stringify(props.openapiDoc));
});

const delTags = () => {
  _tags.value = [];
};


const getFormData = () => {
  const data = JSON.parse(JSON.stringify(props.dataSource));
  const generalData = generalRef.value.getData;
  Object.assign(data, generalData);

  if (parametersRef.value) {
    const parameters = parametersRef.value.getData();
    Object.assign(data, { parameters });
  }
  if (requestBodyRef.value) {
    const body = requestBodyRef.value.getData;
    if (!body) {
      activeKey.value = 'request';
      return;
    }
    Object.assign(data, { body });
  }
  if (responsesRef.value) {
    const responses = responsesRef.value.getDate();
    if (!responses) {
      activeKey.value = 'response';
      return;
    }
    Object.assign(data, { responses });
  }
  return data;
};

const confirm = () => {
  const data = JSON.parse(JSON.stringify(props.dataSource));
  const generalData = generalRef.value.getData;
  Object.assign(data, generalData);

  if (parametersRef.value) {
    const parameters = parametersRef.value.getData();
    Object.assign(data, { parameters });
  }
  if (requestBodyRef.value) {
    const body = requestBodyRef.value.getData;
    if (!body) {
      activeKey.value = 'request';
      return;
    }
    Object.assign(data, { body });
  }
  if (responsesRef.value) {
    const responses = responsesRef.value.getDate();
    if (!responses) {
      activeKey.value = 'response';
      return;
    }
    Object.assign(data, { responses });
  }
  emits('ok', data);
};

</script>
<template>
  <div class="p-2 flex flex-col h-full">
    <div class="flex items-center">
      <Popover trigger="click" placement="bottomLeft">
        <Button
          ref="addTagRef"
          size="small"
          class="">
          <TagsOutlined />
        </Button>
        <template #content>
          <Select
            v-model:value="_tags"
            mode="tags"
            class="w-100"
            :getPopupContainer="(triggerNode) => triggerNode" />
        </template>
      </Popover>
      <Tooltip title="Tags">
        <div class="h-6 flex items-center ml-2">
          <Tag
            v-for="tag in _tags"
            :key="tag"
            :closable="false"
            color="green"
            class="leading-6">
            {{ tag }}
          </Tag>
        </div>
      </Tooltip>
      <Button
        v-show="!!_tags.length"
        size="small"
        class=""
        @click="delTags">
        <DeleteOutlined />
      </Button>
      <div class="flex items-center space-x-1 ml-5">
        <span>DEPRECATED</span>
        <Switch
          v-model:checked="_deprecated"
          size="small" />
      </div>
    </div>
    <Tabs
      v-model:activeKey="activeKey"
      size="small"
      class="flex-1 overflow-auto">
      <TabPane
        key="general"
        tab="常规">
        <Genaral ref="generalRef" :dataSource="props.dataSource" :openapiDoc="props.openapiDoc" />
      </TabPane>
      <TabPane
        key="parameter"
        tab="参数">
        <Parameters ref="parametersRef" :dataSource="props.dataSource.parameters" />
      </TabPane>
      <TabPane
        key="request"
        tab="请求体">
        <RequestBody ref="requestBodyRef" :dataSource="props.dataSource.requestBody" />
      </TabPane>
      <TabPane
        key="response"
        tab="响应">
        <Responses ref="responsesRef" :dataSource="props.dataSource.responses" />
      </TabPane>
    </Tabs>
  </div>
</template>
