<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';

// import { parseSchemaObjToArr } from './utils';
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


const disabledBodyModelType = computed(() => {
  return ['application/x-www-form-urlencoded',
    'multipart/form-data',
    'application/json',
    'application/octet-stream',
    'application/xml'].includes(props.contentType);
});

const getData = () => {
  const compData = addSchemaModelRef.value.getData();
  const comp = {
    ...props.data,
    schema: compData
  };
  return {
    [props.contentType]: comp
  };
};

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
