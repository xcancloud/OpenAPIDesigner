<script lang="ts" setup>
import { inject, onMounted, ref, watch } from 'vue';
// import { Icon,  } from '@xcan/design';
import { Button, Switch, TabPane, Tabs, Input, Select } from 'ant-design-vue';
// import { ALTESTER } from '@xcan/sdk';

interface Props {
  data: {[key: string]: any},
  parentType: 'object'|'array',
  addType?: 'attr'|'schema',
  modelType?: string
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({}),
  parentType: 'object',
  addType: 'attr'
});

const serviceId = inject('serviceId');

const name = ref();

const required = ref(false); // 必填？
const nullable = ref(false);
const deprecated = ref(false); // 弃用？

const type = ref(); // 类型
const format = ref(); // 格式
const defaultValue = ref(); // 默认值
const example = ref(); // 示例值
const minLength = ref(); // 最小长度
const maxLength = ref(); // 最大长度
const minimum = ref(); // 最小值
const maximum = ref(); // 最大值
const minItems = ref(); // 数组最小长度
const maxItems = ref(); // 数组最大长度

const enums = ref<string[]>([]); // 枚举list
const pattern = ref(); // regexp
const description = ref(); // 描述

const refComp = ref(); // 引用

const activeTab = ref('attr');

const validate = ref(false);
const validateData = () => {
  validate.value = true;
  if (!name.value && props.addType === 'attr') {
    return false;
  }
  if (activeTab.value === 'attr' && !type.value) {
    return false;
  }
  if (activeTab.value === 'refs' && !refComp.value) {
    return false;
  }
  return true;
};

const getData = () => {
  if (validateData()) {
    if (activeTab.value === 'attr') {
      let examples: string[] = [];
      if (example.value && props.data.examples?.length) {
        examples = props.data.examples;
        examples[0] = example.value;
      } else if (example.value) {
        examples = [example.value];
      }
      if (type.value === 'string') {
        const data = {
          name: name.value,
          type: type.value,
          format: format.value,
          required: required.value,
          nullable: nullable.value,
          deprecated: deprecated.value,
          default: defaultValue.value,
          examples,
          enum: enums.value.length ? enums.value : undefined,
          description: description.value
        };
        return data;
      }
      if (['integer', 'number'].includes(type.value)) {
        const data = {
          name: name.value,
          type: type.value,
          format: format.value,
          required: required.value,
          nullable: nullable.value,
          deprecated: deprecated.value,
          default: defaultValue.value,
          examples,
          enum: enums.value.length ? enums.value : undefined,
          minimum: minimum.value,
          maximum: maximum.value,
          description: description.value
        };
        return data;
      }
      if (type.value === 'boolean') {
        const data = {
          name: name.value,
          type: type.value,
          format: format.value,
          required: required.value,
          nullable: nullable.value,
          deprecated: deprecated.value,
          default: defaultValue.value,
          description: description.value
        };
        return data;
      }
      if (type.value === 'object') {
        const data = {
          name: name.value,
          type: type.value,
          required: required.value,
          nullable: nullable.value,
          deprecated: deprecated.value,
          description: description.value
        };
        return data;
      }
      if (type.value === 'array') {
        const data = {
          name: name.value,
          type: type.value,
          required: required.value,
          nullable: nullable.value,
          deprecated: deprecated.value,
          minItems: minItems.value,
          maxItems: maxItems.value,
          description: description.value
        };
        return data;
      }
    }
    if (activeTab.value === 'refs') {
      const data = {
        name: name.value,
        $ref: refComp.value
      };
      return data;
    }
  }
  return false;
};

const resetValues = () => {
  validate.value = false;
  activeTab.value = 'attr';
  name.value = props.parentType === 'object' ? props.data.name : 'items';
  required.value = props.data.required || false;
  nullable.value = props.data.nullable || false;
  deprecated.value = props.data.deprecated || false;
  type.value = props.modelType || props.data.type;
  if (type.value) {
    const targetTypeOpt = dataTypeOpt.find(i => i.value === type.value);
    changeType(type.value, targetTypeOpt);
  }
  format.value = props.data.format;
  defaultValue.value = props.data.defaultValue;
  example.value = props.data.example;
  if (!example.value && props.data?.example?.length) {
    example.value = props.data?.example[0];
  }
  minLength.value = props.data.minLength;
  maxLength.value = props.data.maxLength;
  minimum.value = props.data.minimum;
  maximum.value = props.data.maximum;
  minItems.value = props.data.minItems;
  maxItems.value = props.data.maxItems;
  enums.value = props.data.enum || [];
  description.value = props.data.description;
  refComp.value = props.data.$ref;
  if (refComp.value) {
    activeTab.value = 'refs';
  }
};

const dataTypeOpt = [
  {
    label: 'number',
    format: [
      'float',
      'double'
    ],
    value: 'number'
  },
  {
    label: 'integer',
    format: [
      'int32',
      'int64'
    ],
    value: 'integer'
  },

  {
    label: 'string',
    format: [
      'date-time', 'date', 'time', 'duration', 'email', 'idn-email', 'hostname', 'idn-hostname',
      'ipv4', 'ipv6', 'uri', 'uri-reference', 'iri', 'iri-reference', 'uuid', 'uri-template',
      'json-pointer', 'relative-json-pointer', 'regex', 'binary', 'byte', 'password'
    ],
    value: 'string'
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
    label: 'object',
    value: 'object'
  }
];

