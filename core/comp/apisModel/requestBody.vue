<script lang="ts" setup>
import { inject, onMounted, ref, watch } from 'vue';
import { Button, TabPane, Tabs, Input, Select } from 'ant-design-vue';
import { NotificationOutlined } from '@ant-design/icons-vue';
import { CONTENT_TYPE } from '../basic/utils';
import BodyContentTypeTab from '../basic/bodyContentTypeTab.vue';
import Dropdown from '@/components/Dropdown/index.vue';

import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css'


const easyMDE = ref();
const descRef = ref();

interface Props {
    dataSource: {
        content?: {[key: string]: any},
        description?: string;
        $ref?: string;
    }
}

const props = withDefaults(defineProps<Props>(), {
  dataSource: () => ({})
});

const requestBodiesDataRef = ref([]);

const contentTypes = ref<string[]>([]);

const data = ref({});
const refComp = ref();

onMounted(() => {
  
  watch(() => props.dataSource, () => {
    data.value = props.dataSource;
    contentTypes.value = Object.keys(data.value.content || {});
  }, {
    immediate: true
  });
  easyMDE.value = new EasyMDE({
    element: descRef.value, 
    autoDownloadFontAwesome: true
  });
});

const disabledBodyModelType = (type) => {
  return ['application/x-www-form-urlencoded',
    'multipart/form-data',
    'application/json',
    'application/xml'].includes(type);
};

const addContentType = (item) => {
  contentTypes.value.push(item.key);
  if (data.value?.content) {
    if (!data.value.content[item.key]) {
      data.value.content[item.key] = {
        schema: {
          type: disabledBodyModelType(item.key) ? 'object' : 'string'
        }
      };
    }
  } else {
    data.value.content = {
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

const getData = () => {
  if (refComp.value) {
    return {
      $ref: refComp.value
    };
  }
  const resps = requestBodiesDataRef.value.map((i) => {
    const data = i?.getData();
    if (data) {
      Object.assign(data.value?.content || {}, data);
    }
    return data;
  });
  if (resps.some(i => i === false)) {
    return false;
  }
  Object.keys(data.value?.content || {}).forEach(key => {
    if (!contentTypes.value.includes(key)) {
      delete data.value.content?.[key];
    }
  });
  const comp = {
    ...data.value,
    description: data.value.description
  };
  return comp;
};

defineExpose({
  getData
});
</script>
<template>
  <div>
    <div class="font-medium text-4 border-b pb-1 mb-2 flex items-center">
      <div class="flex items-center space-x-1">
        <NotificationOutlined />
        <span class="text-5 font-medium">RequestBody Description</span>
      </div>
      <div class="flex-1 text-right">
        
      </div>
    </div>
    <textarea ref="descRef">{{ data.description }}</textarea>

  </div>
  <div class="mt-4">
    <div class="font-medium text-4 border-b pb-1 mb-2 flex justify-between items-center">
      <span  class="text-5 font-medium">
         Body
      </span>
      <Dropdown
        :disabledKeys="contentTypes"
        :menuItems="CONTENT_TYPE.map(i => ({key: i, name: i, disabled: contentTypes.includes(i)}))"
        @click="addContentType">
        <Button
          size="small"
          type="primary">
          + Add
        </Button>
      </Dropdown>
    </div>
    <Tabs
      type="editable-card"
      hideAdd
      size="small"
      class="mt-2"
      @edit="editTab">
      <TabPane
        v-for="(contentType, idx) in contentTypes"
        :key="contentType"
        :tab="contentType"
        :closable="true">
        <BodyContentTypeTab
          :ref="dom => requestBodiesDataRef[idx] = dom"
          :contentType="contentType"
          :viewType="!!refComp"
          :data="data?.content?.[contentType] || {}" />
      </TabPane>
    </Tabs>
  </div>
</template>
