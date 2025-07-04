<script setup lang="ts">
import { ref, onMounted, inject, onBeforeUnmount, defineAsyncComponent, watch, computed } from 'vue';
import { Form, FormItem, Input, Select } from 'ant-design-vue';

const getAppFunc = inject('getAppFunc', (value: {name: string, func: Function})=>{});
const dataSource = inject('dataSource', ref());
const descRef = ref(); // 用于init markdown 编辑器
const EasyMd = defineAsyncComponent(() => import('@/common/easyMd/index.vue'));
const easyMdKey = ref(0);

// const i18n = inject('i18n');
// const { t } = i18n?.global;
// const t = inject('t');
const useLocal = inject('useLocal');
const language = inject('language', ref());
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
const licenseTypeOpt = computed(() =>[
  {
    label: 'URL',
    value: 'url',
  },
  {
    label: useLocal(language.value)('identifier'),
    value: 'identifier',
  }
]);

const getData = () => {
  const data = JSON.parse(JSON.stringify(formState.value));
  const description = descRef.value.getValue();
  const {contact, license} = data;
  data.description = description;
  if (contact && !contact.name && !contact.url && !contact.email ) {
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
  getAppFunc({name: 'updateData', func: saveData});
  watch(() => props.dataSource?.info, () => {
    easyMdKey.value += 1;
    formState.value = props.dataSource?.info || {};
    if (!formState.value.contact) {
      formState.value.contact = {
        name: undefined,
        url: undefined,
        email: undefined
      }
    }
    if (!formState.value.license) {
      formState.value.license = {
        name: '',
        identifier: '',
        url: ''
      }
    }
  }, {
    immediate: true
  });
});

const saveData = () => {
  dataSource.value.info = getData();
}

onBeforeUnmount(() => {
  getAppFunc({name: 'updateData', func: null});
  saveData();
});

defineExpose({
  getData: getData
});

</script>

<template>
<Form
class="ant-form-small"
layout="vertical">
  <div class="flex space-x-4">
    <FormItem :label="useLocal(language)('title')" name="" required class="w-2/3">
      <Input
        v-model:value="formState.title"
        :maxlength="200"
        :placeholder="useLocal(language)('title_placeholder')" />
    </FormItem>
    <FormItem :label="useLocal(language)('version')" name="" required class="w-1/3">
      <Input
        v-model:value="formState.version" />
    </FormItem>
  </div>
  <FormItem :label="useLocal(language)('summary')">
    <Input
      v-model:value="formState.summary"
      :maxlength="400"
      :placeholder="useLocal(language)('summary_placeholder')" />
  </FormItem>
  <FormItem :label="useLocal(language)('desc')">
    <EasyMd :key="easyMdKey" ref="descRef" :value="formState.description" />
  </FormItem>
  <FormItem :label="useLocal(language)('terms_service')">
    <Input
      v-model:value="formState.termsOfService"
      :maxlength="400"
      :placeholder="useLocal(language)('terms_service_placeholder')" />
  </FormItem>
  <FormItem :label="useLocal(language)('contact_name')">
    <div v-if="formState.contact" class="flex space-x-2 pt-2 border-t">
      <Input
        v-model:value="formState.contact.name"
        :maxlength="200"
        class="flex-1/4"
        :placeholder="useLocal(language)('contact_name_placeholder')" />
      <Input
        v-model:value="formState.contact.url"
        :maxlength="200"
        class="flex-1/2"
        :placeholder="useLocal(language)('contact_url_placeholder')" />
      <Input
        v-model:value="formState.contact.email"
        :maxlength="100"
        class="flex-1/4"
        :placeholder="useLocal(language)('contact_email_placeholder')" />
    </div>
  </FormItem>

  <FormItem :label="useLocal(language)('license')">
    <div v-if="formState.license" class="flex space-x-2 pt-2 border-t">
      <Input
        v-model:value="formState.license.name"
        :maxlength="200"
        class="flex-1/4"
        :placeholder="useLocal(language)('license_name_placeholder')" />
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
