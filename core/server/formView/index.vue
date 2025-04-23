<script setup lang="ts">
import { ref, onMounted, inject, onBeforeUnmount, watch, defineAsyncComponent } from 'vue';
import { Form, FormItem, Input, Select, Button } from 'ant-design-vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
// import { useI18n } from 'vue-i18n';


const getAppFunc = inject('getAppFunc', ()=>{});
const descRef = ref(); // 用于init markdown 编辑器
const EasyMd = defineAsyncComponent(() => import('@/common/easyMd/index.vue'));
// const { t } = useI18n();
const i18n = inject('i18n');
const { t } = i18n?.global;

type Server = {
  url: string;
  description?: string;
  variables?: {
    name: string;
    value: {
      enum: string[];
      default: string;
      description?: string
    }
  }[]
};

interface Props {
  dataSource: {
    url: string;
    description?: string;
    variables: {
      [key: string]: {
        enum: string[];
        default: string;
        description?: string
      }
    }
  };
}

const props = withDefaults(defineProps<Props>(), {
  dataSource: () => ({
    url: '',
    variables: {}
  })
});



const formState = ref<Server>({
    url: '',
    description: undefined,
    variables: [{name: '', value: {enum: [''], default: ''}}]
});

const handleUrlChange = () => {
  const pathNames: string[] = formState.value.url.match(/{[^{}]+}/gi)?.map(i => i.replace(/{(\S*)}/gi, '$1')) || [];
  pathNames.forEach((name) => {
    if (!formState.value?.variables) {
      formState.value.variables = [
        {
          name,
          value: {
            enum: [''],
            default: ''
          }
        }
      ]
    } else {
      if (!formState.value.variables.find(item => item.name === name)) {
        formState.value.variables.push({
          name,
          value: {
            enum: [''],
            default: ''
          }
        })
      }
    }
  });
};

const deleteEnum = (varIdx: number, idx: number) => {
  formState.value.variables && formState.value.variables[varIdx].value.enum.splice(idx, 1);
};

const addEnum = (varIdx: number) => {
  formState.value.variables && formState.value.variables[varIdx].value.enum.push('');
};

const addVariable = () => {
  formState.value.variables?.push({
    name: '', value: {enum: [''], default: ''}
  });
};

const deleteVariable = (varIdx: number) => {
  formState.value.variables?.splice(varIdx, 1);
};

const getData = () => {
  const variables:Props['dataSource']['variables'] = {};
  formState.value.variables?.forEach(item => {
    if (item.name) {
      variables[item.name] = item.value;
    }
  });
  const data = {
    ...formState.value,
    variables
  };
  return data;
};

onMounted(() => {
  watch(() => props.dataSource, () => {
    formState.value = {
      ...props.dataSource,
      variables: Object.keys(props.dataSource?.variables || {}).map(key => {
        return {
          name: key,
          value: props.dataSource?.variables?.[key]
        }
      })
    };
  }, {
    immediate: true
  });
  // getAppFunc({name: 'getDocInfoFormData', func: getData});
});

defineExpose({
  getData: getData
})

</script>

<template>
<Form
  layout="vertical"
  :model="formState">
  <FormItem label="URL" name="url" required>
    <Input
      v-model:value="formState.url"
      :maxlength="400"
      :placeholder="t('server_name_placeholder')"
      @change="handleUrlChange" />
  </FormItem>

  <FormItem :label="t('desc')">
    <EasyMd ref="descRef" :value="formState.description" />
  </FormItem>
  <FormItem>
    <template #label>
      <div class="flex space-x-4">
        <label>{{ t('variable') }}</label>
        <Button size="small" class="text-3" type="primary" @click="addVariable">{{ t('add_variable') }}</Button>
      </div>
    </template>
    <div v-for="(variable, varIdx) in formState.variables" class="border p-2 mb-2">
      <div class="flex space-x-2 items-center">
        <FormItem :label="t('name')" class="w-1/3" required>
          <Input
            v-model:value="variable.name"
            :maxlength="100"
            :placeholder="t('variable_name_placeholder')" />
        </FormItem>
        <FormItem :label="t('desc')" class="w-2/3">
          <Input
            v-model:value="variable.description"
            :maxlength="400"
            :placeholder="t('variable_desc_placeholder')" />
        </FormItem>
        <Button type="link" size="small" @click="deleteVariable(varIdx)"><delete-outlined /></Button>
      </div>
      <FormItem :label="t('value')" required>
        <div v-for="(_enumValue, idx) in variable.value.enum" class="flex mb-2">
          <Input
            v-model:value="variable.value.enum[idx]"
            class="w-1/3"
            :placeholder="t('variable_value_placeholder')" />
          <Button v-show="variable.value.enum?.length > 1" type="link" size="small" @click="deleteEnum(varIdx, idx)"><delete-outlined /></Button>
          <Button v-show="idx === 0" type="link" size="small" @click="addEnum(varIdx)"><plus-outlined /></Button>
        </div>
      </FormItem>
    </div>
  </FormItem>
</Form>
</template>
