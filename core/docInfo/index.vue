<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, watch } from 'vue';

const FormView = defineAsyncComponent(() => import('./formView/index.vue'));

interface Props {
  viewMode: 'form'|'code'|'preview';
  dataSource?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'form',
  dataSource: () => ({})
});

const formViewRef = ref();

onMounted(() => {
  watch(() => props.dataSource, () => {

  }, {
    immediate: true
  })
});

</script>
<template>
  <FormView ref="formViewRef" />
</template>
<style>
:deep(.ant-tabs) .ant-tabs-nav {
  display: none;
}

:deep(.ant-tabs) .ant-tabs-content.ant-tabs-content-top {
  height: 100%;
}
</style>
