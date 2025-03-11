<script setup lang="ts">
import SiderMenu from './siderMenu/index.vue';

interface Props {
  api: string
}

withDefaults(defineProps<Props>(), {
  api: ''
});

</script>
<template>
  <div class="flex p-1 api-root min-w-200 overflow-auto h-full">
    <div class="w-80 bg-gray-100 h-full overflow-y-auto p-1">
      <!-- Left
      <Button type="primary">primary</Button> -->
      <SiderMenu />
    </div>
    <div class=" h-full overflow-y-auto">
      Right
    </div>
  </div>
</template>
<style>
.api-root{
  height: 100%;
  font-family:
    Inter,
    "Apple System",
    "SF Pro SC",
    "SF Pro Display",
    "Helvetica Neue",
    Arial,
    "PingFang SC",
    "Hiragino Sans GB",
    STHeiti,
    "Microsoft YaHei",
    "Microsoft JhengHei",
    "Source Han Sans SC",
    "Noto Sans CJK SC",
    "Source Han Sans CN",
    sans-serif;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
