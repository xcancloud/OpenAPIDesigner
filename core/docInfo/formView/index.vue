<script setup lang="ts">
import { ref, onMounted, inject, onBeforeUnmount, nextTick } from 'vue';
import { Form, FormItem, Input, Select } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';

const getAppFunc = inject('getAppFunc', ()=>{});
const descRef = ref(); // 用于init markdown 编辑器
const easyMDE = ref();
const { t } = useI18n();

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

interface Props {
  dataSource?: {
    info: DocInfo
  };
}

const props = withDefaults(defineProps<Props>(), {
  dataSource: undefined
});


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
  
  formState.value = props.dataSource?.info;
  nextTick(() => {
    easyMDE.value = new EasyMDE({
      element: descRef.value, 
      autoDownloadFontAwesome: false,
      maxHeight: '300px'
    });
  })

  getAppFunc({name: 'getDocInfoFormData', func: getData});
});

onBeforeUnmount(() => {
  getAppFunc({name: 'getDocInfoFormData', func: () => ({})});
});

defineExpose({
  getFormData: getData
});

</script>

<template>
<Form
layout="vertical">
  <div class="flex space-x-4">
    <FormItem :label="t('title')" name="" required class="w-2/3">
      <Input
        v-model:value="formState.title"
        :maxlength="200"
        :placeholder="t('title_placeholder')" />
    </FormItem>
    <FormItem :label="t('version')" name="" required class="w-1/3">
      <Input
        v-model:value="formState.version" />
    </FormItem>
  </div>
  <FormItem :label="t('summary')">
    <Input
      v-model:value="formState.summary"
      :maxlength="400"
      :placeholder="t('summary_placeholder')" />
  </FormItem>
  <FormItem :label="t('desc')">
    <textarea ref="descRef">{{ formState.description }}</textarea>
  </FormItem>
  <FormItem :label="t('terms_service')">
    <Input
      v-model:value="formState.termsOfService"
      :maxlength="400"
      :placeholder="t('terms_service_placeholder')" />
  </FormItem>
  <FormItem :label="t('contact_name')">
    <div v-if="formState.contact" class="flex space-x-2 pt-2 border-t">
      <Input
        v-model:value="formState.contact.name"
        :maxlength="200"
        class="flex-1/4"
        :placeholder="t('contact_name_placeholder')" />
      <Input
        v-model:value="formState.contact.url"
        :maxlength="200"
        class="flex-1/2"
        :placeholder="t('contact_url_placeholder')" />
      <Input
        v-model:value="formState.contact.email"
        :maxlength="100"
        class="flex-1/4"
        :placeholder="t('contact_email_placeholder')" />
    </div>
  </FormItem>

  <FormItem :label="t('license')">
    <div v-if="formState.license" class="flex space-x-2 pt-2 border-t">
      <Input
        v-model:value="formState.license.name"
        :maxlength="200"
        class="flex-1/4"
        :placeholder="t('lisence_name_placeholder')" />
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