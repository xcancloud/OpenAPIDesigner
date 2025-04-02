<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { Button, Popover, Switch, TabPane, Tabs, Tag, Tooltip, Select } from 'ant-design-vue';
import { TagsOutlined, DeleteOutlined } from '@ant-design/icons-vue';

import { Props } from './PropTypes';

import Genaral from './general.vue';
import Parameters from './parameters.vue';
import RequestBody from './requestBody.vue';
import Responses from './responses.vue';

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

const emits = defineEmits<{(e: 'cancel'):void, (e: 'ok', value: Props['dataSource']):void}>();
const activeKey = ref('general');

const generalRef = ref();
const parametersRef = ref();
const requestBodyRef = ref();
const responsesRef = ref();

const addTagRef = ref();

const docs = ref<{[key: string]: any}>({});
const sourceData = ref<Props['dataSource']>();

const getData = ():Props['dataSource'] => {
  // return 
  return {
    ...sourceData.value,
  }
}

onMounted(() => {
  watch([() => props.dataSource.method, () => props.dataSource.endpoint], ([newValue1, newValue2], [oldNewValue1, oldNewValue2]) => {
    if (oldNewValue1 && oldNewValue2) {
      emits('ok', getData())
    }
    sourceData.value = props.dataSource;
    const { method, endpoint, ...datas } = props.dataSource;
  }, {
    immediate: true
  });
  docs.value = JSON.parse(JSON.stringify(props.openapiDoc));
});

const delTags = () => {
  sourceData.value.tags = [];
};



defineExpose({
  
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
            v-if="sourceData"
            v-model:value="sourceData.tags"
            mode="tags"
            class="w-100"
            :getPopupContainer="(triggerNode) => triggerNode" />
        </template>
      </Popover>
      <Tooltip title="Tags">
        <div class="h-6 flex items-center ml-2">
          <Tag
            v-for="tag in (sourceData?.tags || [])"
            :key="tag"
            :closable="false"
            color="green"
            class="leading-6">
            {{ tag }}
          </Tag>
        </div>
      </Tooltip>
      <Button
        v-show="!!sourceData?.tags?.length"
        size="small"
        class=""
        @click="delTags">
        <DeleteOutlined />
      </Button>
      <div class="flex items-center space-x-1 ml-5">
        <span>DEPRECATED</span>
        <Switch
          v-if="sourceData"
          v-model:checked="sourceData.deprecated"
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
        <RequestBody ref="requestBodyRef" :dataSource="props.dataSource?.requestBody" />
      </TabPane>
      <TabPane
        key="response"
        tab="响应">
        <Responses ref="responsesRef" :dataSource="props.dataSource.responses" />
      </TabPane>
    </Tabs>
  </div>
</template>
