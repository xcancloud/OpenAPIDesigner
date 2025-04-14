<script lang="ts" setup>
import { inject, ref, computed, defineAsyncComponent } from 'vue';

const EasyMd = defineAsyncComponent(() => import('@/common/easyMd/index.vue'));
const dataSource = inject('dataSource', ref());
type ExternalDoc = {
  url: string;
  description?: string;
};

const externalDocs = computed<ExternalDoc>(() => {
  return dataSource.value?.externalDocs || {};
});

</script>
<template>
<div class="space-y-3">
  <div class="font-semibold"><a :href="externalDocs.url">{{ externalDocs.url }}</a></div>
  <EasyMd :value="externalDocs?.description" :preview="true" />
</div>
</template>