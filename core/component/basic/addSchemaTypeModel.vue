<script lang="ts" setup>
import { inject, onMounted, ref, computed, watch } from 'vue';
import { Button, Switch, TabPane, Tabs, Input, Select } from 'ant-design-vue';


interface Props {
  data: {[key: string]: any},
  parentType: 'object'|null,
  addType?: 'attr'|'schema',
  modelType?: string;
  disabledSchema?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({}),
  parentType: null,
  addType: 'attr',
  disabledSchema: () => []
});

const dataSource = inject('dataSource', ref<{[key: string]: any}>({}));
const typeItems = ref<{[key: string]: any}[]>([]);
const refsOpt = computed(() => {
  const schemas = dataSource.value.components?.schemas || {};
  return Object.keys(schemas).map(key => {
    return {
      label: key,
      value: `#/components/schemas/${key}`,
      valueItem: {
        name: key,
        ...schemas[key]
      },
      disabled: props.disabledSchema.includes(key)
    }
  })
});


const enums = ref<string[]>([]); 
const combineTypeOpf = [{value: 'oneOf', label: 'one of'}, {value: 'anyOf', label: 'any of'}, {value: 'allOf', label: 'all of'},]

const validate = ref(false);
const validateData = () => {
  validate.value = true;
  return typeItems.value.every((i, idx) => {
    if (props.parentType && idx === 0) {
      if (!i.name) {
        return false;
      }
    }
    if (i.tab === 'type') {
      return !!i.type;
    }

    if (i.tab === 'refs') {
      return !!i.$ref;
    }

    if (i.tab === 'combine') {
      return !!i.combineType;
    }
  })
};

const formatItemData = (item: {[key: string]: any}): {[key: string]: any}=> {
  if (item.tab === 'type') {
      let examples: string[] = [];
      if (!item.type) {
        return undefined;
      }
      if (item.example && item.examples?.length) {
        item.examples = item.examples;
        item.examples[0] = item.example;
      } else if (item.example) {
        examples = [item.example];
      }
      if (item.type === 'string') {
        const data = {
          name: item.name,
          type: item.type,
          format: item.format,
          required: item.required,
          nullable: item.nullable,
          deprecated: item.deprecated,
          default: item.defaultValue,
          examples,
          enum: item.enums?.length ? item.enums : undefined,
          description: item.description
        };
        return data;
      }
      if (['integer', 'number'].includes(item.type)) {
        const data = {
          name: item.name,
          type: item.type,
          format: item.format,
          required: item.required,
          nullable: item.nullable,
          deprecated: item.deprecated,
          default: item.defaultValue,
          examples,
          enum: item.enums?.length ? item.enums : undefined,
          minimum: item.minimum,
          maximum: item.maximum,
          description: item.description
        };
        return data;
      }
      if (item.type === 'boolean') {
        const data = {
          name: item.name,
          type: item.type,
          format: item.format,
          required: item.required,
          nullable: item.nullable,
          deprecated: item.deprecated,
          default: item.defaultValue,
          description: item.description
        };
        return data;
      }
      if (item.type === 'object') {
        const data = {
          name: item.name,
          type: item.type,
          required: item.required,
          nullable: item.nullable,
          deprecated: item.deprecated,
          description: item.description
        };
        return data;
      }
      if (item.type === 'array') {
        const data = {
          name: item.name,
          type: item.type,
          required: item.required,
          nullable: item.nullable,
          deprecated: item.deprecated,
          minItems: item.minItems,
          maxItems: item.maxItems,
          description: item.description,
        };
        return data;
      }
  } else if (item.tab === 'refs') {
    const data = {
      name: item.name || item.$ref,
      $ref: item.$ref,
    };
    return data;
  } else if (item.tab === 'combine') {
    const data = {
      name: item.name,
      [item.combineType]: [],
      type: item.combineType,
    }
    return data;
  }
};

