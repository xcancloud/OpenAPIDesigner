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

// const parameterStyleOpt = {
//   string: [{label: 'none', value: ''}, {label: 'form', value: 'form'}],
//   number: [{label: 'none', value: ''}, {label: 'form', value: 'form'}],
//   array: [{label: 'none', value: ''}, {label: 'form', value: 'form'}, {label: 'spaceDelimited', value: 'spaceDelimited'}, {label: 'pipeDelimited', value: 'pipeDelimited'}],
//   boolean: undefined,
//   integer: [{label: 'none', value: ''}, {label: 'form', value: 'form'}],
//   any: [{label: 'none', value: ''}]
// };

// const parameterFormateOpt = {
//   string: [{label: 'none', value: ''}, ...stringFormatOpt],
//   any: [{label: 'none', value: ''}],
//   number: [{label: 'none', value: ''}, {value: 'float', label: 'float'}, {value: 'double', label: 'double'},],
//   integer: [{label: 'none', value: ''}, {label: 'int32', value: 'int32'}, {value: 'int64', label: 'int64'}],
//   array: [{label: 'none', value: ''},],
//   boolean: [{label: 'none', value: ''},]
// };

// const typeOpt = [
//   {
//     label: 'string',
//     value: 'string'
//   },
//   {
//     label: 'number',
//     value: 'number'
//   },
//   {
//     label: 'integer',
//     value: 'integer'
//   },
//   {
//     label: 'boolean',
//     value: 'boolean'
//   },
//   {
//     label: 'array',
//     value: 'array'
//   },
//   {
//     label: 'any',
//     value: 'any'
//   }
// ];

// const handleChangeType = () => {
//   parameterPriorities.value.format = '';
//   parameterObj.value.style = '';
// }

// const handleRequired = () => {
//   parameterObj.value.required = !parameterObj.value.required;
// };

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
