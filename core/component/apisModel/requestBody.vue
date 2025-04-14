<script lang="ts" setup>
import { onMounted, ref, watch, defineAsyncComponent, inject, computed } from 'vue';
import { Button, TabPane, Tabs, Select } from 'ant-design-vue';
import { NotificationOutlined } from '@ant-design/icons-vue';
import { CONTENT_TYPE } from '../basic/utils';
import BodyContentTypeTab from '../basic/bodyContentTypeTab.vue';
import Dropdown from '@/common/dropdown/index.vue';

const descRef = ref();
const EasyMd = defineAsyncComponent(() => import('@/common/easyMd/index.vue'));

const dataSource = inject('dataSource', ref());

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

const requestBodySchemaOpt = computed<{label: string; value: string; data: Record<string, any>}[]>(() => {
  const requestBodies = dataSource.value?.components?.requestBodies || {};
  return Object.keys(requestBodies).map(key => {
    return {
      label: key,
      value: `#/components/requestBodies/${key}`,
      data: requestBodies[key]
    }
  })
});

const requestBodiesDataRefs = ref([]);
const contentTypes = ref<string[]>([]);
const data = ref<Props['dataSource']>({});
const refComp = ref();

const resolveRequestBodyRef = (ref: string): Props['dataSource'] => {
  const bodyData = requestBodySchemaOpt.value.find(item => item.value === ref);
  if (bodyData) {
    return bodyData.data || {}
  }
  return {};
};

onMounted(() => {
  watch(() => props.dataSource, () => {
    data.value = props.dataSource;
    if (data.value?.$ref) {
      refComp.value = data.value.$ref;
      data.value = resolveRequestBodyRef(data.value.$ref);
    }
    contentTypes.value = Object.keys(data.value?.content || {});

  }, {
    immediate: true
  });

  watch(() => refComp.value, () => {
    if (refComp.value) {
      data.value = resolveRequestBodyRef(refComp.value);
      contentTypes.value = Object.keys(data.value?.content || {});
    }
  });
});

const disabledBodyModelType = (type: string) => {
  return ['application/x-www-form-urlencoded',
    'multipart/form-data',
    'application/json',
    'application/xml'].includes(type);
};

const addContentType = (item: {key: string, name:string}) => {
  contentTypes.value.push(item.key);
  if (!data.value?.content) {
    data.value.content = {};
  }
  if (!data.value.content[item.key]) {
    data.value.content[item.key] = {
      schema: {
          type: disabledBodyModelType(item.key) ? 'object' : 'string'
        }
      }
    }
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
  const resps = requestBodiesDataRefs.value.map((i) => {
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
  const description = descRef.value.getValue();
  const comp = {
    ...data.value,
    description
  };
  return comp;
};

defineExpose({
  getData
});
</script>
<template>
   <div>
    <div class="font-medium text-4 border-b pb-1 mb-2 flex justify-between items-center">
      <div class="inline-flex items-center space-x-1">
        <NotificationOutlined />
        <span class="text-5 font-medium">RequestBody Description</span>
      </div>
      <div class="">
        <Select
          v-model:value="refComp"
          class="w-50"
          allowClear
          :options="requestBodySchemaOpt" />
      </div>
    </div>
    <EasyMd :key="refComp" :preview="refComp" ref="descRef" :value="data.description" />
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
          :disabled="!!refComp"
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
        :closable="!refComp">
        <BodyContentTypeTab
          :ref="dom => requestBodiesDataRefs[idx] = dom"
          :contentType="contentType"
          :disabled="!!refComp"
          :data="data?.content?.[contentType] || {}" />
      </TabPane>
    </Tabs>
  </div>

</template>
