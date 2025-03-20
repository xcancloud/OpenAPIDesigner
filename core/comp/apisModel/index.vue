<script lang="ts" setup>
import { onMounted, provide, ref, watch } from 'vue';

import { Button, Popover, RadioButton, RadioGroup, Switch, TabPane, Tabs, Tag, Tooltip, Select } from 'ant-design-vue';

import { Props } from './PropTypes';

import Genaral from './general.vue';
import Parameters from './parameters.vue';
import RequestBody from './requestBody.vue';
import Responses from './responses.vue';
import CodeView from '../basic/code.vue';

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

const emits = defineEmits<{(e: 'cancel'):void, (e: 'ok', value: Props.dataSource):void}>();
const activeKey = ref('general');

const viewType = ref('form');
const viewTypeOpt = [
  {
    label: 'Form',
    value: 'form'
  },
  {
    label: 'Code',
    value: 'code'
  }
];
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
    _tags.value = props.dataSource.tags;
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

const onViewTypeChange = () => {
  if (viewType.value === 'code') {
    const formData = getFormData();
    const { method, endpoint, ...api } = formData;
    if (docs.value?.paths) {
      // if (utils.deepCompare({ ...api }, selectStr.value[method])) {
      //   return;
      // }
      docs.value.paths[endpoint][method] = { ...api };
      selectStr.value = { [method]: { ...api } };
    }
  }
};

const cancel = () => {
  emits('cancel');
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

provide('serviceId', props.id);

</script>
<template>
  <div class="p-2 flex flex-col h-full">
    <div class="flex items-center">
      <Popover trigger="click" placement="bottomLeft">
        <Button
          ref="addTagRef"
          size="small"
          class="py-0 leading-5 h-5">
          标签
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
            class="leading-4">
            {{ tag }}
          </Tag>
        </div>
      </Tooltip>
      <Button
        v-show="!!_tags.length"
        size="small"
        class="py-0 leading-5 h-5"
        @click="delTags">
        删除
      </Button>
      <div class="flex items-center space-x-1 ml-5">
        <span>DEPRECATED</span>
        <Switch
          v-model:checked="_deprecated"
          size="small" />
      </div>
      <div class="flex-1 text-right">
        <RadioGroup
          v-model:value="viewType"
          buttonStyle="solid"
          size="small"
          @change="onViewTypeChange">
          <RadioButton
            v-for="opt in viewTypeOpt"
            :key="opt.value"
            :value="opt.value">
            {{ opt.label }}
          </RadioButton>
        </RadioGroup>
      </div>
    </div>
    <Tabs
      v-show="viewType === 'form'"
      v-model:activeKey="activeKey"
      size="small">
      <TabPane
        key="general"
        tab="常规">
        <Genaral ref="generalRef" :dataSource="props.dataSource" />
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
    <div v-show="viewType === 'code'" class="flex-1">
      <CodeView
        :dataSource="docs"
        :selectStr="selectStr"
        :startKey="path" />
    </div>
    <!-- <div class="flex space-x-2 mt-4">
      <Button
        size="small"
        type="primary"
        @click="confirm">
        确认
      </Button>
      <Button size="small" @click="cancel">取消</Button>
    </div> -->
  </div>
</template>
