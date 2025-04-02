<script setup lang="ts">
import { ref, onMounted, inject, onBeforeUnmount, watch } from 'vue';
import { Form, FormItem, Input, Select, Button } from 'ant-design-vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css'

const getAppFunc = inject('getAppFunc', ()=>{});
const descRef = ref(); // 用于init markdown 编辑器
const easyMDE = ref();

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
  dataSource: () => []
});



const formState = ref<Server>({
    url: '',
    description: undefined,
    variables: [{name: '', value: {enum: [''], default: ''}}]
})

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
  const data = JSON.parse(JSON.stringify(formState.value));
  return data;
};

onMounted(() => {
  easyMDE.value = new EasyMDE({
    element: descRef.value, 
    autoDownloadFontAwesome: true
  });
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

onBeforeUnmount(() => {
  // getAppFunc({name: 'getDocInfoFormData', func: () => ({})});
});

defineExpose({
  getFormData: getData
})

</script>

<template>
<Form
  layout="vertical">
  <FormItem label="URL" name="url" required>
    <Input
      v-model:value="formState.url"
      :maxlength="400"
      placeholder="指向目标主机的URL，当在{大括号}中命名变量时，将进行变量替换，必须以URI的形式表示，最多400个字符" />
  </FormItem>

  <FormItem label="描述">
    <textarea ref="descRef">{{ formState.description }}</textarea>
  </FormItem>
  <FormItem>
    <template #label>
      <div class="flex space-x-4">
        <label>变量</label>
        <Button size="small" type="primary" @click="addVariable">添加变量</Button>
      </div>
    </template>
    <div v-for="(variable, varIdx) in formState.variables" class="border p-2 mb-2">
      <div class="flex space-x-2 items-center">
        <FormItem label="名称" class="w-1/3" required>
          <Input
            v-model:value="variable.name"
            :maxlength="100"
            placeholder="变量名称，最多100个字符" />
        </FormItem>
        <FormItem label="描述" class="w-2/3">
          <Input
            v-model:value="variable.description"
            :maxlength="400"
            placeholder="变量描述，最多400个字符" />
        </FormItem>
        <Button type="link" size="small" @click="deleteVariable(varIdx)"><delete-outlined /></Button>
      </div>
      <FormItem label="值" required>
        <div v-for="(_enumValue, idx) in variable.value.enum" class="flex mb-2">
          <Input
            v-model:value="variable.value.enum[idx]"
            class="w-1/3"
            placeholder="变量名称，最多100个字符" />
          <Button v-show="variable.value.enum?.length > 1" type="link" size="small" @click="deleteEnum(varIdx, idx)"><delete-outlined /></Button>
          <Button v-show="idx === 0" type="link" size="small" @click="addEnum(varIdx)"><plus-outlined /></Button>
        </div>
      </FormItem>
    </div>
  </FormItem>
</Form>
</template>