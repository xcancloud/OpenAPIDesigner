<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, watch, onBeforeUnmount, inject } from 'vue';

const FormView = defineAsyncComponent(() => import('./formView/index.vue'));

const getAppFunc = inject('getAppFunc', (param: {name: string, func: Function})=>{});

interface Props {
  viewMode: 'form'|'code'|'preview';
  dataSource?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'form',
  dataSource: undefined
});

const formViewRef = ref();
const dataSource = inject('dataSource', ref());

const extensions = ref<{name: string, value?: string, oldName?: string}[]>([]);

onMounted(() => {
  watch(() => props.dataSource, (newValue) => {
    if (newValue) {
      extensions.value = [];
      Object.keys(newValue).forEach(key => {
        if (key.startsWith('x-')) {
          extensions.value.push({
            name: key,
            value: newValue[key]
          })
        }
      })
    } else {
      extensions.value = [];
    }
  }, {
    immediate: true
  });
  getAppFunc({name: 'updateData', func: saveData});
});

const saveData = () => {
  const extensionObj = formViewRef.value.getFormData();
  Object.assign(dataSource.value, extensionObj);
}

onBeforeUnmount(() => {
  saveData();
});

defineExpose({
  getData: () => {
    return formViewRef.value.getFormData();
  }
});

</script>
<template>
  <FormView ref="formViewRef" :dataSource="extensions" />
</template>
<style scoped>
.ant-tabs .ant-tabs-nav {
  display: none;
}

.ant-tabs .ant-tabs-content.ant-tabs-content-top {
  height: 100%;
}
</style>
