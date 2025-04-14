<script lang="ts" setup>
import { inject, ref, computed, onMounted, watch, defineAsyncComponent } from 'vue';
import { Tag } from 'ant-design-vue';

const EasyMd = defineAsyncComponent(() => import('@/components/easyMd/index.vue'));
const dataSource = inject('dataSource', ref());
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


const docInfo = computed<DocInfo>(() => {
  return dataSource.value?.info || {};
});

</script>
<template>
<div class="space-y-3">
  <div class="text-8 font-semibold text-center">{{ docInfo.title }}</div>
  <Tag v-if="docInfo.version">{{ docInfo.version }}</Tag>
  <div>
    <div class="leading-8 px-2 bg-gray-300">Additional Information</div>
    <div class="p-2 leading-7 bg-gray-200">
      <p v-if="docInfo?.contact?.email"><a :href="`mailto:${docInfo?.contact?.email}`">Contact {{docInfo?.contact?.email }}</a></p>
      <p v-if="docInfo?.contact?.url"><a :href="docInfo?.contact?.url">Contact {{docInfo?.contact?.url }}</a></p>
      <p v-if="docInfo?.license?.name"><a :href="docInfo?.license?.url"> {{docInfo?.license?.name }}</a></p>
      <p v-if="docInfo?.termsOfService"><a :href="docInfo?.termsOfService"> terms of service</a></p>
    </div>
  </div>

  <EasyMd :value="docInfo?.description" :preview="true" />
</div>
</template>