const getData = () => {
  if (validateData()) {
    let result:{[key: string]: any} | undefined;
    if (typeItems.value.length === 1) {
      result = formatItemData(typeItems.value[0]);
      if (!props.parentType && result && !result.$ref) {
        delete result.name;
      }
      if (props.data?.type === 'object' && result?.type === 'object') {
        result.children = props.data?.children;
        result.open = props.data.open;
      }
      if (combineTypeOpf.some(i => i.value === props.data?.type) && combineTypeOpf.some(i => i.value === result?.type)) {
        result.children = props.data?.children;
        result.open = props.data.open;
      }
    } else {
      const arrItems = typeItems.value.map(formatItemData).filter(Boolean);
      if (!props.parentType && arrItems[0] && !arrItems[0].$ref) {
        delete arrItems[0].name;
      }
      const showTypeArr = arrItems.map(i => i?.type || i?.$ref).reverse();
      const showType = showTypeArr.reduce((pre, cur) => {
        if (pre) {
          return `${cur}<${pre}>`;
        } else {
          return cur;
        }
      }, '');
      result = {
        ...arrItems[0],
        arrayItems: arrItems,
        name: arrItems[0]?.name || undefined,
        showType,
        typeList: showTypeArr,
        children: undefined,
        open: undefined,
        type: arrItems[arrItems.length - 1]?.type
      }
      if (arrItems.length === props.data?.arrayItems?.length) {
        if (props.data.type === 'object' && arrItems[arrItems.length - 1]?.type === 'object') {
          result.children = props.data.children;
          result.open = props.data.open;
        }
        if (combineTypeOpf.some(i => i.value === props.data.type) && props.data.type === arrItems[arrItems.length - 1]?.type) {
          result.children = props.data.children;
          result.open = props.data.open;
        }
      }
    }
    return result;
  }
  return false;
};

const resetValues = () => {
  validate.value = false;
  const data = JSON.parse(JSON.stringify(props.data));
  if (data?.arrayItems) {
    const {arrayItems, ...otherData} = data;
    const [first, ...others] = arrayItems;
    typeItems.value = [{name: otherData.name, ...first}, ...others];
  } else {
    typeItems.value = [data || {}];
  }
  if (typeItems.value[typeItems.value.length - 1].type === 'array') {
    typeItems.value.push({type: '', tab: 'type'});
  }
  typeItems.value.forEach((item) => {
    if (item.$ref) {
      item.tab = 'refs';
    } else if (combineTypeOpf.some(i => i.value === item.type)) {
      item.tab = 'combine';
      item.combineType = item.type;
      item.type = 'string';
    } else {
      item.tab = 'type';
    }
  });
};

