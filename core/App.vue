
<script setup lang="ts">
import { Fragment, defineAsyncComponent, ref } from 'vue';
import SiderMenu from './siderMenu/index.vue';

export type Props = {
  api: string
}

const DocInfo = defineAsyncComponent(() => import('./docInfo/index.vue'));

const props =withDefaults(defineProps<Props>(), {
  api: ''
});

const activeMenuKey = ref();

</script>

<template>
  <div class="flex p-1 api-root min-w-200 overflow-auto">
    <div class="w-80 bg-gray-100 h-full overflow-y-auto p-1">
      <SiderMenu
        v-model:active-menu-key="activeMenuKey" />
      {{ props.api }}
    </div>
    <DocInfo v-if="activeMenuKey === 'docInfo'" class="flex-1 min-w-200 py-2 pl-2 h-full overflow-auto">
      <template #btns>
        <div>
          <slot name="docInfoButton"></slot>
        </div>
      </template>
    </DocInfo>
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
