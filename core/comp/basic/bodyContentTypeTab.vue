<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';

import { parseSchemaObjToArr } from './utils';
import AddSchemeModel from './addSchemaModel.vue';

interface Props {
  contentType: string;
  data: Record<string, any>;
  viewType: boolean
}

const props = withDefaults(defineProps<Props>(), {
  contentType: '',
  data: () => ({}),
  viewType: false
});
const addSchemaModelRef = ref();
const activeTab = ref('model');
const modelType = ref();

const compRef = ref();

const disabledBodyModelType = computed(() => {
  return ['application/x-www-form-urlencoded',
    'multipart/form-data',
    'application/json',
    'application/octet-stream',
    'application/xml'].includes(props.contentType);
});

const objectAttrList = ref<{name: string, [key: string]: any}[]>([
]);

const getData = () => {
  const compData = addSchemaModelRef.value.getData();
  if (!compData) {
    return false;
  }
  const comp = {
    ...props.data,
    schema: compData
  };
  return {
    [props.contentType]: comp
  };
};

watch(() => props.data, () => {
  if (['array', 'object'].includes(props.data?.schema?.type)) {
    objectAttrList.value = parseSchemaObjToArr(props.data.schema, props.data.schema.required);
    modelType.value = props.data.schema.type;
  } else if (props.data?.schema?.type) {
    modelType.value = props.data.schema.type;
  } else if (!props.data?.schema?.type && !props.data?.schema?.$ref) {
    if (disabledBodyModelType.value && props.contentType !== 'application/octet-stream') {
      modelType.value = 'object';
    } else {
      modelType.value = 'string';
    }
  } else if (props.data?.schema?.$ref) {
    compRef.value = props.data?.schema?.$ref;
    modelType.value = undefined;
    activeTab.value = 'ref';
  }
  nextTick(() => {
    addSchemaModelRef.value && addSchemaModelRef.value.resetValues();
  });
}, {
  immediate: true,
  deep: true
});

defineExpose({
  getData
});
</script>
<template>
  <AddSchemeModel
    ref="addSchemaModelRef"
    :data="props.data.schema"
    :disabledType="disabledBodyModelType"
    :viewType="props.viewType" />
</template>
