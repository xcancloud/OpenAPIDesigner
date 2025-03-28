<script lang="ts" setup>
import { provide, ref, watch } from 'vue';
import { Button, Divider, TabPane, Tabs, Dropdown, Input, notification, Select } from 'ant-design-vue';
import { parseSchemaArrToObj, parseSchemaObjToArr, CONTENT_TYPE } from '../basic/utils';

import AddAttrModal from '../basic/addAttrModal.vue';
import AttrItemList from '../basic/attrItemList.vue';

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
// const useAuth = ref<string[]>([]);
const addVisible = ref(false);
const schemaName = ref();
const schemaType = ref('schemas');
const modelType = ref<string|undefined>('object');
const description = ref();

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

const addFromType = ref<'object'|null>(null);
let currentAddNode;
const addAttr = (node = undefined) => {
  currentAddNode = node;
  addFromType.value = 'object';
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
  addFromType.value = type;
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

const validate = ref(false);

const schemaData = ref({});

// 获取需要编辑的数据模型
const loadSchemaContent = async () => {
  const schemaObj = props.data || {};
  description.value = schemaObj.description;
  if (schemaObj.type === 'object') {
    const {properties, ...other} = schemaObj;
    objectAttrList.value = [{...other, children: parseSchemaObjToArr(schemaObj, schemaObj.required)}] ;
  } else {
    objectAttrList.value = parseSchemaObjToArr(schemaObj, schemaObj.required);
  }
  schemaName.value = schemaObj.key;
  schemaType.value = schemaObj.type;
  modelType.value = schemaObj.type;
  schemaData.value = schemaObj;
};

const resetschemas = () => {
  schemaName.value = undefined;
  schemaType.value = 'schemas';
  objectAttrList.value = [];
  onSchemaTypeChange();
};

const onSchemaTypeChange = () => {
  modelType.value = 'object';
};

watch(() => props.data, newValue => {
  if (newValue) {
    schemaName.value = props.data.key;
    loadSchemaContent();
  } else {
    resetschemas();
  }
}, {
  immediate: true
});

</script>
<template>
  <div class="flex h-full overflow-y-scroll">
    <div class="p-2 flex-1 min-w-100 space-y-2">
      <Input
        v-model:value="schemaName"
        :readonly="props.data?.key"
        :error="validate && !schemaName"
        :maxlength="200"
        :bordered="false"
        class="font-medium"
        placeholder="名称" />
      <Input
        v-model:value="description"
        type="textarea"
        :bordered="false"
        :maxlength="1000"
        placeholder="描述" />
        <div class="border">
          <Tabs>
            <TabPane key="scheams" tab="Schema" class="pb-3">
              <AttrItemList
                :dataSource="objectAttrList"
                class="px-5"
                :isRoot="true"
                @add="addAttr"
                @del="delAttr"
                @edit="editAttr" />
              <AddAttrModal
                v-model:visible="addVisible"
                :parentType="addFromType"
                :excludesAttr="excludesAttr"
                :data="editAttrData"
                @ok="changeAttrList"
                @cancel="closeModal" />
            </TabPane>
            <TabPane key="examples" tab="Examples">

            </TabPane>

            <TabPane key="extensions" tab="Extensions">

            </TabPane>
          </Tabs>
        </div>
    </div>
  </div>
</template>
