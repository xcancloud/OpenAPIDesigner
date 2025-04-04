<script setup lang="ts">
import { ref, watch, onMounted, computed, inject } from 'vue';
import { Input, Select, Button, Popover, Switch, InputNumber } from 'ant-design-vue';
import { DeleteOutlined, ExclamationCircleOutlined, UnorderedListOutlined, DisconnectOutlined } from '@ant-design/icons-vue';
import { stringFormatOpt } from './utils';

interface Props {
  parameterObj?: Record<string, any>;
  parameterPriorities?: Record<string, any>;
  refrenceBtnProps: {
    disabled: boolean;
    show: boolean;
  };
  requiredProps: {
    disabled: boolean;
  }
};

const props = withDefaults(defineProps<Props>(), {
  parameterObj: undefined,
  parameterPriorities: undefined,
  refrenceBtnProps: () => ({
    disabled: false,
    show: true
  }),
  requiredProps: () => ({
    disabled: false
  })
});

const emits = defineEmits<{
  (e: 'del'):void;
  (e: 'update:parameterObj', value:Record<string, any>):void;
  (e: 'update:parameterPriorities', value:Record<string, any>):void;
}>();

const dataSource = inject('dataSource', ref({}));

const refsOpt = computed(() => {
  const schemas = dataSource.value.components?.headers || {};
  return Object.keys(schemas).map(key => {
    return {
      label: key,
      value: `#/components/headers/${key}`,
      valueItem: {
        name: key,
        ...schemas[key]
      }
    }
  })
});

const parameterObj = ref<Record<string, any>>({
  description: '',
  required: false,
  name: '',
  style: '',
  allowEmptyValue: false,
  allowReserved: false,
  deprecated: undefined,
});

const parameterPriorities = ref<Record<string, any>>({
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
    maximum: undefined,
    minimum: undefined,
    $ref: undefined
})

const typeOpt = [
  {
    label: 'string',
    value: 'string'
  },
  {
    label: 'number',
    value: 'number'
  },
  {
    label: 'integer',
    value: 'integer'
  },
  {
    label: 'boolean',
    value: 'boolean'
  },
  {
    label: 'array',
    value: 'array'
  },
  {
    label: 'any',
    value: 'any'
  }
];

const handleChangeType = () => {
  parameterPriorities.value.format = '';
  parameterObj.value.style = '';
}

const handleRequired = () => {
  parameterObj.value.required = !parameterObj.value.required;
};

const parameterStyleOpt = {
  string: [{label: 'none', value: ''}, {label: 'form', value: 'form'}],
  number: [{label: 'none', value: ''}, {label: 'form', value: 'form'}],
  array: [{label: 'none', value: ''}, {label: 'form', value: 'form'}, {label: 'spaceDelimited', value: 'spaceDelimited'}, {label: 'pipeDelimited', value: 'pipeDelimited'}],
  boolean: undefined,
  integer: [{label: 'none', value: ''}, {label: 'form', value: 'form'}],
  any: [{label: 'none', value: ''}]
};


const parameterFormateOpt = {
  string: [{label: 'none', value: ''}, ...stringFormatOpt],
  any: [{label: 'none', value: ''}],
  number: [{label: 'none', value: ''}, {value: 'float', label: 'float'}, {value: 'double', label: 'double'},],
  integer: [{label: 'none', value: ''}, {label: 'int32', value: 'int32'}, {value: 'int64', label: 'int64'}],
  array: [{label: 'none', value: ''},],
  boolean: [{label: 'none', value: ''},]
};

const handleDelete = () => {
  emits('del');
};

const delRef = () => {
  parameterPriorities.value.$ref = undefined;
};

onMounted(() => {
  watch([() => props.parameterObj, () => props.parameterPriorities], () => {
    if (props.parameterObj) {
      parameterObj.value = props.parameterObj;
    } else {
      parameterObj.value = {
        description: '',
        required: false,
        name: '',
        style: '',
        allowEmptyValue: false,
        allowReserved: false,
        deprecated: undefined,
      }
    }

    if (props.parameterPriorities) {
      parameterPriorities.value = props.parameterPriorities;
    } else {
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
        maximum: undefined,
        minimum: undefined,
        $ref: undefined
      }
    }
  }, {
    immediate: true
  });
});

</script>

