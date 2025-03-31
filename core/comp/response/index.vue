<script lang="ts" setup>
import { provide, ref, watch, onMounted } from 'vue';
import { Button, Divider, TabPane, Tabs, Input, notification, Select } from 'ant-design-vue';
import { parseSchemaArrToObj, parseSchemaObjToArr, CONTENT_TYPE } from '../basic/utils';

import BodyContentTypeTab from '../basic/bodyContentTypeTab.vue';
import parameterBasic from '../basic/parameterBasic.vue';
import Dropdown from '@/components/Dropdown/index.vue';

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

// import AddAttrModal from '../basic/addAttrModal.vue';
// import AttrItemList from '../basic/attrItemList.vue';
// import AddSchemaTypeModel from '../basic/addSchemaTypeModel.vue';
// import BodyContentTypeTab from '../basic/bodyContentTypeTab.vue';
// import ResponseSchema from '../basic/responseSchema.vue';
// import AddSchemaModel from '../basic/addSchemaModel.vue';

// const deleteTabPane = inject('deleteTabPane', (value) => value);
const addSchemaTypeRef = ref();
// const useAuth = ref<string[]>([]);
const addVisible = ref(false);
const schemaName = ref();
const parameterIn = ref('query');
const requestBodiesContentType = ref<string|undefined>('application/json');
const schemaType = ref('responses');
const modelType = ref<string|undefined>('object');
const description = ref();


const addFromType = ref<'object'|'array'>('object');
let currentAddNode;
const addAttr = (node = undefined) => {
  currentAddNode = node;
  addFromType.value = node ? node.type : modelType.value;
  addVisible.value = true;
  if (addFromType.value === 'object' && node) {
    excludesAttr.value = (node?.children || []).map(i => i.name);
  } else if (!node) {
    excludesAttr.value = objectAttrList.value.map(i => i.name);
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
    objectAttrList.value.push({
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

const closeCurrentTab = () => {
  // const
  // deleteTabPane([props.pid]);
  emits('cancel');
};

const validate = ref(false);


const schemaData = ref({});
const parameterData = ref({});
const responseData = ref<{description?: string, content?: {[key: string]: any}, headers?: {[key: string]: any}}>({});
const contentTypes = ref<string[]>([]);
const requestBodiesDataRef:any[] = [];
const responseSchemaData = ref({});

// 获取需要编辑的数据模型
const loadSchemaContent = async () => {
  const data = {};
  if (props.data?.type?.value === 'schemas') {
    const schemaObj = JSON.parse(data.model) || {};
    description.value = schemaObj.description;
    objectAttrList.value = parseSchemaObjToArr(schemaObj, schemaObj.required);
    schemaName.value = data.key;
    schemaType.value = data.type.value;
    modelType.value = schemaObj.type;
    schemaData.value = schemaObj;
    return;
  }
  if (props.data?.type?.value === 'parameters') {
    schemaName.value = data.key;
    schemaType.value = data.type.value;
    const schemaObj = JSON.parse(data.model) || {};
    parameterData.value = schemaObj;
    parameterIn.value = schemaObj.in;
    description.value = schemaObj.description;
    // modelType.value = schemaObj.schema.type;
    // if (['array', 'object'].includes(modelType.value)) {
    //   objectAttrList.value = parseSchemaObjToArr(schemaObj.schema, schemaObj.required);
    //   return;
    // }
    // if (!modelType.value) {
    //   modelType.value = 'string';
    // }
    return;
  }
  if (props.data?.type?.value === 'requestBodies') {
    schemaName.value = data.key;
    schemaType.value = data.type.value;
    const schemaObj = JSON.parse(data.model) || {};
    description.value = schemaObj.description;
    responseData.value = schemaObj;
    contentTypes.value = Object.keys(schemaObj.content || {});
    modelType.value = undefined;
    requestBodiesContentType.value = contentTypes.value[0] || undefined;
    return;
  }
  if (props.data?.type?.value === 'responses') {
    schemaName.value = data.key;
    schemaType.value = data.type.value;
    const schemaObj = JSON.parse(data.model) || {};
    responseSchemaData.value = schemaObj || {};
    description.value = schemaObj.description;
  }
};

const resetschemas = () => {
  schemaName.value = undefined;
  objectAttrList.value = [];
  onSchemaTypeChange();
};

const onSchemaTypeChange = () => {
  if (schemaType.value === 'schemas') {
    modelType.value = 'object';
  } else if (schemaType.value === 'parameters') {
    modelType.value = 'string';
  } else if (schemaType.value === 'requestBodies') {
    modelType.value = undefined;
  } else if (schemaType.value === 'responses') {
    modelType.value = undefined;
  }
};


// 'application/x-www-form-urlencoded',
//   'multipart/form-data',
//   'application/octet-stream',
//   'application/json',
//   'text/html',
//   'application/xml',
//   'application/javascript',
//   'text/plain',
//   '*/*'

const editTab = (key:string) => {
  contentTypes.value = contentTypes.value.filter(i => i !== key);
};

const responseDataRef = ref();


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

onMounted(() => {
  easyMDE.value = new EasyMDE({
    element: descRef.value, 
    autoDownloadFontAwesome: true
  });

  watch(() => props.data, () => {
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
  })
});


</script>
<template>
  <div class="h-full overflow-y-scroll text-center">
    <div class="inline-block w-200 text-left">

      <div class="font-semibold mt-4 text-5"></div>
      <textarea ref="descRef"></textarea>
  
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
    <div>
  
  
        <!-- <template v-if="schemaType === 'responses'">
          <ResponseSchema
            ref="responseDataRef"
            :data="responseSchemaData" />
        </template>
        <AddAttrModal
          v-model:visible="addVisible"
          :parentType="addFromType"
          :excludesAttr="excludesAttr"
          :data="editAttrData"
          @ok="changeAttrList"
          @cancel="closeModal" /> -->
      </div>
    </div>

  </div>
</template>
