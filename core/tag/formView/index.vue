<script setup lang="ts">
import { ref, onMounted, inject, onBeforeUnmount } from 'vue';
import { Form, FormItem, Input, Select, Button } from 'ant-design-vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css'

const getAppFunc = inject('getAppFunc', ()=>{});
const descRef = ref(); // 用于init markdown 编辑器
const easyMDE = ref();

const externalDescRef = ref();
const externalEasyMDE = ref();

type ExternalDoc = {
  url: string;
  description?: string;
  externalDocs: {
    url?: string;
    description?: string
  }
};

const formState = ref<ExternalDoc>({
    url: '',
    description: undefined,
    externalDocs: {
      url: undefined,
      description: undefined
    }
})


const getData = () => {
  const data = JSON.parse(JSON.stringify(formState.value));
  return data;
};

onMounted(() => {
  easyMDE.value = new EasyMDE({
    element: descRef.value, 
    autoDownloadFontAwesome: true
  });
  externalEasyMDE.value = new EasyMDE({
    element: externalDescRef.value, 
    autoDownloadFontAwesome: true
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
  <FormItem label="名称" name="url" required>
    <Input
      v-model:value="formState.url"
      :maxlength="200"
      placeholder="标签名称，最多200个字符" />
  </FormItem>

  <FormItem label="描述">
    <textarea ref="descRef"></textarea>
  </FormItem>

  <FormItem label="外部文档URL" required>
    <Input
      v-model:value="formState.externalDocs.url"
      :maxlength="400"
      placeholder="标签外部接口文档链接地址，必须以URI的形式表示，最多400个字符" />
  </FormItem>

  <FormItem label="外部文档描述" required>
    <textarea ref="externalDescRef"></textarea>
  </FormItem>

</Form>
</template>