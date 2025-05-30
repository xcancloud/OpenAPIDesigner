<script setup lang="ts">
import { ref, onMounted, inject, onBeforeUnmount, defineAsyncComponent } from 'vue';
import { Form, FormItem, Input } from 'ant-design-vue';
// import { useI18n } from 'vue-i18n';

const getAppFunc = inject('getAppFunc', ()=>{});
const dataSource = inject('dataSource', ref());
const descRef = ref();
const EasyMd = defineAsyncComponent(() => import('@/common/easyMd/index.vue'));
// const { t } = useI18n();
// const i18n = inject('i18n');
// const { t } = i18n?.global;
// const t = inject('t');
const useLocal = inject('useLocal');
const language = inject('language', ref());
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
  const description = descRef.value.getValue();
  data.description = description;
  return data;
};

const saveData = () => {
  dataSource.value.externalDocs = getData();
}

onMounted(() => {
  formState.value = props.dataSource?.externalDocs || {
    url: '',
    description: undefined
  };
  getAppFunc({name: 'updateData', func: saveData});

});

onBeforeUnmount(() => {
  getAppFunc({name: 'updateData', func: null});
  saveData()
});

defineExpose({
  getData: getData
})

</script>

<template>
<Form
:model="formState"
layout="vertical">
  <FormItem label="URL" name="url" required>
    <Input
      v-model:value="formState.url"
      :maxlength="200"
      :placeholder="useLocal(language)('external_url_placeholder')" />
  </FormItem>

  <FormItem :label="useLocal(language)('desc')">
    <!-- <textarea ref="descRef">{{ formState.description }}</textarea> -->
    <EasyMd ref="descRef" :value="formState.description" />
  </FormItem>
</Form>
</template>