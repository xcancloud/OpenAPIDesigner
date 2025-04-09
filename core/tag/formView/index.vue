<script setup lang="ts">
import { ref, onMounted, inject, onBeforeUnmount } from 'vue';
import { Form, FormItem, Input } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css'

const getAppFunc = inject('getAppFunc', ()=>{});
const descRef = ref(); // 用于init markdown 编辑器
const easyMDE = ref();
const { t } = useI18n();

const externalDescRef = ref();
const externalEasyMDE = ref();

type Tag = {
  url: string;
  description?: string;
  externalDocs?: {
    url?: string;
    description?: string
  }
};

interface Props {
  dataSource: Tag[];
}

const props = withDefaults(defineProps<Props>(), {
  dataSource: () => []
})

const formState = ref<Tag>({
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
 
  formState.value = props.dataSource || {
    url: '',
    description: undefined,
    externalDocs: {
      url: undefined,
      description: undefined
    }
  }
  if (!formState.value.externalDocs) {
    formState.value.externalDocs = {
      url: undefined,
      description: undefined
    }
  }
  easyMDE.value = new EasyMDE({
    element: descRef.value, 
    autoDownloadFontAwesome: true
  });
  externalEasyMDE.value = new EasyMDE({
    element: externalDescRef.value, 
    autoDownloadFontAwesome: true
  });
  // easyMDE.value.value(formState.value.description);
  // externalEasyMDE.value.value(formState.value.externalDocs?.description);
  // getAppFunc({name: 'getDocInfoFormData', func: getData});
});

onBeforeUnmount(() => {
  // getAppFunc({name: 'getDocInfoFormData', func: () => ({})});
});

defineExpose({
  getData: getData
})

</script>

<template>
<Form
  layout="vertical">
  <FormItem :label="t('name')" name="name" required>
    <Input
      v-model:value="formState.name"
      :maxlength="200"
      :placeholder="t('tag_name_placeholder')" />
  </FormItem>

  <FormItem :label="t('desc')">
    <textarea ref="descRef">{{ formState.description }}</textarea>
  </FormItem>

  <FormItem :label="t('external_url')" required>
    <Input
      v-if="formState.externalDocs"
      v-model:value="formState.externalDocs.url"
      :maxlength="400"
      :placeholder="t('tag_external_url_placeholder')" />
  </FormItem>

  <FormItem :label="t('external_desc')" required>
    <textarea ref="externalDescRef">{{ formState.externalDocs?.description }}</textarea>
  </FormItem>

</Form>
</template>