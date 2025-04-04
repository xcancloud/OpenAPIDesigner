<script lang="ts" setup>
import { ref, watch } from 'vue';

import ParameterBasic from '../basic/parameterBasic.vue';

interface Props {
  name: string;
  data?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  name: '',
});

const emits = defineEmits<{(e: 'del'):void}>();

const parameterObj = ref<Record<string, any>>({
  in: 'query',
  description: '',
  required: false,
  name: '',
  style: '',
  allowEmptyValue: false,
  allowReserved: false,
  deprecated: undefined,

});

const resetParameterPriorities = (schema = {}) => {
  parameterPriorities.value = {
    format: '',
    default: undefined,
    enum: [],
    example: undefined,
    pattern: undefined,
    minLength: undefined,
    maxLength: undefined,
    multipleOf: undefined,
    exclusiveMin: undefined,
    exclusiveMax: undefined,
    uniqueItems: undefined,
    deprecated: undefined,
    minItems: undefined,
    maxItems: undefined,
    type: 'string',
    ...schema
  }
};

const resetParameterObj = (param = {}) => {
  parameterObj.value = {
    in: 'query',
    description: '',
    required: false,
    name: '',
    style: '',
    allowEmptyValue: false,
    allowReserved: false,
    deprecated: undefined,
    ...param
  }
}

const parameterPriorities = ref({
    format: '',
    default: undefined,
    enum: [],
    example: undefined,
    pattern: undefined,
    minLength: undefined,
    maxLength: undefined,
    multipleOf: undefined,
    exclusiveMin: undefined,
    exclusiveMax: undefined,
    uniqueItems: undefined,
    deprecated: undefined,
    minItems: undefined,
    maxItems: undefined,
    type: 'string',
})


const handleDelete = () => {
  emits('del');
};

const resetData = () => {
  resetParameterObj(props.data);
  resetParameterPriorities(props.data?.schema);
};

watch(() => props.name, () => {
  resetData();
}, {
  immediate: true
});

defineExpose({
  getData: () => {
    return {
      ...parameterObj.value,
      schema: parameterPriorities.value.$ref ? {
        $ref: parameterPriorities.value.$ref
      } : parameterPriorities.value
    }
  }
});

</script>
<template>
  <div class="h-full overflow-y-scroll text-center">
    <div class="flex items-center space-x-2 mt-2 text-3.5">
    </div>
    <div class="w-200 mx-0 inline-block text-left mt-4">
      <div class="text-5"> {{ `${parameterObj.in} Parameter` }} </div>
      <ParameterBasic
        v-model:parameterPriorities="parameterPriorities"
        v-model:parameterObj="parameterObj"
        @del="handleDelete" />
    </div>

    
  </div>
</template>
