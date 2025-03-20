<script lang="ts" setup>
import { inject, onMounted, ref, watch } from 'vue';
import { Button, TabPane, Tabs, Input, Select } from 'ant-design-vue';

import { parseSchemaArrToObj, parseSchemaObjToArr } from './utils';
import AddAttrModal from './addAttrModal.vue';
import AttrItemList from './attrItemList.vue';

interface Props {
  data: {[key: string]: any},
  parentType?: 'object'|'array',
  modelType?: string;
  disabledType?: boolean;
  viewType: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({}),
  parentType: 'object',
  disabledType: false,
  viewType: false
});

const serviceId = inject('serviceId');
const addVisible = ref(false);

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
        const schemaObj = parseSchemaArrToObj(JSON.parse(JSON.stringify(objectAttrList.value)), 'object');
        const data = {
          type: type.value,
          nullable: nullable.value,
          deprecated: deprecated.value,
          description: description.value,
          ...schemaObj
        };
        return data;
      }
      if (type.value === 'array') {
        const schemaObj = parseSchemaArrToObj(JSON.parse(JSON.stringify(objectAttrList.value)), 'array');
        const data = {
          type: type.value,
          nullable: nullable.value,
          deprecated: deprecated.value,
          minItems: minItems.value,
          maxItems: maxItems.value,
          description: description.value,
          items: schemaObj
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
  required.value = props.data.required || false;
  nullable.value = props.data.nullable || false;
  deprecated.value = props.data.deprecated || false;
  type.value = props.modelType || props.data.type;
  format.value = props.data.format;
  defaultValue.value = props.data.defaultValue;
  example.value = props.data.example || props.data?.example?.[0];
  minLength.value = props.data.minLength;
  maxLength.value = props.data.maxLength;
  minimum.value = props.data.minimum;
  maximum.value = props.data.maximum;
  minItems.value = props.data.minItems;
  maxItems.value = props.data.maxItems;
  enums.value = props.data.enum || [];
  description.value = props.data.description;
  refComp.value = props.data.$ref;
  const targetTypeOpt = dataTypeOpt.find(i => i.value === type.value);
  targetTypeOpt && changeType(type.value, targetTypeOpt);
  if (refComp.value) {
    activeTab.value = 'refs';
  }
  if (type.value === 'object') {
    objectAttrList.value = parseSchemaObjToArr(props.data, props.data.required);
  } else if (type.value === 'array') {
    objectAttrList.value = parseSchemaObjToArr(props.data, props.data.required);
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
  addFromType.value = addFromType.value = type;
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

const formatOpt = ref([]);

const changeType = (type, opt) => {
  format.value = undefined;
  defaultValue.value = undefined;
  example.value = undefined;
  formatOpt.value = (opt.format || []).map(i => ({ value: i, label: i }));
  objectAttrList.value = [];
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
defineExpose({
  resetValues,
  getData
});
</script>
<template>
  <Tabs
    v-model:activeKey="activeTab"
    size="small">
    <TabPane
      key="attr"
      tab="属性"
      :disabled="props.viewType">
      <div class="flex flex-col space-y-2">
        <Select
          v-model:value="type"
          placeholder="类型"
          :options="dataTypeOpt"
          :error="validate && activeTab === 'attr' && !type"
          :readonly="props.disabledType || props.viewType"
          @change="changeType" />
        <template v-if="['string', 'number', 'integer'].includes(type)">
          <Select
            v-model:value="format"
            placeholder="格式"
            :readonly="props.viewType"
            :options="formatOpt" />
          <Input
            v-model:value="defaultValue"
            :readonly="props.viewType"
            :maxlength="200"
            placeholder="默认值" />
          <Input
            v-model:value="example"
            :maxlength="200"
            :readonly="props.viewType"
            placeholder="示例值" />
        </template>
        <template v-if="type === 'boolean'">
          <Select
            v-model:value="defaultValue"
            placeholder="默认值"
            :allowClear="true"
            :readonly="props.viewType"
            :options="[{value: true, label: 'true'}, {value: false, label: 'false'}]" />
        </template>
        <template v-if="type==='string'">
          <Input
            v-model:value="pattern"
            :readonly="props.viewType"
            :maxlength="200"
            placeholder="pattern, ^[A-Za-z0-9-_]+" />
          <div class="flex items-center space-x-2">
            <Input
              v-model:value="minLength"
              dataType="number"
              :decimalPoint="0"
              :readonly="props.viewType"
              placeholder="最小长度" />
            <Input
              v-model:value="maxLength"
              dataType="number"
              :decimalPoint="0"
              :readonly="props.viewType"
              placeholder="最大长度" />
          </div>
          <div>
            <Button
              v-show="!props.viewType"
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
                :readonly="props.viewType"
                :maxlength="200"
                size="small"
                class="mt-1" />
              <Icon
                v-show="!props.viewType"
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
              :readonly="props.viewType"
              :min="-9007199254740992"
              :max="9007199254740992"
              placeholder="最小值" />
            <Input
              v-model:value="maximum"
              dataType="number"
              :readonly="props.viewType"
              :min="-9007199254740992"
              :max="9007199254740992"
              placeholder="最大值" />
          </div>
        </template>
        <template v-if="type === 'object'">
          <div class="obj-top relative font-medium text-3.5 mb-1">
            {{ type }}
            <span>{ {{ objectAttrList.length }} }</span>
            <Icon
              v-show="!props.viewType"
              icon="icon-tianjiamokuai"
              class="ml-2"
              @click="addAttr()" />
          </div>
          <AttrItemList
            :dataSource="objectAttrList"
            class="px-5"
            :parentType="type"
            :viewType="props.viewType"
            @add="addAttr"
            @del="delAttr"
            @edit="editAttr" />
        </template>
        <template v-if="type === 'array'">
          <div class="obj-top relative font-medium text-3.5 mb-1">
            {{ type }}
            <span>[ {{ objectAttrList.length }} ]</span>
            <Icon
              v-show="objectAttrList.length < 1 || !props.viewType"
              icon="icon-tianjiamokuai"
              class="ml-2"
              @click="addAttr()" />
          </div>
          <AttrItemList
            :dataSource="objectAttrList"
            :parentType="type"
            :viewType="props.viewType"
            class="px-5"
            @add="addAttr"
            @del="delAttr"
            @edit="editAttr" />
        </template>
        <!-- <Input
          v-model:value="description"
          placeholder="描述"
          type="textarea" /> -->
        <AddAttrModal
          v-model:visible="addVisible"
          :parentType="addFromType"
          :data="editAttrData"
          :excludesAttr="excludesAttr"
          @ok="changeAttrList"
          @cancel="closeModal" />
      </div>
    </TabPane>
    <!-- <TabPane
      key="refs"
      tab="引用"
      :disabled="props.viewType">
      <Select
        v-model:value="refComp"
        :action="`${ALTESTER}/services/${serviceId}/comp/type?ignoreModel=false`"
        :params="compParams"
        :fieldNames="{value: 'ref', label: 'key'}"
        class="w-full"
        placeholder="选择引用组件"
        :error="validate && activeTab === 'refs' && !refComp"
        @change="changeRef" />
    </TabPane> -->
  </Tabs>
</template>
