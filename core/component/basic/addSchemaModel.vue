<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { TabPane, Tabs } from 'ant-design-vue';

import { parseSchemaArrToObj, parseSchemaObjToArr } from './utils';
import AddAttrModal from './addAttrModal.vue';
import AttrItemList from './attrItemList.vue';

interface Props {
  data: {[key: string]: any},
  parentType?: 'object'|'array',
  modelType?: string;
  disabledType?: boolean;
  viewType: boolean;
  disabled: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({}),
  parentType: 'object',
  disabledType: false,
  viewType: false,
  disabled: false
});

const addVisible = ref(false);

const type = ref(); // 类型


const refComp = ref(); // 引用

const validate = ref(false);

const getData = () => {
  return parseSchemaArrToObj(objectAttrList.value);
};

const resetValues = () => {
  validate.value = false;
  type.value =  props.data.type;
  if (!['object', 'array'].includes(type.value)) {
    objectAttrList.value = [props.data];
  };
  refComp.value = props.data.$ref;

  if (type.value === 'object') {
    objectAttrList.value = parseSchemaObjToArr(props.data, props.data.required);
  } else if (type.value === 'array') {
    objectAttrList.value = parseSchemaObjToArr(props.data, props.data.required);
  }
};

// const schema = ref<Record<string, any>>({});
const objectAttrList = ref<{name: string, [key: string]: any}[]>([]);
const addFromType = ref<'object'|'array'>('object');
let currentAddNode;
const addAttr = (node = undefined) => {
  currentAddNode = node;
  addFromType.value = node ? node.type : type.value;
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

watch([() => type.value], () => {
  validate.value = false;
});

onMounted(() => {
  watch(() => props.name, () => {
    resetValues();
  }, {
    immediate: true
  })
});
defineExpose({
  resetValues,
  getData
});
</script>
<template>
<Tabs size="small">
  <TabPane tab="schemas" key="schemas">
    <AttrItemList
      :dataSource="objectAttrList"
      :disabled="props.disabled"
      :isRoot="true"
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
  </TabPane>
</Tabs>
</template>
