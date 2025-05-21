<script setup lang="ts">
import { ref, defineAsyncComponent, onBeforeUnmount, inject } from 'vue';

const FormView = defineAsyncComponent(() => import('./formView/index.vue'));

const formViewRef = ref();

</script>
<template>
  <FormView ref="formViewRef" />
</template>
<style scoped>
.ant-tabs .ant-tabs-nav {
  display: none;
}
.ant-tabs .ant-tabs-content.ant-tabs-content-top {
  height: 100%;
}
</style>
