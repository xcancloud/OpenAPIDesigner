<script lang="ts" setup>
import { inject, ref, watch, onBeforeUnmount } from 'vue';
import { Button, Divider, TabPane, Tabs, Dropdown, Input, notification, Select } from 'ant-design-vue';
import { parseSchemaArrToObj, parseSchemaObjToArr, CONTENT_TYPE } from '../basic/utils';
import { useI18n } from 'vue-i18n';

import AddAttrModal from '../basic/addAttrModal.vue';
import AttrItemList from '../basic/attrItemList.vue';
import ExampleBasic from '../basic/exampleBasic.vue';

const { t } = useI18n();

interface Props {
  name: string;
  data?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  pid: undefined
});

const emits = defineEmits<{(e: 'cancel'):void;(e: 'ok'):void}>();
const dataSource = inject('dataSource', ref());
const getAppFunc = inject('getAppFunc', (param: {name: string, func: Function})=>{});

// const deleteTabPane = inject('deleteTabPane', (value) => value);
// const useAuth = ref<string[]>([]);
const addVisible = ref(false);
const schemaTitle = ref();
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
  objectAttrList.value = parseSchemaObjToArr(schemaObj, schemaObj.required);
  schemaType.value = schemaObj.type;
  modelType.value = schemaObj.type;
  schemaData.value = schemaObj;
};

const resetschemas = () => {
  schemaTitle.value = undefined;
  schemaType.value = 'schemas';
  objectAttrList.value = [];
  onSchemaTypeChange();
};

const onSchemaTypeChange = () => {
  modelType.value = 'object';
};

const saveData = (name = props.name) => {
  const schemaObj = parseSchemaArrToObj(objectAttrList.value);
  if (exampleRef.value) {
    const examples = exampleRef.value.getData();
    schemaObj.examples = examples;
  };
  dataSource.value.components.schemas[name] = {
    ...schemaObj,
    title: schemaTitle.value,
    description: description.value
  }
};

const examples = ref();
const exampleRef = ref();

watch(() => props.name, (newValue, oldName) => {
  if (newValue) {
    if (oldName) {
      saveData(oldName)
    }
    schemaTitle.value = props.data?.title;
    description.value = props.data?.description;
    examples.value = props.data?.examples || []
    loadSchemaContent();
  } else {
    resetschemas();
  }
  getAppFunc({name: 'updateData', func: saveData});
}, {
  immediate: true
});

onBeforeUnmount(() => {
  saveData(props.name);
});

</script>
<template>
  <div class="flex h-full overflow-y-scroll">
    <div class="p-2 flex-1 min-w-100 space-y-2">
      <Input
        v-model:value="schemaTitle"
        :error="validate && !schemaTitle"
        :maxlength="200"
        :bordered="false"
        class="font-medium"
        :placeholder="t('name')" />
      <Input
        v-model:value="description"
        type="textarea"
        :bordered="false"
        :maxlength="1000"
        :placeholder="t('desc')" />
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
              <ExampleBasic ref="exampleRef" :examples="examples" />
            </TabPane>
          </Tabs>
        </div>
    </div>
  </div>
</template>
