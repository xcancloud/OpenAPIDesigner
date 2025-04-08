<script lang="ts" setup>
import { inject, ref, computed } from 'vue';
import { Tag } from 'ant-design-vue';

const dataSource = inject('dataSource', ref());

const docInfo = computed(() => {
  return dataSource.value?.info || {};
});
</script>
<template>
<div>
  <div class="text-8 font-semibold text-center">{{ docInfo.title }}</div>
  <Tag v-if="docInfo.version">{{ docInfo.version }}</Tag>
</div>
</template>