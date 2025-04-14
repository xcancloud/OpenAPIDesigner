<script lang="ts" setup>
import { ref, watch, onMounted, Ref, nextTick, onBeforeUnmount, inject, defineAsyncComponent } from 'vue';
import { Button, TabPane, Tabs } from 'ant-design-vue';
import { CONTENT_TYPE } from '../basic/utils';

import BodyContentTypeTab from '../basic/bodyContentTypeTab.vue';
import parameterBasic from '../basic/parameterBasic.vue';
import Dropdown from '@/common/dropdown/index.vue';

const descRef = ref();
const EasyMd = defineAsyncComponent(() => import('@/common/easyMd/index.vue'));
const getAppFunc = inject('getAppFunc', (param: {name: string, func: Function})=>{});

interface Props {
  name: string;
  data?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  name: ''
});

const dataSource = inject('dataSource', ref());

const responseData = ref<{description?: string, content?: {[key: string]: any}, headers?: {[key: string]: any}}>({});
const contentTypes = ref<string[]>([]);
const requestBodiesDataRef = ref<Ref[]>([]);

const editTab = (key:string) => {
  contentTypes.value = contentTypes.value.filter(i => i !== key);
};


const respHeader = ref<Record<string, any>>([]);
const getDefaultExtensionName = () => {
  const allDefaultNames = respHeader.value.map(i => i.name).filter(name => name.startsWith('header-'));
  const nameIdxs = allDefaultNames.map(name => {
    const num = Number(name.slice(7));
    return isNaN(num) ? 0 : num;
  });
  const max = nameIdxs.length ? Math.max(...nameIdxs) : respHeader.value.length;
  return `header-${max + 1}`;
};

const addHeader = () => {
  const name = getDefaultExtensionName()
  respHeader.value.push({name: name, schema: {type: 'string'}});
};

const disabledBodyModelType = (type) => {
  return ['application/x-www-form-urlencoded',
    'multipart/form-data',
    'application/json',
    'application/xml'].includes(type);
};

const addBody = (item: {key: string}) => {

  contentTypes.value.push(item.key);
  if (responseData.value?.content) {
    if (!responseData.value.content[item.key]) {
      responseData.value.content[item.key] = {
        schema: {
          type: disabledBodyModelType(item.key) ? 'object' : 'string'
        }
      };
    }
  } else {
    responseData.value.content = {
      [item.key]: {
        schema: {
          type: disabledBodyModelType(item.key) ? 'object' : 'string'
        }
      }
    };
  }
}


const saveData = (name: string) => {
  const description  = descRef.value.getValue();
  const content = requestBodiesDataRef.value.reduce((pre, cur) => {
    const curContent = cur.getData()
    return {
      ...pre,
      ...curContent
    }
  }, {});
  const headers = respHeader.value.reduce((pre, cur) => {
    const name = cur.key;
    delete cur.key;
    return {
      ...pre,
      [name]: cur
    }
  }, {});
  dataSource.value.components.responses[name] = {
    ...responseData.value,
    description,
    content,
    headers
  }
};

onMounted(() => {
  watch(() => props.name, (newValue, oldValue) => {
    if (oldValue) {
      saveData(oldValue);
    }
    responseData.value = props.data || {};
    contentTypes.value = Object.keys(responseData.value?.content || {});
    respHeader.value = Object.keys(responseData.value?.headers || {}).map(key => {
      return {
        name: key,
        ...responseData.value?.headers?.[key]
      }
    })
  }, {
    immediate: true,
  });
  getAppFunc({name: 'updateData', func: saveData});
});

onBeforeUnmount(() => {
  saveData(props.name);
});


</script>
<template>
  <div class="h-full overflow-y-scroll text-center">
    <div class="inline-block w-200 text-left">
      <div class="font-semibold mt-4 text-5"></div>
      <EasyMd ref="descRef" :value="responseData.description" />

      <div class="flex justify-between items-center border-b">
        <div class="font-semibold mt-4 text-5">Headers</div>
        <Button type="primary" @click="addHeader">Add + </Button>
      </div>

      <div class="space-y-2">
        <parameterBasic
          v-for="(header, idx) in respHeader"
          :key="idx"
          v-model:parameter-obj="respHeader[idx]"
          v-model:parameter-priorities="header.schema"
          :refrenceBtnProps="{show: true, disabled: false}" />
      </div>

      <div class="flex justify-between items-center border-b mt-4">
        <div class="font-semibold mt-4 text-5">Body</div>
        <Dropdown
          :disabledKeys="contentTypes"
          :menuItems="CONTENT_TYPE.map(i => ({key: i, name: i, disabled: contentTypes.includes(i)}))"
          @click="addBody">
          <Button
            type="primary">
            Add +
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
            :data="responseData?.content?.[contentType] || {}" />
        </TabPane>
      </Tabs>
    </div>
  </div>
</template>