<template>
   <div class="flex items-center mt-2">
    <Input
      v-model:value="parameterObj.name"
      :maxlength="80"
      class="flex-1" />
    <Select
      v-model:value="parameterPriorities.type"
      :disabled="!!parameterPriorities.$ref"
      :options="typeOpt"
      class="w-30"
      @change="handleChangeType" />
    <Input
      v-model:value="parameterObj.description"
      :disabled="!!parameterPriorities.$ref"
      :maxlength="200"
      class="flex-1"
      placeholder="描述..." />
    
    <Popover trigger="click">
      <Button
        v-show="props.refrenceBtnProps.show"
        :type="parameterPriorities.$ref ? 'primary' : 'default'"
        class="px-1"
        :disabled="props.refrenceBtnProps.disabled">
        <DisconnectOutlined /> 
      </Button>
      <template #content>
        <div class="flex items-center space-x-2">
          <Select
            v-model:value="parameterPriorities.$ref"
            allowClear
            class="flex-1 min-w-40"
            :options="refsOpt" />
          <Button @click="delRef">Clear</Button>
        </div>
      </template>
    </Popover>
    <Button
      :type="parameterObj.required ? 'primary' : 'default'"
      class="px-1"
      :disabled="props.requiredProps.disabled || parameterPriorities.$ref"
      @click="handleRequired">
      <ExclamationCircleOutlined />
    </Button>
    <Button
      v-if="!!parameterPriorities.$ref"
      disabled
      class="px-1">
      <UnorderedListOutlined />
      </Button>
    <Popover trigger="click">
      <Button
        v-if="!parameterPriorities.$ref"
        class="px-1">
        <UnorderedListOutlined />
      </Button>
      <template #content>
        <div class="space-y-4">

          <div class="space-y-2">
            <div class="font-medium">parameter properties</div>
            <div class="flex items-start space-x-2">
              <div v-show="!!parameterStyleOpt[parameterObj.type]" class="space-y-1">
                <div>style</div>
                <Select 
                  v-model:value="parameterObj.style"
                  class="w-25"
                  :options="parameterStyleOpt[parameterObj.type]" />
              </div>
              <div class="space-y-1 text-center">
                <div>deprecated</div>
                <Switch v-model:checked="parameterObj.deprecated" size="small" />
              </div>
              <div class="space-y-1 text-center">
                <div>allowEmptyValue</div>
                <Switch v-model:checked="parameterObj.allowEmptyValue" size="small" />
              </div>
              <div class="space-y-1 text-center">
                <div>allowReserved</div>
                <Switch v-model:checked="parameterObj.allowReserved" size="small" />
              </div>
            </div>
          </div>


          <div class="space-y-2">
            <div class="font-medium">schema properties</div>

            <div class="flex space-x-2">
              <div class="flex-1 space-y-1">
                <div>format</div>
                <Select
                  v-model:value="parameterPriorities.format"
                  class="w-full"
                  :options="parameterFormateOpt[parameterObj.type]" />
              </div>
              <div class="flex-1 space-y-1">
                <div>default</div>
                <Input
                  v-model:value="parameterPriorities.default"
                  placeholder="default" />
              </div>
            </div>
            <div class="space-y-1">
              <div>enum</div>
              <Select
                v-model:value="parameterPriorities.enum"
                class="w-full"
                mode="tags"
                placeholder="type an option and press enter" />
            </div>
            <div class="space-y-1">
              <div>example</div>
              <Input
                v-model:value="parameterPriorities.example"
                placeholder="example" />
            </div>
          </div>


          <div v-show="['string'].includes(parameterPriorities.type)" class="space-y-2">
            <div class="font-medium">string properties</div>
            <div class="space-y-1">
              <div>pattern</div>
              <Input
                v-model:value="parameterPriorities.pattern"
                placeholder="^[A-Za-z0-9-_]+"/>
            </div>
            <div class="flex space-x-2">
              <div class="space-y-1 flex-1">
                <div>minLength</div>
                <InputNumber
                  v-model:value="parameterPriorities.minLength"
                  :min="0"
                  :step="1"
                  :precision="0"
                  placeholder=">=0"
                  class="w-full"/>
              </div>
              <div class="space-y-1 flex-1">
                <div>maxLength</div>
                <InputNumber
                  v-model:value="parameterPriorities.maxLength"
                  :min="0"
                  :step="1"
                  :precision="0"
                  placeholder=">=0"
                  class="w-full"/>
              </div>
            </div>
          </div>

          <div v-show="['number', 'integer'].includes(parameterPriorities.type)" class="space-y-2">
            <div class="font-medium">integer properties</div>
            <div class="flex space-x-2">
              <div class="space-y-1 flex-1">
                <div>minimum</div>
                <InputNumber
                  v-model:value="parameterPriorities.minimum"
                  :min="0"
                  :step="1"
                  :precision="0"
                  placeholder=">=0"
                  class="w-full" />
              </div>
              <div class="space-y-1">
                <div>exclusiveMin</div>
                <Switch
                  v-model:checked="parameterPriorities.exclusiveMin"
                  size="small" />
              </div>
            </div>

            <div class="flex space-x-2">
              <div class="space-y-1 flex-1">
                <div>maximum</div>
                <InputNumber
                  v-model:value="parameterPriorities.maximum"
                  :min="0"
                  :step="1"
                  :precision="0"
                  placeholder=">=0"
                  class="w-full" />
              </div>
              <div class="space-y-1">
                <div>exclusiveMax</div>
                <Switch
                  v-model:checked="parameterPriorities.exclusiveMax"
                  size="small" />
              </div>
            </div>

            <div>
              <div>multipleOf</div>
              <InputNumber
                v-model:value="parameterObj.multipleOf"
                :min="0"
                :step="1"
                :precision="0"
                placeholder=">=0"
                class="w-full" />
            </div>

          </div>

          <div v-show="['array'].includes(parameterPriorities.type)" class="space-y-2">
            <div class="font-medium">array properties</div>
            <div class="flex space-x-2">
              <div class="inline-flex space-x-1 items-center">
                <span>uniqueItems</span>
                <Switch
                  v-model:checked="parameterPriorities.uniqueItems"
                  size="small" />
              </div>
              <div class="inline-flex space-x-1 items-center">
                <span>deprecated</span>
                <Switch
                  v-model:checked="parameterPriorities.deprecated"
                  size="small" />
              </div>
            </div>
            <div class="flex space-x-2">
              <div class="space-y-1 flex-1">
                <div>minItems</div>
                <InputNumber
                  v-model:value="parameterPriorities.minItems"
                  :min="0"
                  :step="1"
                  :precision="0"
                  placeholder=">=0"
                  class="w-full"  />
              </div>
              <div class="space-y-1 flex-1">
                <div>maxItems</div>
                <InputNumber
                  v-model:value="parameterPriorities.maxItems"
                  :min="0"
                  :step="1"
                  :precision="0"
                  placeholder=">=0"
                  class="w-full"  />
              </div>
            </div>
          </div>
        </div>
      </template>
    </Popover>
    <Button
      class="px-1">
      <DeleteOutlined
      @click="handleDelete" />
    </Button>
  </div>
</template>