const formatOpt = ref([]);

const changeType = (type, opt) => {
  format.value = undefined;
  defaultValue.value = undefined;
  example.value = undefined;
  formatOpt.value = (opt.format || []).map(i => ({ value: i, label: i }));
};

const addEnums = () => {
  enums.value.push('');
};

const deleteEnum = (idx) => {
  enums.value.splice(idx, 1);
};

const changeRef = (_ref, option) => {
  name.value = option.key;
};

watch([() => type.value, activeTab.value], () => {
  validate.value = false;
});

const compParams = { types: ['schemas'] };
onMounted(() => {
  resetValues();
});
watch(() => props.modelType, newValue => {
  if (newValue) {
    type.value = newValue;
    const targetTypeOpt = dataTypeOpt.find(i => i.value === newValue);
    changeType(newValue, targetTypeOpt);
  }
}, {
  immediate: true
});
defineExpose({
  resetValues,
  getData
});
</script>
<template>
  <template v-if="props.addType === 'attr'">
    <Input
      v-model:value="name"
      placeholder="参数名称"
      :disabled="(!!refComp && activeTab === 'refs') || props.parentType === 'array'"
      :error="validate && !name"
      :maxlength="200"
      data-type="en"
      includes="-_." />
    <div class="flex items-center mt-2 space-x-1">
      <span>必填</span>
      <Switch
        v-model:checked="required"
        size="small" />
      <span class="pl-5">NULL</span>
      <Switch
        v-model:checked="nullable"
        size="small" />
      <span class="pl-5">弃用</span>
      <Switch
        v-model:checked="deprecated"
        size="small" />
    </div>
  </template>
  <Tabs
    v-if="props.addType === 'attr'"
    v-model:activeKey="activeTab"
    size="small">
    <TabPane
      key="attr"
      tab="属性">
    </TabPane>
    <TabPane
      key="refs"
      tab="引用">
      <!-- <Select
        v-model:value="refComp"
        :action="`${ALTESTER}/services/${serviceId}/comp/type?ignoreModel=false`"
        :params="compParams"
        :fieldNames="{value: 'ref', label: 'key'}"
        class="w-full"
        placeholder="选择引用组件"
        :error="validate && activeTab === 'refs' && !refComp"
        @change="changeRef" /> -->
    </TabPane>
  </Tabs>
  <template v-if="props.addType === 'schema' || activeTab === 'attr'">
    <div class="flex flex-col space-y-2">
      <template v-if="props.addType === 'attr'">
        <Select
          v-model:value="type"
          placeholder="类型"
          :options="dataTypeOpt"
          :error="validate && activeTab === 'attr' && !type"
          @change="changeType" />
      </template>
      <template v-if="['string', 'number', 'integer'].includes(type)">
        <Select
          v-model:value="format"
          placeholder="格式"
          :options="formatOpt" />
        <Input
          v-model:value="defaultValue"
          :maxlength="200"
          placeholder="默认值" />
        <Input
          v-model:value="example"
          :maxlength="200"
          placeholder="示例值" />
      </template>
      <template v-if="type === 'boolean'">
        <Select
          v-model:value="defaultValue"
          placeholder="默认值"
          :allowClear="true"
          :options="[{value: true, label: 'true'}, {value: false, label: 'false'}]" />
        <!-- <Select
          v-model:value="example"
          :options="[{value: true, label: 'true'}, {value: false, label: 'false'}]" /> -->
      </template>
      <template v-if="type==='string'">
        <Input
          v-model:value="pattern"
          :maxlength="200"
          placeholder="pattern, ^[A-Za-z0-9-_]+" />
        <div class="flex items-center space-x-2">
          <Input
            v-model:value="minLength"
            dataType="number"
            :decimalPoint="0"
            placeholder="最小长度" />
          <Input
            v-model:value="maxLength"
            dataType="number"
            :decimalPoint="0"
            placeholder="最大长度" />
        </div>
        <div>
          <Button
            size="small"
            @click="addEnums">
            Add Enum
          </Button>
          <div
            v-for="(_item, idx) in enums"
            :key="idx"
            class="flex space-x-2 items-center">
            <Input
              v-model:value="enums[idx]"
              :maxlength="200"
              size="small"
              class="mt-1" />
            <Icon
              icon="icon-qingchu"
              @click="deleteEnum(idx)" />
          </div>
        </div>
      </template>
      <template v-if="['number', 'integer'].includes(type)">
        <div class="flex items-center space-x-2">
          <Input
            v-model:value="minimum"
            dataType="number"
            :min="-9007199254740992"
            :max="9007199254740992"
            placeholder="最小值" />
          <Input
            v-model:value="maximum"
            dataType="number"
            :min="-9007199254740992"
            :max="9007199254740992"
            placeholder="最大值" />
        </div>
      </template>
      <template v-if="type === 'array'">
        <Input
          v-model:value="minItems"
          dataType="number"
          :decimalPoint="0"
          placeholder="minItems" />
        <Input
          v-model:value="maxItems"
          dataType="number"
          :decimalPoint="0"
          placeholder="maxItems" />
      </template>
      <Input
        v-model:value="description"
        :maxlength="1000"
        placeholder="描述"
        type="textarea" />
    </div>
  </template>
</template>