type DataType = {label: string; value: string; format?: string[]};
const dataTypeOpt: DataType[] = [
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
const getFormatOpt = (type: string) => {
  return (dataTypeOpt.find(opt => opt.value === type)?.format || []).map(i => ({ value: i, label: i }));
};

const changeType = (type: string, opt: DataType, index: number) => {
  if (type === 'array') {
    typeItems.value.push({type: '', tab: 'type'});
  } else {
    typeItems.value.splice(index+1);
  }
};

const addEnums = (index: number) => {
  typeItems.value[index].enums.push('');
};

const deleteEnum = (index: number, idx: number) => {
  typeItems.value[index].enums.splice(idx, 1)
};

const changeRef = (refName: string, option: {name: string}, index: number) => {
  typeItems.value[index].$ref = refName;
  if (refName) {
    typeItems.value[index].type = undefined;
    typeItems.value.splice(index+1);
  }
};

onMounted(() => {
  resetValues();
});

defineExpose({
  resetValues,
  getData
});
</script>
<template>
  <div v-if="typeItems.length" v-for="(item, index) in typeItems">
    <Tabs v-model:activeKey="item.tab" v-show="index === 0 || typeItems?.[index - 1]?.tab === 'type'">
      <TabPane key="type" :tab="index > 0 ? 'SubType' : 'Type'">
          <Input
            v-if="!!props.parentType && index === 0"
            v-model:value="item.name"
            placeholder="参数名称"
            :class="{'border-status-error': validate && !item.name}"
            :maxLength="200" />
          <div v-if="index === 0 && !!props.parentType" class="flex items-center mt-2 space-x-1">
            <span>必填</span>
            <Switch
              v-model:checked="item.required"
              size="small" />
            <span class="pl-5">NULL</span>
            <Switch
              v-model:checked="item.nullable"
              size="small" />
            <span class="pl-5">弃用</span>
            <Switch
              v-model:checked="item.deprecated"
              size="small" />
          </div>
          <div class="flex flex-col space-y-2">
            <Select
              v-model:value="item.type"
              placeholder="类型"
              :options="dataTypeOpt"
              :class="{'error-ant-select': validate && item.tab === 'type' && !item.type}"
              @change="(...arg) => changeType(...arg, index)" />
            <template v-if="['string', 'number', 'integer'].includes(item.type)">
              <Select
                v-model:value="item.format"
                placeholder="格式"
                :options="getFormatOpt(item.type)" />
              <Input
                v-model:value="item.defaultValue"
                :maxlength="200"
                placeholder="默认值" />
              <Input
                v-model:value="item.example"
                :maxlength="200"
                placeholder="示例值" />
            </template>
            <template v-if="item.type === 'boolean'">
              <Select
                v-model:value="item.defaultValue"
                placeholder="默认值"
                :allowClear="true"
                :options="[{value: true, label: 'true'}, {value: false, label: 'false'}]" />
            </template>
            <template v-if="item.type==='string'">
              <Input
                v-model:value="item.pattern"
                :maxlength="200"
                placeholder="pattern, ^[A-Za-z0-9-_]+" />
              <div class="flex items-center space-x-2">
                <Input
                  v-model:value="item.minLength"
                  dataType="number"
                  :decimalPoint="0"
                  placeholder="最小长度" />
                <Input
                  v-model:value="item.maxLength"
                  dataType="number"
                  :decimalPoint="0"
                  placeholder="最大长度" />
              </div>
              <div>
                <Button
                  size="small"
                  @click="addEnums(index)">
                  Add Enum
                </Button>
                <div
                  v-for="(_item, idx) in item.enums"
                  :key="idx"
                  class="flex space-x-2 items-center">
                  <Input
                    v-model:value="enums[idx]"
                    :maxlength="200"
                    size="small"
                    class="mt-1" />
                  <Icon
                    icon="icon-qingchu"
                    @click="deleteEnum(index, idx)" />
                </div>
              </div>
            </template>
            <template v-if="['number', 'integer'].includes(item.type)">
              <div class="flex items-center space-x-2">
                <Input
                  v-model:value="item.minimum"
                  dataType="number"
                  :min="-9007199254740992"
                  :max="9007199254740992"
                  placeholder="最小值" />
                <Input
                  v-model:value="item.maximum"
                  dataType="number"
                  :min="-9007199254740992"
                  :max="9007199254740992"
                  placeholder="最大值" />
              </div>
            </template>
            <template v-if="item.type === 'array'">
              <Input
                v-model:value="item.minItems"
                dataType="number"
                :decimalPoint="0"
                placeholder="minItems" />
              <Input
                v-model:value="item.maxItems"
                dataType="number"
                :decimalPoint="0"
                placeholder="maxItems" />
            </template>
            <Input
              v-model:value="item.description"
              :maxlength="1000"
              placeholder="描述"
              type="textarea" />
          </div>
      </TabPane>
      <TabPane key="refs" tab="Components">
        <Input
          v-if="!!props.parentType && index === 0"
          v-model:value="item.name"
          placeholder="参数名称"
          class="mb-2"
          :class="{'border-status-error': validate && !item.name}"
          :maxLength="200" />
        <Select
          v-model:value="item.$ref"
          :options="refsOpt"
          :class="{'error-ant-select': index > 0 && validate && item.tab === 'refs' && !item.$ref}"
          class="w-full"
          @change="(...arg) => changeRef(...arg, index)" />
      </TabPane>
      <TabPane key="combine", tab="Combine Type">
        <Input
          v-if="!!props.parentType && index === 0"
          v-model:value="item.name"
          placeholder="参数名称"
          class="mb-2"
          :class="{'border-status-error': validate && !item.name}"
          :maxLength="200" />
        <Select
          v-model:value="item.combineType"
          allowClear
          class="w-full"
          :options="combineTypeOpf"/>
      </TabPane>
    </Tabs>
  </div>
  
</template>
<style scoped>
:deep(.error-ant-select) > .ant-select-selector {
  @apply border-status-error;
}
</style>
