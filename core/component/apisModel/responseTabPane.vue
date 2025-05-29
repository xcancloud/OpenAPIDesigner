<script setup lang="ts">
import { ref, defineAsyncComponent, inject, computed, onMounted, watch } from 'vue';
import { Select } from 'ant-design-vue';
import ResponseSchema from '../basic/responseSchema.vue';

const descRef = ref();
const EasyMd = defineAsyncComponent(() => import('@/common/easyMd/index.vue'));
const dataSource = inject('dataSource', ref());

interface Props {
  content: {[key: string]: any};
  description?: string;
  $ref?: string
};

const props = withDefaults(defineProps<Props>(), {
  content: () => ({}),
  description: undefined,
  $ref: undefined
});

const responseSchemaOpt = computed<{label: string; value: string; data: Props}[]>(() => {
  const response = dataSource.value?.components?.response || {};
  return Object.keys(response).map(key => {
    return {
      value: `#/components/responses/${key}`,
      label: key,
      data: response[key]
    }
  });
});
const refComp = ref();
const responseSchemaRef = ref();

const responseData = ref();

const resolveResponseSchema = (ref: string): Props => {
  const response = responseSchemaOpt.value.find(item => item.value === ref);
  if (response) {
    return response.data || {content: {}};
  }
  return {content: {}};
};

const getData = () => {
  if (refComp.value) {
    return {
      $ref: refComp.value
    }
  }
  const description = descRef.value.getValue();
  return {
    description,
    content: responseSchemaRef.value.getData()
  };
};

onMounted(() => {
  responseData.value = props;

  watch(() => responseData.value, () => {
    if (responseData.value.$ref) {
      refComp.value = responseData.value.$ref;
    }
  }, {
    immediate: true
  });
  watch(() => refComp.value, (newValue) => {
    if (newValue) {
      responseData.value = resolveResponseSchema(newValue)
    }
  }, {
    immediate: true
  })
})

defineExpose({
  getData
})
</script>
<template>
<div>
  <div class="flex justify-between mb-3">
    <div class="text-3.5 font-semibold">Response</div>
    <div>
      <Select
        v-model:value="refComp"
        class="w-50"
        :options="responseSchemaOpt" />
    </div>
  </div>
  <EasyMd :disabled="!!refComp" ref="descRef" :value="props.description" />
  <ResponseSchema
    ref="responseSchemaRef"
    :data="responseData"
    :disabled="!!refComp" />
</div>
</template>