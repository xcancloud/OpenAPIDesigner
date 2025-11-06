<script lang="ts" setup>
import { ref, watch, onMounted, nextTick, Ref, inject, onBeforeUnmount, defineAsyncComponent } from 'vue';
import { Button, TabPane, Tabs  } from 'ant-design-vue';
import { CONTENT_TYPE } from '../basic/utils';
import Dropdown from '@/common/Dropdown/index.vue';

import BodyContentTypeTab from '../basic/bodyContentTypeTab.vue';

const descRef = ref();
const EasyMd = defineAsyncComponent(() => import('@/common/easyMd/index.vue'));
const getAppFunc = inject('getAppFunc', (param: {name: string, func: Function})=>{});

interface Props {
  name: string;
  data?: Record<string, any>;
  disabled: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  name: '',
  disabled: false
});

const emits = defineEmits<{(e: 'cancel'):void;(e: 'ok'):void}>();
const dataSource = inject('dataSource', ref());

const disabledBodyModelType = (type) => {
  return ['application/x-www-form-urlencoded',
    'multipart/form-data',
    'application/json',
    'application/xml'].includes(type);
};

const requestBodyData = ref<{description?: string, content?: {[key: string]: any}, headers?: {[key: string]: any}}>({});
const contentTypes = ref<string[]>([]);
const requestBodiesDataRef = ref<Ref[]>([]);

const addContentType = (item: {key: string}) => {
  contentTypes.value.push(item.key);
  if (requestBodyData.value?.content) {
    if (!requestBodyData.value.content[item.key]) {
      requestBodyData.value.content[item.key] = {
        schema: {
          type: disabledBodyModelType(item.key) ? 'object' : 'string'
        }
      };
    }
  } else {
    requestBodyData.value.content = {
      [item.key]: {
        schema: {
          type: disabledBodyModelType(item.key) ? 'object' : 'string'
        }
      }
    };
  }
  // selectRequestContentType.value = undefined;
};

const editTab = (key:string) => {
  contentTypes.value = contentTypes.value.filter(i => i !== key);
};

const saveData = (name: string) => {
  const description = descRef.value.getValue();
  const content = requestBodiesDataRef.value.reduce((pre, cur) => {
    const curContent = cur ? cur.getData() : {};
    return {
      ...pre,
      ...curContent
    }
  }, requestBodyData.value?.content || {});
  dataSource.value.components.requestBodies[name] = {
    ...requestBodyData.value,
    description,
    content
  }
};


onMounted(() => {
  watch(() => props.name, (newValue, oldName) => {
    if (oldName && !props.disabled) {
      saveData(oldName);
    }
    requestBodyData.value = props.data || {};
    contentTypes.value = Object.keys(requestBodyData.value?.content || {});
  }, {
    immediate: true,
  });
  getAppFunc({name: 'updateData', func: saveData});
});
onBeforeUnmount(() => {
  if (props.disabled) {
    return;
  }
  saveData(props.name);
});

</script>
<template>
  <div class="flex h-full overflow-y-scroll">
    <div class="p-2 flex-1 min-w-100">
      <div class="text-5 font-semibold">{{props.name}}</div>
      <EasyMd ref="descRef" :key="props.name" :preview="props.disabled" :value="requestBodyData.description" />
      <Tabs
        type="editable-card"
        hideAdd
        size="small"
        class="mt-2"
        @edit="editTab">
        <template #rightExtra>
          <div class="flex items-center">
            <Dropdown
              :disabledKeys="contentTypes"
              :menuItems="CONTENT_TYPE.map(i => ({key: i, name: i, disabled: contentTypes.includes(i)}))"
              :disabled="props.disabled"
              @click="addContentType">
              <Button
                size="small"
                type="primary">
                +
              </Button>
            </Dropdown>
          </div>
        </template>
        <TabPane
          v-for="(contentType, idx) in contentTypes"
          :key="contentType"
          :tab="contentType"
          :closable="true">
          <BodyContentTypeTab
            :ref="dom => requestBodiesDataRef[idx] = dom"
            :contentType="contentType"
            :data="requestBodyData?.content?.[contentType] || {}" />
        </TabPane>
      </Tabs>
    </div>
  </div>
</template>
