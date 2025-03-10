<script setup lang="ts">

interface Props {
  api: string
}

const props = withDefaults(defineProps<Props>(), {
  api: ''
})

</script>
<template>
  <div class="flex  p-2 api-root min-w-200 overflow-auto">
    <div class="w-80">Left</div>
    <div>Right</div>
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