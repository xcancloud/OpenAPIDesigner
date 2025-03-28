<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { Button, TabPane, Tabs } from 'ant-design-vue';
import { parseSchemaArrToObj, parseSchemaObjToArr } from './utils';
import { CONTENT_TYPE } from './utils';

import BodyContentTypeTab from './bodyContentTypeTab.vue';
import AttrItemList from './attrItemList.vue';
import AddAttrModal from './addAttrModal.vue';
import Dropdown from '@/components/Dropdown/index.vue';

interface Props {
  data: {
    description?: string;
    content?: Record<string, any>;
    headers?: Record<string, any>;
  };
  viewType: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({}),
  viewType: false
});
const responseBodyData = ref<{
    description?: string;
    content?: Record<string, any>;
    headers?: Record<string, any>;
  }>({});
const contentTypes = ref<string[]>([]);
const requestBodiesDataRef: any[] = [];

const content = ref({});
const headers = ref({});

const disabledBodyModelType = (type) => {
  return ['application/x-www-form-urlencoded',
    'multipart/form-data',
    'application/json',
    'application/xml'].includes(type);
};

const handleData = () => {
  content.value = props.data.content ? JSON.parse(JSON.stringify(props.data.content)) : {};
  headers.value = props.data.headers ? JSON.parse(JSON.stringify(props.data.headers)) : {};
  responseBodyData.value = JSON.parse(JSON.stringify(props.data));
  headerObjList.value = parseSchemaObjToArr({ properties: headers.value, type: 'object' });
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
  // selectResponseContentType.value = undefined;
};

const editTab = (key:string) => {
  contentTypes.value = contentTypes.value.filter(i => i !== key);
};

const headerObjList = ref<{name: string, [key: string]: any}[]>([
]);

const addVisible = ref();
const addFromType = ref<'object'|'array'>('object');
let currentAddNode;
const addAttr = (node: {type: 'object'|'array'; children?: any[]}|undefined = undefined) => {
  currentAddNode = node;
  addFromType.value = node ? node.type : 'object';
  addVisible.value = true;
  if (addFromType.value === 'object' && node) {
    excludesAttr.value = (node?.children || []).map(i => i.name);
  } else if (!node) {
    excludesAttr.value = headerObjList.value.map(i => i.name);
  } else {
    excludesAttr.value = [];
  }
};

const editAttrData = ref();
const excludesAttr = ref<string[]>([]);
const editAttr = (node, type, excludes = []) => {
  editAttrData.value = node;
  currentAddNode = node;
  addFromType.value = addFromType.value = type;
  addVisible.value = true;
  excludesAttr.value = excludes;
};

const changeAttrList = (data) => {
  addVisible.value = false;
  if (editAttrData.value) {
    Object.keys(currentAddNode).forEach(key => {
      delete currentAddNode[key];
    });
    Object.keys(data).forEach(key => {
      currentAddNode[key] = data[key];
    });
    if (editAttrData.value.type !== data.type) {
      currentAddNode.children = undefined;
    }
    editAttrData.value = undefined;
    return;
  }
  if (currentAddNode) {
    currentAddNode.children = currentAddNode.children || [];
    currentAddNode.children.push({
      ...data
    });
    currentAddNode.open = true;
  } else {
    headerObjList.value.push({
      ...data
    });
  }
  editAttrData.value = undefined;
};

const closeModal = () => {
  editAttrData.value = undefined;
};

const delAttr = (parent, idx) => {
  parent.splice(idx, 1);
};

onMounted(() => {
  handleData();
  watch(() => props.data, () => {
    handleData();
  }, {
    deep: true
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
  const headerObj = headerObjList.value.length ? parseSchemaArrToObj(JSON.parse(JSON.stringify(headerObjList.value)), 'object') : undefined;
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
  <div class="pt-2">
    <div class="flex-1 min-w-0 px-2">
      <span class="text-3.5 mb-4">
        Headers
        <Icon
          v-show="!props.viewType"
          icon="icon-tianjiamokuai"
          class="ml-2"
          @click="addAttr()" /></span>
      <!-- <div class="obj-top relative font-medium text-3.5 mb-1">
        Object
        <span>{ {{ headerObjList.length }} }</span>

      </div> -->
      <AttrItemList
        :dataSource="headerObjList"
        parentType="object"
        :withoutBorder="true"
        :viewType="props.viewType"
        @add="addAttr"
        @del="delAttr"
        @edit="editAttr" />
      <AddAttrModal
        v-model:visible="addVisible"
        :parentType="addFromType"
        :data="editAttrData"
        :excludesAttr="excludesAttr"
        @ok="changeAttrList"
        @cancel="closeModal" />
    </div>
    <div class="flex-1 min-w-0 border-r px-2">
      <!-- <span class="text-4 font-medium mb-4">content</span> -->
      <div class="flex space-x-2 items-center mb-2">
        <!-- <span>数据类型</span> -->
        <span class="text-3.5 font-medium">Response Bodies</span>
        <!-- <Select
          v-model:value="selectResponseContentType"
          :allowClear="true"
          :readonly="props.viewType"
          size="small"
          :options="CONTENT_TYPE.filter(i => !['application/octet-stream'].includes(i)).map(i => ({value: i, label: i, disabled: contentTypes.includes(i)}))"
          class="w-80" /> -->
        <!-- <Icon
          v-show="selectResponseContentType"
          icon="icon-jia"
          class="text-3.5"
          @click="addContentType" /> -->
      </div>
      <Tabs
        type="editable-card"
        hideAdd
        size="small"
        @edit="editTab">
        <template #rightExtra>
          <Dropdown
            :disabledKeys="contentTypes"
            :menuItems="CONTENT_TYPE.filter(i => !['application/octet-stream'].includes(i)).map(i => ({key: i, name: i, disabled: contentTypes.includes(i)}))"
            @click="addContentType">
            <Button
              type="primary"
              size="small">
              <Icon
                icon="icon-jia"
                class="text-3.5" />
            </Button>
          </Dropdown>
        </template>
        <TabPane
          v-for="(contentType, idx) in contentTypes"
          :key="contentType"
          :tab="contentType"
          :closable="true"
          :disabled="props.viewType">
          <BodyContentTypeTab
            :ref="dom => requestBodiesDataRef[idx] = dom"
            :contentType="contentType"
            :data="responseBodyData?.content?.[contentType] || {}"
            :viewType="props.viewType" />
        </TabPane>
      </Tabs>
    </div>
    
  </div>
</template>
