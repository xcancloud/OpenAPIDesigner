<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { Button, Divider, TabPane, Tabs, Input, Select  } from 'ant-design-vue';
import { CONTENT_TYPE } from '../basic/utils';
import Dropdown from '@/components/Dropdown/index.vue';

import BodyContentTypeTab from '../basic/bodyContentTypeTab.vue';

import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css'


const easyMDE = ref();
const descRef = ref();


interface Props {
  name: string;
  data?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  name: ''
});

const emits = defineEmits<{(e: 'cancel'):void;(e: 'ok'):void}>();

const disabledBodyModelType = (type) => {
  return ['application/x-www-form-urlencoded',
    'multipart/form-data',
    'application/json',
    'application/xml'].includes(type);
};

const requestBodyData = ref<{description?: string, content?: {[key: string]: any}, headers?: {[key: string]: any}}>({});
const contentTypes = ref<string[]>([]);
const requestBodiesDataRef:any[] = [];

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

onMounted(() => {
  watch(() => props.data, () => {
    requestBodyData.value = props.data || {};
    contentTypes.value = Object.keys(requestBodyData.value?.content || {});
  }, {
    immediate: true,
  })
  easyMDE.value = new EasyMDE({
    element: descRef.value, 
    autoDownloadFontAwesome: true
  });
});

</script>
<template>
  <div class="flex h-full overflow-y-scroll">
    <div class="p-2 flex-1 min-w-100">
      <div class="text-5 font-semibold">{{props.name}}</div>
      <textarea ref="descRef">{{ requestBodyData.description }}</textarea>

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
