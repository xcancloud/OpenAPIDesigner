<script setup lang="ts">
import { ref, onMounted, inject, onBeforeUnmount } from 'vue';
import { Form, FormItem, Input, Select } from 'ant-design-vue';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css'

const getAppFunc = inject('getAppFunc', ()=>{});
const descRef = ref(); // 用于init markdown 编辑器
const easyMDE = ref();

type DocInfo = {
  title?: string;
  summary?: string;
  version?: string;
  description?: string;
  termsOfService?: string;
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  },
  license?: {
    name: string;
    identifier?: string;
    url?: string
  }
};

const formState = ref<DocInfo>({
  title: undefined,
  version: undefined,
  summary: undefined,
  description: undefined,
  termsOfService: undefined,
  contact: {
    name: undefined,
    url: undefined,
    email: undefined
  },
  license: {
    name: '',
    identifier: '',
    url: ''
  }
});


const licenseType = ref('identifier');
const licenseTypeOpt = [
  {
    label: 'URL',
    value: 'url',
  },
  {
    label: '标识符',
    value: 'identifier',
  }
];

const getData = () => {
  const data = JSON.parse(JSON.stringify(formState.value));
  const {contact, license} = data;
  if (!contact.name && !contact.url && !contact.email ) {
    delete data.contact;
  }

  if (!license.name) {
    delete data.contact;
  } else if (licenseType.value === 'identifier') {
    delete data.license.url;
  } else if (licenseType.value === 'url') {
    delete data.license.identifier;
  }
  return data;
};


onMounted(() => {
  easyMDE.value = new EasyMDE({
    element: descRef.value, 
    autoDownloadFontAwesome: true
  });
  getAppFunc({name: 'getDocInfoFormData', func: getData});
});

onBeforeUnmount(() => {
  getAppFunc({name: 'getDocInfoFormData', func: () => ({})});
});

defineExpose({
  getFormData: getData
})

</script>

<template>
<Form
layout="vertical">
  <div class="flex space-x-4">
    <FormItem label="标题" name="" required class="w-2/3">
      <Input
        v-model:value="formState.title"
        :maxlength="200"
        placeholder="接口文档标题，最多200个字符" />
    </FormItem>
    <FormItem label="版本" name="" required class="w-1/3">
      <Input
        v-model:value="formState.version" />
    </FormItem>
  </div>
  <FormItem label="摘要">
    <Input
      v-model:value="formState.summary"
      :maxlength="400"
      placeholder="接口文档摘要，最多400个字符" />
  </FormItem>
  <FormItem label="描述">
    <textarea ref="descRef"></textarea>
  </FormItem>
  <FormItem label="服务条款">
    <Input
      v-model:value="formState.termsOfService"
      :maxlength="400"
      placeholder="接口文档服务条款，必须以URI的形式表示，最多400个字符" />
  </FormItem>
  <FormItem label="联系人">
    <div class="flex space-x-2 pt-2 border-t">
      <Input
        v-model:value="formState.contact.name"
        :maxlength="200"
        class="flex-1/4"
        placeholder="联系人名称，最多200个字符" />
      <Input
        v-model:value="formState.contact.url"
        :maxlength="200"
        class="flex-1/2"
        placeholder="联系人URL，最多400个字符" />
      <Input
        v-model:value="formState.contact.email"
        :maxlength="100"
        class="flex-1/4"
        placeholder="联系人邮箱，最多100个字符" />
    </div>
  </FormItem>

  <FormItem label="许可">
    <div class="flex space-x-2 pt-2 border-t">
      <Input
        v-model:value="formState.license.name"
        :maxlength="200"
        class="flex-1/4"
        placeholder="许可名称，最多200个字符" />
      <Select
        v-model:value="licenseType"
        class="flex-1/4"
        :options="licenseTypeOpt" />
      <Input
        v-if="licenseType === 'url'"
        v-model:value="formState.license.url"
        :maxlength="100"
        class="flex-1/2" />
      <Input
        v-else
        v-model:value="formState.license.identifier"
        :maxlength="100"
        class="flex-1/2" />
    </div>
  </FormItem>
</Form>
</template>