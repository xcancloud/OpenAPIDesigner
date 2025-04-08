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

type ExternalDoc = {
  url: string;
  description?: string;
};

interface Props {
  dataSource?: {
    externalDocs: ExternalDoc
  }
};

const props = withDefaults(defineProps<Props>(), {
  dataSource: () => ({
    externalDocs: {
      url: '',
      description: undefined
    }
  })
});



const formState = ref<ExternalDoc>({
  url: '',
  description: undefined
});


const getData = () => {
  const data = JSON.parse(JSON.stringify(formState.value));
  return data;
};

onMounted(() => {
  
  formState.value = props.dataSource?.externalDocs;
  easyMDE.value = new EasyMDE({
    element: descRef.value, 
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

  <FormItem label="URL" name="url" required>
    <Input
      v-model:value="formState.url"
      :maxlength="200"
      :placeholder="t('external_url_placeholder')" />
  </FormItem>

  <FormItem :label="t('desc')">
    <textarea ref="descRef">{{ formState.description }}</textarea>
  </FormItem>
</Form>
</template>