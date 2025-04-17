<script lang="ts" setup>
import { onMounted, ref, watch, defineAsyncComponent } from 'vue';
import { Input, Tag } from 'ant-design-vue';
import { methodColor } from './PropTypes';
import SecurityBasic from '../basic/securityBasic.vue';
import Extensions from '@/extensions/formView/index.vue';

const descRef = ref();
const EasyMd = defineAsyncComponent(() => import('@/common/easyMd/index.vue'));
interface Props {
    dataSource: {
        method: string;
        summary: string;
        operationId: string;
        description?: string;
        security?: Array<{[key: string]:string[]}>;
    },
    openapiDoc: {[key: string]: any};
}

const props = withDefaults(defineProps<Props>(), {
  dataSource: () => ({
    method: '',
    summary: '',
    operationId: '',
  }),
  openapiDoc: () => ({})
});

const securityRef = ref();
const extensionsRef = ref();

const data = ref<Props['dataSource']>({method: '', summary: '', operationId: ''});
const extensionData = ref<{name: string; value: string |null}[]>([]);

onMounted(() => {
  
  watch(() => props.dataSource, () => {
    data.value = props.dataSource;
    extensionData.value = Object.keys(props.dataSource || {}).map(key => {
      if (key.startsWith('x-')) {
        return {name: key, value: props.dataSource?.[key] && typeof props.dataSource?.[key] === 'string'
        ? props.dataSource?.[key]
        : props.dataSource?.[key] 
        ? JSON.stringify(props.dataSource?.[key])
        : null};
      }
      return null;
    }).filter(Boolean);
  }, {
    immediate: true,
    deep: true,
  });
});



const getData = () => {
  const _security = securityRef.value.getData();
  const description = descRef.value.getValue();
  const { summary, operationId } = data.value;
  const extensions = extensionsRef.value.getFormData();
  return {
    security: _security,
    summary,
    operationId,
    description,
    ...extensions
  };
};

defineExpose({
  getData
});
</script>
<template>
  <div class="px-2 space-y-3">
    <div class="space-y-3">
      <div class="flex items-center space-x-2">
        <Tag :color="methodColor[data.method]" class="h-8 leading-7 text-5">{{ data.method }}</Tag>
        <Input v-model:value="data.summary" :bordered="false" class="text-5" />
      </div>
      <div>
        <span class="font-medium">Operation ID</span> 
        <Input
          v-model:value="data.operationId"
          dataType="mixin-en" />
      </div>
      <div>
        <span class="text-4 font-medium"><Icon icon="icon-anquan" class="text-5" /> Description</span>
        <EasyMd ref="descRef" :value="data.description" />
      </div>
    </div>

    <SecurityBasic ref="securityRef" :dataSource="props.dataSource?.security"/>

    
    <Extensions ref="extensionsRef" :dataSource="extensionData" >
      <template #title>
        <span class="font-medium">Extensions</span> 
      </template>
    </Extensions>

  </div>
</template>
