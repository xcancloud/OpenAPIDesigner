<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Input, Select, Button, Popover, Switch, InputNumber } from 'ant-design-vue';
import { DeleteOutlined, ExclamationCircleOutlined, UnorderedListOutlined } from '@ant-design/icons-vue';
import { stringFormatOpt } from './config';

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

</script>
<template>
  <div class="h-full overflow-y-scroll text-center">
    <div class="w-200 mx-0 inline-block text-left mt-4">
      <div class="text-5 font-semibold"> Header </div>
      <ParameterBasic
        v-model:parameterPriorities="parameterPriorities"
        v-model:parameterObj="parameterObj"
        :refrence-btn-props="{show: false, disabled: true}"
        @del="handleDelete" />
    </div>
  </div>
</template>
