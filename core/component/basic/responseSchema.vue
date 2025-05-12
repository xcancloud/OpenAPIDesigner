<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { Button, TabPane, Tabs } from 'ant-design-vue';
import { CONTENT_TYPE } from './utils';
// import NoDataSvg from '@/icons/noData.svg';

import BodyContentTypeTab from './bodyContentTypeTab.vue';
import Dropdown from '@/common/dropdown/index.vue';
import ParameterBasic from './parameterBasic.vue';
import NoData from '@/common/noData/index.vue';

interface Props {
  data: {
    description?: string;
    content?: Record<string, any>;
    headers?: Record<string, any>;
  };
  disabled: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({}),
  disabled: false
});
const responseBodyData = ref<{
    description?: string;
    content?: Record<string, any>;
    headers?: Record<string, any>;
  }>({});
const contentTypes = ref<string[]>([]);
const requestBodiesDataRef: any[] = [];

const content = ref({});
const headers = ref<{parameterObj: {[key: string]: any},  parameterPriorities: {[key: string]: any}}[]>([]);

const disabledBodyModelType = (type) => {
  return ['application/x-www-form-urlencoded',
    'multipart/form-data',
    'application/json',
    'application/xml'].includes(type);
};

const addHeader = () => {
  headers.value.push({
    parameterObj: {
      name: '',
    },
    parameterPriorities: {
      type: 'string'
    }
  })
}

const delHeader = (idx: number) => {
  headers.value.splice(idx, 1);
};

const handleData = () => {
  content.value = props.data.content ? props.data.content : {};
  headers.value = Object.keys(props.data?.headers || {}).map(key => {
    return {
      parameterObj: {
        name: key,
        ...props.data?.headers?.[key],
      },
      parameterPriorities: {
        ...(props.data?.headers?.[key]?.schema),
        type: props.data?.headers?.[key]?.schema?.type || 'string'
      }
    };
  });
  responseBodyData.value = JSON.parse(JSON.stringify(props.data));

  contentTypes.value = Object.keys(content.value);
};

// const selectResponseContentType = ref();
const addContentType = (item) => {
  contentTypes.value.push(item.key);
  if (responseBodyData.value?.content) {
    if (!responseBodyData.value.content[item.key]) {
      responseBodyData.value.content[item.key] = {
        schema: {
          type: disabledBodyModelType(item.key) ? 'object' : 'string'
        }
      };
    }
  } else {
    responseBodyData.value.content = {
      [item.key]: {
        schema: {
          type: disabledBodyModelType(item.key) ? 'object' : 'string'
        }
      }
    };
  }
};

const editTab = (key:string) => {
  contentTypes.value = contentTypes.value.filter(i => i !== key);
};



onMounted(() => {
  watch(() => props.data, () => {
    handleData();
  }, {
    deep: true,
    immediate: true
  });
});

const getData = () => {
  const compdata = contentTypes.value.map((i, idx) => {
    const data = requestBodiesDataRef[idx]?.getData();
    if (data) {
      Object.assign(responseBodyData.value, data);
    }
    return data;
  });
  if (compdata.some(i => i === false)) {
    return false;
  }
  Object.keys(responseBodyData.value).forEach(key => {
    if (!contentTypes.value.includes(key)) {
      delete responseBodyData.value[key];
    }
  });
  const headerObj = headers.value.reduce((pre, cur) => {
    if (cur.parameterObj.name) {
      return {
        ...pre,
        [cur.parameterObj.name]: {
          ...cur.parameterObj,
          schema: {
            ...cur.parameterPriorities
          }
        }
      };
    }
  }, {})
  
  return {
    content: responseBodyData.value,
    headers: headerObj
  };
};
defineExpose({
  getData
});
</script>
<template>
  <div class="pt-2 space-y-6">
   
    <div class="flex-1 min-w-0 px-2">

      <div class="flex justify-between items-center border-b pb-2">
        <span class="text-4 font-medium">
          Headers
        </span>
        <Button :disabled="props.disabled" type="primary" size="small" @click="addHeader">
          Add +
        </Button>
      </div>

      <div>
        <ParameterBasic v-for="(header, idx) in headers" :key="idx" v-bind="header" :disabled="props.disabled" @del="delHeader(idx)" />
        <!-- <img v-if="!headers.length" :src="NoDataSvg" class="w-30 mx-auto" /> -->
        <NoData v-if="!headers.length" />
      </div>

    </div>

    <div class="flex-1 min-w-0 border-r px-2">
      <div class="flex justify-between space-x-2 items-center pb-2 mb-2 border-b">
        <span class="text-3.5 font-medium">Response Bodies</span>
        <Dropdown
          :disabledKeys="contentTypes"
          :menuItems="CONTENT_TYPE.filter(i => !['application/octet-stream'].includes(i)).map(i => ({key: i, name: i, disabled: contentTypes.includes(i)}))"
          @click="addContentType">
          <Button
            v-show="!props.disabled"
            type="primary"
            size="small"
            :disabled="props.disabled">
            Add +
          </Button>
        </Dropdown>
      </div>
      <Tabs
        type="editable-card"
        hideAdd
        size="small"
        @edit="editTab">
        <TabPane
          v-for="(contentType, idx) in contentTypes"
          :key="contentType"
          :tab="contentType"
          :closable="!props.disabled"
          :disabled="props.disabled">
          <BodyContentTypeTab
            :ref="dom => requestBodiesDataRef[idx] = dom"
            :contentType="contentType"
            :data="responseBodyData?.content?.[contentType] || {}"
            :disabled="props.disabled" />
        </TabPane>
      </Tabs>
    </div>
    
  </div>
</template>
