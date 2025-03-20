<script lang="ts" setup>
import { provide, ref, watch } from 'vue';
import { Button, Divider, TabPane, Tabs, Dropdown, Input, notification, Select } from 'ant-design-vue';
import { parseSchemaArrToObj, parseSchemaObjToArr, CONTENT_TYPE } from '../basic/utils';

import AddAttrModal from '../basic/addAttrModal.vue';
import AddSchemaModel from '../basic/addSchemaModel.vue';

interface Props {
  id: string;
  pid: string;
  type: string;
  name: string;
  data?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  pid: undefined
});

const emits = defineEmits<{(e: 'cancel'):void;(e: 'ok'):void}>();

// const deleteTabPane = inject('deleteTabPane', (value) => value);
const addSchemaTypeRef = ref();
// const useAuth = ref<string[]>([]);
const addVisible = ref(false);
const schemaName = ref();
const parameterIn = ref('query');
const requestBodiesContentType = ref<string|undefined>('application/json');
const schemaType = ref('parameters');
const modelType = ref<string|undefined>('object');
const description = ref();


const modelTypeOpt = [
  {
    label: 'String',
    value: 'string'
  },
  {
    label: 'Array',
    value: 'array'
  },
  {
    label: 'Object',
    value: 'object'
  },
  {
    label: 'Number',
    value: 'number'
  },
  {
    label: 'Integer',
    value: 'integer'
  },
  {
    label: 'Boolean',
    value: 'boolean'
  }
];

const disabledBodyModelType = (type) => {
  return ['application/x-www-form-urlencoded',
    'multipart/form-data',
    'application/json',
    'application/xml'].includes(type);
};

// const schema = ref<Record<string, any>>({});
const objectAttrList = ref<{name: string, [key: string]: any}[]>([
  {
    name: 'name0',
    schema: {
      type: 'string'
    }
  },
  {
    name: 'name1',
    schema: {
      type: 'object'
    },
    children: [
      {
        name: 'name2',
        $ref: '#components/schema/name2'
      }
    ]
  },
  {
    name: 'name3',
    schema: {
      type: 'string'
    }
  }
]);

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
const submitSchema = async () => {
  validate.value = true;
  // projectOrServiceId:string, type:string, key:string, component:any
  const component = parseSchemaArrToObj(JSON.parse(JSON.stringify(objectAttrList.value)), modelType.value);
  let comp;
  if (schemaType.value === 'schemas') {
    if (modelType.value === 'array') {
      comp = {
        type: 'array',
        description: description.value,
        items: component
      };
    } else if (modelType.value === 'object') {
      comp = {
        ...component,
        description: description.value
      };
    } else {
      const schemaData = addSchemaTypeRef.value.getData();
      delete schemaData.required;
      comp = {
        // ...,
        ...schemaData,
        description: description.value
      };
    }
  }
  if (schemaType.value === 'parameters') {
    const component = parameterSchemaRef.value.getData();
    if (!component) {
      return;
    }
    comp = {
      ...parameterData.value,
      name: schemaName.value,
      in: parameterIn.value,
      description: description.value,
      schema: component
    };
  }

  if (schemaType.value === 'requestBodies') {
    const resps = requestBodiesDataRef.map((i) => {
      const data = i?.getData();
      if (data) {
        Object.assign(requestBodyData.value?.content || {}, data);
      }
      return data;
    });
    if (resps.some(i => i === false)) {
      return;
    }
    Object.keys(requestBodyData.value?.content || {}).forEach(key => {
      if (!contentTypes.value.includes(key)) {
        delete requestBodyData.value.content?.[key];
      }
    });
    comp = {
      ...requestBodyData.value,
      description: description.value
    };
  }

  if (schemaType.value === 'responses') {
    const respData = responseDataRef.value.getData();
    if (respData === false) {
      return;
    }
    comp = {
      ...respData,
      description: description.value
    };
  }
  if (!schemaName.value) {
    return;
  }
  // const [error] = await services.addComponent(props.id, schemaType.value, schemaName.value, JSON.stringify(comp));
  // if (error) {
  //   return;
  // }
  // notification.success('保存成功');
  emits('ok');
};
// const activeDrawerKey = ref('componnet');
// const drawerCompNav = computed(() => {
//   return serviceNavItem.map(item => {
//     return {
//       ...item,
//       key: item.value,
//       name: (item.value === 'projectInfo' && props.type === 'PROJECT') ? '项目信息' : item.name
//     };
//   });
// });

const schemaData = ref({});
const parameterData = ref({});
const requestBodyData = ref<{description?: string, content?: {[key: string]: any}, headers?: {[key: string]: any}}>({});
const contentTypes = ref<string[]>([]);
const requestBodiesDataRef:any[] = [];
const responseSchemaData = ref({});
const parameterSchemaRef = ref();

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
    requestBodyData.value = schemaObj;
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
  schemaType.value = 'parameters';
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

const changeModelType = () => {
  objectAttrList.value = [];
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

// const selectRequestContentType = ref();
const addContentType = (item) => {
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

const responseDataRef = ref();

watch(() => props.data?.ref, newValue => {
  if (newValue) {
    schemaName.value = props.data.key;
    loadSchemaContent();
  } else {
    resetschemas();
  }
}, {
  immediate: true
});

provide('serviceId', props.id);
</script>
<template>
  <div class="flex h-full overflow-y-scroll">
    <div class="p-2 flex-1 min-w-100">
      <div class="flex items-center space-x-2 mt-2 text-3.5">
        <template v-if="schemaType === 'parameters'">
          <span>参数</span>
          <Select
            v-model:value="parameterIn"
            placeholder="in"
            :options="['query', 'path', 'header', 'cookie'].map(i => ({value: i, label: i}))"
            class="w-20"
            size="small" />
        </template>
      </div>

      <template v-if="schemaType === 'parameters'">
        <AddSchemaModel
          ref="parameterSchemaRef"
          :data="parameterData.schema || {}" />
      </template>

      <AddAttrModal
        v-model:visible="addVisible"
        :parentType="addFromType"
        :excludesAttr="excludesAttr"
        :data="editAttrData"
        @ok="changeAttrList"
        @cancel="closeModal" />
    </div>
  </div>
</template>
